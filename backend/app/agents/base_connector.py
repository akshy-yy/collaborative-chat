from abc import ABC, abstractmethod
from typing import Any, Callable, Optional


class BaseAgentConnector(ABC):
    def __init__(self):
        self._callbacks: list[Callable] = []

    @abstractmethod
    async def send_instruction(self, instruction: dict) -> dict:
        pass

    @abstractmethod
    async def receive_response(self) -> Optional[dict]:
        pass

    def register_callback(self, callback: Callable):
        self._callbacks.append(callback)

    async def _trigger_callbacks(self, response: dict):
        for cb in self._callbacks:
            await cb(response)
