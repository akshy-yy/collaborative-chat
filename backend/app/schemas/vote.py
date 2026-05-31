from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class VoteCreate(BaseModel):
    vote_type: str   # "upvote" or "downvote"


class VoteBreakdownItem(BaseModel):
    role: str
    display_name: Optional[str] = None
    weight: int
    vote: str


class VoteSummary(BaseModel):
    message_id: str
    upvotes: int
    downvotes: int
    consensus_status: str
    score: float
    breakdown: list[VoteBreakdownItem]
    expires_at: Optional[datetime] = None
