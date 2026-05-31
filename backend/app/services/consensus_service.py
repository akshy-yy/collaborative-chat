from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.vote import Vote, VoteType
from app.models.room import RoomMember
from app.models.message import Message, ConsensusStatus, ChangeCategory
from app.models.project import ProjectMember

ROLE_WEIGHTS = {
    "principal_investigator": 5,
    "supervisor": 4,
    "reviewer": 3,
    "postdoc": 3,
    "phd_student": 2,
    "co_author": 2,
    "designer": 2,
    "observer": 0,
}


class ConsensusService:
    async def calculate_consensus(self, db: AsyncSession, message_id: str) -> dict:
        votes_result = await db.execute(
            select(Vote, RoomMember)
            .join(RoomMember, (RoomMember.user_id == Vote.user_id))
            .join(Message, Message.id == Vote.message_id)
            .where(Vote.message_id == message_id, RoomMember.room_id == Message.room_id)
        )
        votes_with_roles = votes_result.all()

        msg_result = await db.execute(select(Message).where(Message.id == message_id))
        message = msg_result.scalar_one_or_none()
        if not message:
            return {"status": "pending", "score": 0.0, "breakdown": []}

        room_members_result = await db.execute(
            select(RoomMember).where(RoomMember.room_id == message.room_id)
        )
        room_members = room_members_result.scalars().all()

        # role is now a plain string — no .value needed
        eligible_members = [m for m in room_members if ROLE_WEIGHTS.get(m.role, 0) > 0]
        eligible_member_count = len(eligible_members)
        total_eligible_weight = sum(ROLE_WEIGHTS.get(m.role, 0) for m in eligible_members)
        upvote_weight = 0.0
        downvote_weight = 0.0
        breakdown = []

        voted_users = set()
        for vote, member in votes_with_roles:
            weight = ROLE_WEIGHTS.get(member.role, 0)
            # Double weight for PI/Supervisor on structural changes
            if member.role in ("principal_investigator", "supervisor") and message.change_category == "structural_change":
                weight = weight * 2
            if vote.vote_type == "upvote":
                upvote_weight += weight
            else:
                downvote_weight += weight
            voted_users.add(vote.user_id)
            breakdown.append({
                "role": member.role,
                "user_id": vote.user_id,
                "weight": weight,
                "vote": vote.vote_type,
            })

        score = upvote_weight / total_eligible_weight if total_eligible_weight > 0 else 0.0
        status = "pending_vote"
        if eligible_member_count <= 2:
            if len(voted_users) == eligible_member_count and downvote_weight == 0 and upvote_weight > 0:
                status = "accepted"
            elif downvote_weight > 0:
                status = "rejected"
        else:
            # For rooms with more than 2 eligible voters, weighted majority decides.
            if upvote_weight > (total_eligible_weight / 2):
                status = "accepted"
            elif downvote_weight > (total_eligible_weight / 2):
                status = "rejected"

        return {
            "status": status,
            "score": round(score, 3),
            "upvote_weight": upvote_weight,
            "downvote_weight": downvote_weight,
            "total_eligible_weight": total_eligible_weight,
            "breakdown": breakdown,
            "expires_at": message.vote_deadline.isoformat() if message.vote_deadline else None,
        }

    async def check_auto_approve_eligible(self, db: AsyncSession, message: Message, window_minutes: int) -> bool:
        if message.change_category != "improvement":
            return False
        if message.consensus_status != "pending":
            return False
        # SQLite stores datetimes as naive; treat as UTC
        created = message.created_at
        if created.tzinfo is None:
            from datetime import timezone as tz
            created = created.replace(tzinfo=tz.utc)
        age_seconds = (datetime.now(timezone.utc) - created).total_seconds()
        return age_seconds >= window_minutes * 60

    async def process_pending_auto_approvals(self, db: AsyncSession):
        from app.models.project import Project
        from app.models.room import Room
        result = await db.execute(
            select(Message, Room, Project)
            .join(Room, Room.id == Message.room_id)
            .join(Project, Project.id == Room.project_id)
            .where(
                Message.message_type == "suggestion",
                Message.change_category == "improvement",
                Message.consensus_status == "pending",
            )
        )
        rows = result.all()
        updated = []
        for message, room, project in rows:
            if await self.check_auto_approve_eligible(db, message, project.auto_approve_window_minutes):
                message.consensus_status = "auto_approved"
                db.add(message)
                updated.append(message.id)
        if updated:
            await db.commit()
        return updated


consensus_service = ConsensusService()
