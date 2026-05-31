import enum
import uuid
from datetime import datetime
from sqlalchemy import Text, DateTime, String, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class DecisionStatus(str, enum.Enum):
    accepted = "accepted"
    rejected = "rejected"
    pending = "pending"


class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    instruction_id: Mapped[str] = mapped_column(String(36), ForeignKey("instructions.id", ondelete="SET NULL"), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default=DecisionStatus.pending.value)
    decided_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    decided_by: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
