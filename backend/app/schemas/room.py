from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.auth import UserRead


class RoomCreate(BaseModel):
    name: str
    description: Optional[str] = None


class RoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class RoomRead(BaseModel):
    model_config = {"from_attributes": True}
    id: str
    project_id: str
    name: str
    description: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None


class RoomMemberRead(BaseModel):
    model_config = {"from_attributes": True}
    id: str
    room_id: str
    user: UserRead
    role: str
    joined_at: Optional[datetime] = None
