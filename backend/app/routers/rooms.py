from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.room import Room, RoomMember
from app.models.project import ProjectMember
from app.models.user import User
from app.schemas.room import RoomCreate, RoomRead

router = APIRouter(prefix="/projects/{project_id}/rooms", tags=["rooms"])


async def _check_project_membership(project_id: str, user_id: str, db: AsyncSession):
    result = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member of this project")
    return member


@router.get("/", response_model=List[RoomRead])
async def list_rooms(project_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    await _check_project_membership(project_id, current_user.id, db)
    result = await db.execute(select(Room).where(Room.project_id == project_id, Room.is_active == True))
    return [RoomRead.model_validate(r) for r in result.scalars().all()]


@router.post("/", response_model=RoomRead, status_code=status.HTTP_201_CREATED)
async def create_room(project_id: str, data: RoomCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    member = await _check_project_membership(project_id, current_user.id, db)
    room = Room(project_id=project_id, name=data.name, description=data.description)
    db.add(room)
    await db.flush()
    
    project_members = await db.execute(select(ProjectMember).where(ProjectMember.project_id == project_id))
    for pm in project_members.scalars().all():
        room_member = RoomMember(room_id=room.id, user_id=pm.user_id, role=pm.role)
        db.add(room_member)
        
    await db.commit()
    await db.refresh(room)
    return RoomRead.model_validate(room)


@router.get("/{room_id}", response_model=RoomRead)
async def get_room(project_id: str, room_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    await _check_project_membership(project_id, current_user.id, db)
    result = await db.execute(select(Room).where(Room.id == room_id, Room.project_id == project_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return RoomRead.model_validate(room)


@router.get("/{room_id}/members")
async def get_room_members(project_id: str, room_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    await _check_project_membership(project_id, current_user.id, db)
    result = await db.execute(
        select(RoomMember, User)
        .join(User, User.id == RoomMember.user_id)
        .where(RoomMember.room_id == room_id)
    )
    return [
        {
            "id": rm.id,
            "user": {"id": u.id, "display_name": u.display_name, "email": u.email},
            "role": rm.role,
            "joined_at": rm.joined_at.isoformat() if rm.joined_at else None,
        }
        for rm, u in result.all()
    ]


@router.post("/{room_id}/join")
async def join_room(project_id: str, room_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    member = await _check_project_membership(project_id, current_user.id, db)
    room_result = await db.execute(select(Room).where(Room.id == room_id))
    room = room_result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    existing = await db.execute(
        select(RoomMember).where(RoomMember.room_id == room_id, RoomMember.user_id == current_user.id)
    )
    if existing.scalar_one_or_none():
        return {"message": "Already in room"}
    room_member = RoomMember(room_id=room_id, user_id=current_user.id, role=member.role)
    db.add(room_member)
    await db.commit()
    return {"message": "Joined room successfully"}


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_room(project_id: str, room_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    result = await db.execute(select(Room).where(Room.id == room_id, Room.project_id == project_id))
    room = result.scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    room.is_active = False
    await db.commit()
