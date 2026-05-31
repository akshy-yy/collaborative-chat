import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON
from app.core.database import Base


class MessageType(str, enum.Enum):
    chat = "chat"
    feedback = "feedback"
    suggestion = "suggestion"
    approval = "approval"
    objection = "objection"
    system = "system"


class ChangeCategory(str, enum.Enum):
    improvement = "improvement"
    neutral = "neutral"
    potentially_degrading = "potentially_degrading"
    structural_change = "structural_change"


class ConsensusStatus(str, enum.Enum):
    pending = "pending"
    auto_approved = "auto_approved"
    pending_vote = "pending_vote"
    accepted = "accepted"
    rejected = "rejected"


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    room_id: Mapped[str] = mapped_column(String(36), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    message_type: Mapped[str] = mapped_column(String(20), default=MessageType.chat.value)
    parent_id: Mapped[str] = mapped_column(String(36), ForeignKey("messages.id", ondelete="SET NULL"), nullable=True)
    change_category: Mapped[str] = mapped_column(String(30), nullable=True)
    consensus_status: Mapped[str] = mapped_column(String(20), default=ConsensusStatus.pending.value)
    vote_deadline: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
