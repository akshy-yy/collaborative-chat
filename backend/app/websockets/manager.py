import json
from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.user_meta: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: str, role: str, display_name: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        self.user_meta[websocket] = {"user_id": user_id, "room_id": room_id, "role": role, "display_name": display_name}

    async def disconnect(self, websocket: WebSocket):
        meta = self.user_meta.pop(websocket, None)
        if meta:
            room_id = meta["room_id"]
            if room_id in self.active_connections:
                self.active_connections[room_id] = [ws for ws in self.active_connections[room_id] if ws != websocket]
                if not self.active_connections[room_id]:
                    del self.active_connections[room_id]
        return meta

    async def broadcast_to_room(self, room_id: str, message: dict, exclude_ws: WebSocket = None):
        if room_id not in self.active_connections:
            return
        dead = []
        for ws in self.active_connections[room_id]:
            if ws == exclude_ws:
                continue
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            await self.disconnect(ws)

    async def send_to_websocket(self, websocket: WebSocket, message: dict):
        try:
            await websocket.send_json(message)
        except Exception:
            pass

    def get_room_members(self, room_id: str) -> List[dict]:
        if room_id not in self.active_connections:
            return []
        members = {}
        for ws in self.active_connections[room_id]:
            if ws in self.user_meta:
                meta = self.user_meta[ws]
                members[meta["user_id"]] = meta
        return list(members.values())

    def get_online_user_ids(self, room_id: str) -> List[str]:
        return [m["user_id"] for m in self.get_room_members(room_id)]


manager = ConnectionManager()
