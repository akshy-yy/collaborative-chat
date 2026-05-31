import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_active_user
from app.services.export_service import export_json, export_markdown, export_pdf, export_docx

router = APIRouter(prefix="/projects/{project_id}/export", tags=["export"])


@router.get("/json")
async def export_json_endpoint(project_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    data = await export_json(project_id, db)
    return data


@router.get("/markdown")
async def export_markdown_endpoint(project_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    content = await export_markdown(project_id, db)
    return Response(content=content, media_type="text/markdown", headers={"Content-Disposition": f"attachment; filename=project_{project_id}.md"})


@router.get("/pdf")
async def export_pdf_endpoint(project_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    try:
        pdf_bytes = await export_pdf(project_id, db)
        return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=project_{project_id}.pdf"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.get("/docx")
async def export_docx_endpoint(project_id: str, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_active_user)):
    try:
        docx_bytes = await export_docx(project_id, db)
        return Response(content=docx_bytes, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": f"attachment; filename=project_{project_id}.docx"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DOCX generation failed: {str(e)}")
