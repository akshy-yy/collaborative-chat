from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.instruction import Instruction, InstructionStatus
from app.models.project import ProjectMember
from app.schemas.instruction import InstructionCreate, InstructionUpdate, InstructionRead

router = APIRouter(prefix="/projects/{project_id}/instructions", tags=["instructions"])


@router.get("/", response_model=List[InstructionRead])
async def list_instructions(project_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    member_result = await db.execute(
        select(ProjectMember).where(ProjectMember.project_id == project_id, ProjectMember.user_id == current_user.id)
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a project member")
    result = await db.execute(
        select(Instruction).where(Instruction.project_id == project_id).order_by(Instruction.created_at.desc())
    )
    return [InstructionRead.model_validate(i) for i in result.scalars().all()]


@router.post("/", response_model=InstructionRead, status_code=status.HTTP_201_CREATED)
async def create_instruction(project_id: str, data: InstructionCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    member_result = await db.execute(
        select(ProjectMember).where(ProjectMember.project_id == project_id, ProjectMember.user_id == current_user.id)
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a project member")
    instr = Instruction(
        project_id=project_id,
        instruction_type=data.instruction_type,
        target=data.target,
        action=data.action,
        payload=data.payload,
        source_message_ids=data.source_message_ids,
    )
    db.add(instr)
    await db.commit()
    await db.refresh(instr)
    return InstructionRead.model_validate(instr)


@router.patch("/{instruction_id}", response_model=InstructionRead)
async def update_instruction(project_id: str, instruction_id: str, data: InstructionUpdate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    result = await db.execute(
        select(Instruction).where(Instruction.id == instruction_id, Instruction.project_id == project_id)
    )
    instr = result.scalar_one_or_none()
    if not instr:
        raise HTTPException(status_code=404, detail="Instruction not found")
    if data.status:
        status_val = data.status if isinstance(data.status, str) else data.status.value
        instr.status = status_val
    await db.commit()
    await db.refresh(instr)
    return InstructionRead.model_validate(instr)
