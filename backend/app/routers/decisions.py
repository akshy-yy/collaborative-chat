from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.models.decision import Decision, DecisionStatus
from app.models.project import ProjectMember
from app.schemas.decision import DecisionCreate, DecisionUpdate, DecisionRead

router = APIRouter(prefix="/projects/{project_id}/decisions", tags=["decisions"])


@router.get("/", response_model=List[DecisionRead])
async def list_decisions(project_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    member_result = await db.execute(
        select(ProjectMember).where(ProjectMember.project_id == project_id, ProjectMember.user_id == current_user.id)
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a project member")
    result = await db.execute(
        select(Decision).where(Decision.project_id == project_id).order_by(Decision.created_at.desc())
    )
    return [DecisionRead.model_validate(d) for d in result.scalars().all()]


@router.patch("/{decision_id}", response_model=DecisionRead)
async def update_decision(project_id: str, decision_id: str, data: DecisionUpdate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    result = await db.execute(
        select(Decision).where(Decision.id == decision_id, Decision.project_id == project_id)
    )
    decision = result.scalar_one_or_none()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")
    status_val = data.status if isinstance(data.status, str) else data.status.value
    decision.status = status_val
    decision.decided_at = datetime.now(timezone.utc)
    decision.decided_by = current_user.id
    await db.commit()
    await db.refresh(decision)
    return DecisionRead.model_validate(decision)
