from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_active_user, hash_password, verify_password
from app.models.project import Project, ProjectMember, RoleEnum
from app.models.user import User
from app.models.room import Room, RoomMember
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectRead, ProjectJoin, InviteLinkResponse
from typing import List

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/", response_model=List[ProjectRead])
async def list_projects(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    result = await db.execute(
        select(Project)
        .join(ProjectMember, ProjectMember.project_id == Project.id)
        .where(ProjectMember.user_id == current_user.id)
    )
    return [ProjectRead.model_validate(p) for p in result.scalars().all()]


@router.post("/", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    project = Project(
        name=data.name,
        description=data.description,
        owner_id=current_user.id,
        room_password_hash=hash_password(data.room_password),
        auto_approve_window_minutes=data.auto_approve_window_minutes,
    )
    db.add(project)
    await db.flush()
    # Creator becomes the role they selected
    member = ProjectMember(
        project_id=project.id,
        user_id=current_user.id,
        role=data.role,
    )
    db.add(member)
    await db.commit()
    await db.refresh(project)
    return ProjectRead.model_validate(project)


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(project_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectRead.model_validate(project)


@router.put("/{project_id}", response_model=ProjectRead)
async def update_project(project_id: str, data: ProjectUpdate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owner")
    if data.name:
        project.name = data.name
    if data.description is not None:
        project.description = data.description
    if data.auto_approve_window_minutes is not None:
        project.auto_approve_window_minutes = data.auto_approve_window_minutes
    await db.commit()
    await db.refresh(project)
    return ProjectRead.model_validate(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.owner_id == current_user.id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not owner")
    await db.delete(project)
    await db.commit()


@router.get("/{project_id}/invite-link", response_model=InviteLinkResponse)
async def get_invite_link(project_id: str, request: Request, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    base_url = str(request.base_url).rstrip("/").replace("8000", "3000")
    invite_url = f"{base_url}/join/{project.invite_token}"
    return InviteLinkResponse(invite_url=invite_url, invite_token=project.invite_token)


@router.post("/join/{invite_token}", response_model=ProjectRead)
async def join_project(invite_token: str, data: ProjectJoin, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    result = await db.execute(select(Project).where(Project.invite_token == invite_token))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Invalid invite link")
    if not verify_password(data.room_password, project.room_password_hash):
        raise HTTPException(status_code=403, detail="Incorrect room password")
    existing = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project.id,
            ProjectMember.user_id == current_user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already a member of this project")
    role_value = data.role if isinstance(data.role, str) else data.role.value
    member = ProjectMember(project_id=project.id, user_id=current_user.id, role=role_value)
    db.add(member)
    
    # Automatically add the new member to all existing rooms in the project
    rooms_result = await db.execute(select(Room).where(Room.project_id == project.id))
    for room in rooms_result.scalars().all():
        room_member = RoomMember(room_id=room.id, user_id=current_user.id, role=role_value)
        db.add(room_member)
        
    await db.commit()
    return ProjectRead.model_validate(project)


@router.get("/{project_id}/members", response_model=List[dict])
async def list_members(project_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    result = await db.execute(
        select(ProjectMember, User)
        .join(User, User.id == ProjectMember.user_id)
        .where(ProjectMember.project_id == project_id)
    )
    return [
        {
            "id": pm.id,
            "user": {"id": u.id, "email": u.email, "display_name": u.display_name},
            "role": pm.role,
            "joined_at": pm.joined_at.isoformat() if pm.joined_at else None,
        }
        for pm, u in result.all()
    ]
