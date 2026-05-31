from app.agents.base_connector import BaseAgentConnector
from typing import Optional


class DescriptionAgentConnector(BaseAgentConnector):
    async def send_instruction(self, instruction: dict) -> dict:
        return {"status": "queued", "agent": "description", "instruction": instruction, "message": "DescriptionAgent not yet integrated. Instruction stored."}

    async def receive_response(self) -> Optional[dict]:
        return None


class LayoutAgentConnector(BaseAgentConnector):
    async def send_instruction(self, instruction: dict) -> dict:
        return {"status": "queued", "agent": "layout", "instruction": instruction, "message": "LayoutAgent not yet integrated. Instruction stored."}

    async def receive_response(self) -> Optional[dict]:
        return None


class FeedbackAgentConnector(BaseAgentConnector):
    async def send_instruction(self, instruction: dict) -> dict:
        return {"status": "queued", "agent": "feedback", "instruction": instruction, "message": "FeedbackAgent not yet integrated. Instruction stored."}

    async def receive_response(self) -> Optional[dict]:
        return None


class ComponentAgentConnector(BaseAgentConnector):
    async def send_instruction(self, instruction: dict) -> dict:
        return {"status": "queued", "agent": "component", "instruction": instruction, "message": "ComponentAgent not yet integrated. Instruction stored."}

    async def receive_response(self) -> Optional[dict]:
        return None


description_connector = DescriptionAgentConnector()
layout_connector = LayoutAgentConnector()
feedback_connector = FeedbackAgentConnector()
component_connector = ComponentAgentConnector()
