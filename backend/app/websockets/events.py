from pydantic import BaseModel
from typing import Optional, Any


class WSMessageEvent(BaseModel):
    type: str = "message"
    content: str
    message_type: str = "chat"
    parent_id: Optional[str] = None


class WSTypingEvent(BaseModel):
    type: str = "typing"
    is_typing: bool


class WSVoteEvent(BaseModel):
    type: str = "vote"
    message_id: str
    vote_type: str


def make_system_event(content: str) -> dict:
    return {"type": "system", "content": content}


def make_joined_event(user: dict, members: list, room_id: str) -> dict:
    return {"type": "joined", "user": user, "members": members, "room_id": room_id}


def make_user_joined_event(user: dict) -> dict:
    return {"type": "user_joined", "user": user}


def make_user_left_event(user_id: str, display_name: str) -> dict:
    return {"type": "user_left", "user_id": user_id, "display_name": display_name}


def make_message_event(message: dict) -> dict:
    return {"type": "message", "message": message}


def make_typing_event(user_id: str, display_name: str, is_typing: bool) -> dict:
    return {"type": "typing", "user_id": user_id, "display_name": display_name, "is_typing": is_typing}


def make_vote_update_event(message_id: str, upvotes: int, downvotes: int, consensus_status: str, score: float, breakdown: list) -> dict:
    return {"type": "vote_update", "message_id": message_id, "upvotes": upvotes, "downvotes": downvotes, "consensus_status": consensus_status, "score": score, "breakdown": breakdown}


def make_vote_required_event(message_id: str, content: str, deadline: str, reason: str) -> dict:
    return {"type": "vote_required", "message_id": message_id, "content": content, "deadline": deadline, "reason": reason}


def make_consensus_update_event(instruction: dict) -> dict:
    return {"type": "consensus_update", "instruction": instruction}
