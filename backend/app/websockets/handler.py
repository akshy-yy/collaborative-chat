from datetime import datetime, timezone, timedelta
from fastapi import WebSocket, WebSocketDisconnect, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.room import Room, RoomMember
from app.models.message import Message, MessageType, ConsensusStatus
from app.models.vote import Vote, VoteType
from app.models.project import Project
from app.websockets.manager import manager
from app.websockets.events import (
    make_joined_event, make_user_joined_event, make_user_left_event,
    make_message_event, make_typing_event, make_vote_update_event,
    make_vote_required_event, make_system_event
)
from app.services.change_classifier import change_classifier
from app.services.consensus_service import consensus_service, ROLE_WEIGHTS
import uuid


async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db),
):
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
    except Exception:
        await websocket.close(code=4001)
        return

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        await websocket.close(code=4001)
        return

    room_result = await db.execute(select(Room).where(Room.id == room_id))
    room = room_result.scalar_one_or_none()
    if not room or not room.is_active:
        await websocket.close(code=4004)
        return

    member_result = await db.execute(
        select(RoomMember).where(RoomMember.room_id == room_id, RoomMember.user_id == user_id)
    )
    member = member_result.scalar_one_or_none()
    if not member:
        await websocket.close(code=4003)
        return

    # role is now a plain string in SQLite models
    role = member.role
    await manager.connect(websocket, room_id, user_id, role, user.display_name)

    current_members = manager.get_room_members(room_id)
    await manager.send_to_websocket(websocket, make_joined_event(
        user={"user_id": user_id, "display_name": user.display_name, "role": role},
        members=current_members,
        room_id=room_id,
    ))

    await manager.broadcast_to_room(room_id, make_user_joined_event(
        user={"user_id": user_id, "display_name": user.display_name, "role": role}
    ), exclude_ws=websocket)
    await manager.broadcast_to_room(room_id, make_system_event(
        f"{user.display_name} joined as {role.replace('_', ' ').title()}"
    ), exclude_ws=websocket)

    proj_result = await db.execute(select(Project).where(Project.id == room.project_id))
    project = proj_result.scalar_one_or_none()

    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")

            if event_type == "message":
                content = data.get("content", "").strip()
                if not content:
                    continue

                msg_type_str = data.get("message_type", "chat")
                # Validate message type
                valid_types = [e.value for e in MessageType]
                msg_type_str = msg_type_str if msg_type_str in valid_types else "chat"

                parent_id = data.get("parent_id") or None

                change_cat_str = None
                consensus_stat_str = "pending"
                vote_deadline = None

                if msg_type_str == "suggestion":
                    consensus_stat_str = "pending_vote"
                    # Default auto-approve window logic will still apply if we have a project object, but for now we set the deadline to 24h as a fallback
                    vote_deadline = datetime.now(timezone.utc) + timedelta(hours=24)

                new_msg = Message(
                    room_id=room_id,
                    user_id=user_id,
                    content=content,
                    message_type=msg_type_str,
                    parent_id=parent_id,
                    change_category=change_cat_str,
                    consensus_status=consensus_stat_str,
                    vote_deadline=vote_deadline,
                )
                db.add(new_msg)
                await db.commit()
                await db.refresh(new_msg)

                msg_payload = {
                    "id": new_msg.id,
                    "room_id": room_id,
                    "user": {"id": user_id, "display_name": user.display_name},
                    "role": role,
                    "content": content,
                    "message_type": msg_type_str,
                    "parent_id": parent_id,
                    "change_category": change_cat_str,
                    "consensus_status": consensus_stat_str,
                    "vote_deadline": vote_deadline.isoformat() + "Z" if vote_deadline else None,
                    "upvotes": 0,
                    "downvotes": 0,
                    "user_vote": None,
                    "created_at": new_msg.created_at.isoformat() + "Z" if new_msg.created_at else datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                    "priority_weight": ROLE_WEIGHTS.get(role, 0),
                }
                await manager.broadcast_to_room(room_id, make_message_event(msg_payload))

                if consensus_stat_str == "pending_vote" and vote_deadline:
                    await manager.broadcast_to_room(room_id, make_vote_required_event(
                        message_id=new_msg.id,
                        content=content,
                        deadline=vote_deadline.isoformat() + "Z",
                        reason=change_cat_str or "review_required",
                    ))

            elif event_type == "typing":
                is_typing = data.get("is_typing", False)
                await manager.broadcast_to_room(
                    room_id,
                    make_typing_event(user_id, user.display_name, is_typing),
                    exclude_ws=websocket,
                )

            elif event_type == "vote":
                message_id_str = data.get("message_id")
                vote_type_str = data.get("vote_type")
                if not message_id_str or vote_type_str not in ("upvote", "downvote"):
                    continue

                existing_result = await db.execute(
                    select(Vote).where(Vote.message_id == message_id_str, Vote.user_id == user_id)
                )
                existing_vote = existing_result.scalar_one_or_none()
                if existing_vote:
                    existing_vote.vote_type = vote_type_str
                    db.add(existing_vote)
                else:
                    new_vote = Vote(
                        message_id=message_id_str,
                        user_id=user_id,
                        vote_type=vote_type_str,
                    )
                    db.add(new_vote)
                await db.commit()

                consensus_result = await consensus_service.calculate_consensus(db, message_id_str)

                msg_result = await db.execute(select(Message).where(Message.id == message_id_str))
                voted_msg = msg_result.scalar_one_or_none()
                if voted_msg and consensus_result["status"] in ("accepted", "rejected"):
                    voted_msg.consensus_status = consensus_result["status"]
                    db.add(voted_msg)
                    await db.commit()

                upvote_count = sum(1 for b in consensus_result["breakdown"] if b["vote"] == "upvote")
                downvote_count = sum(1 for b in consensus_result["breakdown"] if b["vote"] == "downvote")
                await manager.broadcast_to_room(room_id, make_vote_update_event(
                    message_id=message_id_str,
                    upvotes=upvote_count,
                    downvotes=downvote_count,
                    consensus_status=consensus_result["status"],
                    score=consensus_result["score"],
                    breakdown=consensus_result["breakdown"],
                ))

    except WebSocketDisconnect:
        meta = await manager.disconnect(websocket)
        if meta:
            await manager.broadcast_to_room(room_id, make_user_left_event(user_id, user.display_name))
            await manager.broadcast_to_room(room_id, make_system_event(f"{user.display_name} left the room"))
