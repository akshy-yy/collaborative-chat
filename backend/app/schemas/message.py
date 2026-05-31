from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.auth import UserRead


class MessageCreate(BaseModel):
    content: str
    message_type: str = "chat"
    parent_id: Optional[str] = None


class MessageRead(BaseModel):
    model_config = {"from_attributes": True}
    id: str
    room_id: str
    user: Optional[UserRead] = None
    role: Optional[str] = None
    content: str
    message_type: str
    parent_id: Optional[str] = None
    change_category: Optional[str] = None
    consensus_status: str
    vote_deadline: Optional[datetime] = None
    upvotes: int = 0
    downvotes: int = 0
    user_vote: Optional[str] = None
    created_at: Optional[datetime] = None
