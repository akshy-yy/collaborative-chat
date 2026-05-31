from sqlalchemy.ext.asyncio import AsyncSession
from app.models.audit_log import AuditLog


async def log_action(
    db: AsyncSession,
    action: str,
    user_id: str = None,
    project_id: str = None,
    metadata: dict = None,
    ip_address: str = None,
):
    log = AuditLog(
        user_id=user_id,          # plain string UUID now
        project_id=project_id,    # plain string UUID now
        action=action,
        metadata_=metadata or {},  # renamed field to avoid SQLAlchemy reserved word
        ip_address=ip_address,
    )
    db.add(log)
    await db.commit()
