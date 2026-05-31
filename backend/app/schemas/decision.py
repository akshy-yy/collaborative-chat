from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DecisionCreate(BaseModel):
    description: str
    instruction_id: Optional[str] = None


class DecisionUpdate(BaseModel):
    status: str   # "accepted", "rejected", or "pending"


class DecisionRead(BaseModel):
    model_config = {"from_attributes": True}
    id: str
    project_id: str
    instruction_id: Optional[str] = None
    description: str
    status: str
    decided_at: Optional[datetime] = None
    decided_by: Optional[str] = None
    created_at: Optional[datetime] = None
