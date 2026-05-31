from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.auth import UserRead


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    room_password: str
    role: str
    auto_approve_window_minutes: int = 10


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    auto_approve_window_minutes: Optional[int] = None


class ProjectRead(BaseModel):
    model_config = {"from_attributes": True}
    id: str
    name: str
    description: Optional[str] = None
    owner_id: Optional[str] = None
    invite_token: str
    status: str
    auto_approve_window_minutes: int
    created_at: Optional[datetime] = None


class ProjectJoin(BaseModel):
    room_password: str
    role: str          # plain string role value


class ProjectMemberRead(BaseModel):
    model_config = {"from_attributes": True}
    id: str
    project_id: str
    user: UserRead
    role: str
    joined_at: Optional[datetime] = None


class InviteLinkResponse(BaseModel):
    invite_url: str
    invite_token: str
