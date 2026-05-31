import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
# Import all models so SQLAlchemy metadata is populated before create_all
import app.models  # noqa: F401
from app.routers import auth, projects, rooms, messages, votes, instructions, decisions, export, agent_connectors
from app.websockets.handler import websocket_endpoint
from fastapi import WebSocket, Query, Depends
from app.core.database import get_db
from app.services.consensus_service import consensus_service


async def background_auto_approve():
    while True:
        await asyncio.sleep(60)
        try:
            from app.core.database import AsyncSessionLocal
            async with AsyncSessionLocal() as db:
                updated = await consensus_service.process_pending_auto_approvals(db)
                if updated:
                    print(f"Auto-approved {len(updated)} messages: {updated}")
        except Exception as e:
            print(f"Auto-approve task error: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    task = asyncio.create_task(background_auto_approve())
    yield
    task.cancel()


app = FastAPI(
    title="SciFig Collaborative Chat Layer",
    description="Multi-user collaborative workspace for scientific figure generation. Top layer above the SciFig agent pipeline.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(votes.router, prefix="/api")
app.include_router(instructions.router, prefix="/api")
app.include_router(decisions.router, prefix="/api")
app.include_router(export.router, prefix="/api")
app.include_router(agent_connectors.router, prefix="/api")


@app.websocket("/ws/{room_id}")
async def ws_endpoint(websocket: WebSocket, room_id: str, token: str = Query(...), db=Depends(get_db)):
    await websocket_endpoint(websocket, room_id, token, db)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "scifig-collab-backend"}
