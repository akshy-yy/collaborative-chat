import enum
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class ProjectStatus(str, enum.Enum):
    active = "active"
    archived = "archived"


class RoleEnum(str, enum.Enum):
    principal_investigator = "principal_investigator"
    supervisor = "supervisor"
    reviewer = "reviewer"
    postdoc = "postdoc"
    phd_student = "phd_student"
    co_author = "co_author"
    designer = "designer"
    observer = "observer"


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    owner_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    # invite_token stored as plain string UUID
    invite_token: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: str(uuid.uuid4()))
    room_password_hash: Mapped[str] = mapped_column(String, nullable=False)
    # Store enum as string for SQLite
    status: Mapped[str] = mapped_column(String(20), default=ProjectStatus.active.value)
    auto_approve_window_minutes: Mapped[int] = mapped_column(Integer, default=10)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class ProjectMember(Base):
    __tablename__ = "project_members"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    # Role stored as string for SQLite
    role: Mapped[str] = mapped_column(String(40), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
