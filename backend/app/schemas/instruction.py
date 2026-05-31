from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class InstructionCreate(BaseModel):
    instruction_type: str
    target: Optional[str] = None
    action: Optional[str] = None
    payload: dict[str, Any] = {}
    source_message_ids: list[str] = []


class InstructionUpdate(BaseModel):
    status: Optional[str] = None


class InstructionRead(BaseModel):
    model_config = {"from_attributes": True}
    id: str
    project_id: str
    room_id: Optional[str] = None
    instruction_type: str
    target: Optional[str] = None
    action: Optional[str] = None
    payload: dict = {}
    status: str
    source_message_ids: list = []
    created_at: Optional[datetime] = None
