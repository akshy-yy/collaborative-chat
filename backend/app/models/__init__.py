# Import all models here so SQLAlchemy's metadata.create_all() discovers them
# This is critical for auto table creation on startup with SQLite
from app.models.user import User
from app.models.project import Project, ProjectMember, RoleEnum, ProjectStatus
from app.models.room import Room, RoomMember
from app.models.message import Message, MessageType, ChangeCategory, ConsensusStatus
from app.models.vote import Vote, VoteType
from app.models.instruction import Instruction, InstructionStatus
from app.models.decision import Decision, DecisionStatus
from app.models.audit_log import AuditLog

__all__ = [
    "User",
    "Project", "ProjectMember", "RoleEnum", "ProjectStatus",
    "Room", "RoomMember",
    "Message", "MessageType", "ChangeCategory", "ConsensusStatus",
    "Vote", "VoteType",
    "Instruction", "InstructionStatus",
    "Decision", "DecisionStatus",
    "AuditLog",
]
