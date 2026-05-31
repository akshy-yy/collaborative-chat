from fastapi import APIRouter, Depends
from app.core.security import get_current_active_user
from app.agents.connectors import description_connector, layout_connector, feedback_connector, component_connector

router = APIRouter(prefix="/agents", tags=["agent-connectors"])


@router.post("/description/trigger")
async def trigger_description_agent(instruction: dict, current_user=Depends(get_current_active_user)):
    result = await description_connector.send_instruction(instruction)
    return result


@router.post("/layout/trigger")
async def trigger_layout_agent(instruction: dict, current_user=Depends(get_current_active_user)):
    result = await layout_connector.send_instruction(instruction)
    return result


@router.post("/feedback/trigger")
async def trigger_feedback_agent(instruction: dict, current_user=Depends(get_current_active_user)):
    result = await feedback_connector.send_instruction(instruction)
    return result


@router.post("/component/trigger")
async def trigger_component_agent(instruction: dict, current_user=Depends(get_current_active_user)):
    result = await component_connector.send_instruction(instruction)
    return result


@router.get("/status")
async def agent_status():
    return {
        "description_agent": "placeholder - not integrated",
        "layout_agent": "placeholder - not integrated",
        "feedback_agent": "placeholder - not integrated",
        "component_agent": "placeholder - not integrated",
        "note": "Implement BaseAgentConnector subclasses to integrate SciFig agents",
    }
