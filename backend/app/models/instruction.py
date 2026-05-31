import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON
from app.core.database import Base


class InstructionStatus(str, enum.Enum):
    pending = "pending"
    applied = "applied"
    rejected = "rejected"


class Instruction(Base):
    __tablename__ = "instructions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    room_id: Mapped[str] = mapped_column(String(36), ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True)
    instruction_type: Mapped[str] = mapped_column(String(50), nullable=False)
    target: Mapped[str] = mapped_column(String(200), nullable=True)
    action: Mapped[str] = mapped_column(String(200), nullable=True)
    # JSON stored natively in SQLite via SQLAlchemy's JSON type
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    status: Mapped[str] = mapped_column(String(20), default=InstructionStatus.pending.value)
    source_message_ids: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
