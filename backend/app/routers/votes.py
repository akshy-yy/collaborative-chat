from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.vote import Vote, VoteType
from app.models.message import Message
from app.models.room import RoomMember
from app.schemas.vote import VoteCreate
from app.services.consensus_service import consensus_service

router = APIRouter(prefix="/messages/{message_id}/vote", tags=["votes"])


@router.post("/")
async def cast_vote(
    message_id: str,
    data: VoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    msg_result = await db.execute(select(Message).where(Message.id == message_id))
    message = msg_result.scalar_one_or_none()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    member_result = await db.execute(
        select(RoomMember).where(RoomMember.room_id == message.room_id, RoomMember.user_id == current_user.id)
    )
    member = member_result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=403, detail="Not a room member")
    if member.role == "observer":
        raise HTTPException(status_code=403, detail="Observers cannot vote")

    vote_type_str = data.vote_type if isinstance(data.vote_type, str) else data.vote_type.value

    existing_result = await db.execute(
        select(Vote).where(Vote.message_id == message_id, Vote.user_id == current_user.id)
    )
    existing_vote = existing_result.scalar_one_or_none()

    if existing_vote:
        existing_vote.vote_type = vote_type_str
        db.add(existing_vote)
    else:
        new_vote = Vote(
            message_id=message_id,
            user_id=current_user.id,
            vote_type=vote_type_str,
        )
        db.add(new_vote)
    await db.commit()

    consensus_result = await consensus_service.calculate_consensus(db, message_id)
    return {"message": "Vote recorded", "consensus": consensus_result}
