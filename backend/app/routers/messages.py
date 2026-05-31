from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.message import Message
from app.models.room import Room, RoomMember
from app.models.vote import Vote
from app.models.user import User

router = APIRouter(prefix="/rooms/{room_id}/messages", tags=["messages"])


@router.get("/", response_model=List[dict])
async def get_messages(
    room_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    room_result = await db.execute(select(Room).where(Room.id == room_id))
    room = room_result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    msgs_result = await db.execute(
        select(Message, User, RoomMember)
        .outerjoin(User, User.id == Message.user_id)
        .outerjoin(
            RoomMember,
            (RoomMember.room_id == Message.room_id) & (RoomMember.user_id == Message.user_id),
        )
        .where(Message.room_id == room_id)
        .order_by(Message.created_at.asc())
        .offset(skip)
        .limit(limit)
    )
    rows = msgs_result.all()

    result_list = []
    for msg, user, room_member in rows:
        votes_result = await db.execute(select(Vote).where(Vote.message_id == msg.id))
        votes = votes_result.scalars().all()
        upvotes = sum(1 for v in votes if v.vote_type == "upvote")
        downvotes = sum(1 for v in votes if v.vote_type == "downvote")
        user_vote_list = [v.vote_type for v in votes if v.user_id == current_user.id]
        result_list.append({
            "id": msg.id,
            "room_id": msg.room_id,
            "user": {"id": user.id, "display_name": user.display_name, "email": user.email} if user else None,
            "role": room_member.role if room_member else None,
            "content": msg.content,
            "message_type": msg.message_type,
            "parent_id": msg.parent_id,
            "change_category": msg.change_category,
            "consensus_status": msg.consensus_status,
            "vote_deadline": msg.vote_deadline.isoformat() + "Z" if msg.vote_deadline else None,
            "upvotes": upvotes,
            "downvotes": downvotes,
            "user_vote": user_vote_list[0] if user_vote_list else None,
            "created_at": msg.created_at.isoformat() + "Z" if msg.created_at else None,
        })
    return result_list


@router.delete("/")
async def clear_room_messages(
    room_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    room_result = await db.execute(select(Room).where(Room.id == room_id))
    room = room_result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Keep existing access pattern consistent with this router: authenticated user + valid room.
    await db.execute(delete(Message).where(Message.room_id == room_id))
    await db.commit()
    return {"message": "Chat cleared"}
