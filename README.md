# COLLABORATIVE CHAT

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Language-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white">
  <img alt="Python" src="https://img.shields.io/badge/Python-Server%20Language-3776AB?style=for-the-badge&logo=python&logoColor=white">
  <img alt="SQLAlchemy" src="https://img.shields.io/badge/SQLAlchemy-ORM-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white">
  <img alt="SQLite" src="https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white">
  <img alt="WebSockets" src="https://img.shields.io/badge/WebSockets-Realtime-9333EA?style=for-the-badge&logo=socketdotio&logoColor=white">
</p>

<h2><span style="color:#2563eb;">PROJECT OVERVIEW</span></h2>

**Collaborative Chat** is a **real-time team collaboration platform** designed for project-room discussions where ideas need quick alignment and structured decisions.

It is useful when teams need:
- **Live conversations** without context switching.
- A clear flow from **discussion -> suggestion -> approval/rejection**.
- Better accountability through **role-aware voting**.
- A shared workspace that keeps everyone aligned in one place.

<h2><span style="color:#16a34a;">CORE FEATURES</span></h2>

- **Project Rooms:** Create and join focused discussion rooms.
- **Live Messaging:** Real-time chat with instant message updates.
- **Suggestion Workflow:** Raise suggestions separately from normal chat.
- **Voting Model:** Team-based approval/rejection with room-size-aware logic.
- **Role Weighting:** Weighted votes for larger groups based on member roles.
- **Clear Chat Action:** Quickly reset room chat when starting a fresh discussion cycle.

<h2><span style="color:#0f766e;">TECH STACK</span></h2>

- **Frontend:** React, TypeScript, Vite
- **Backend:** FastAPI, Python, SQLAlchemy (Async)
- **Database:** SQLite
- **Realtime Layer:** WebSockets

<h2><span style="color:#7c3aed;">PROJECT STRUCTURE</span></h2>

```text
collaborative chat/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── websockets/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── store/
│   │   └── types/
│   └── package.json
├── database/
├── docker/
├── .env.example
└── start.bat
```

<h2><span style="color:#ea580c;">PREREQUISITES</span></h2>

- **Python 3.12+**
- **Node.js 18+**
- **npm** (comes with Node.js)

<h2><span style="color:#dc2626;">PROJECT SETUP</span></h2>

### 1. QUICK START (WINDOWS)

```bat
start.bat
```

### 2. MANUAL SETUP

#### BACKEND

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### FRONTEND

```powershell
cd frontend
npm install
npm run dev
```

#### ACCESS URLS

- **App:** http://localhost:5173
- **API Docs:** http://localhost:8000/docs

<h2><span style="color:#b45309;">FUTURE SCOPE</span></h2>

- **Advanced moderation** workflows for larger teams.
- **Notification center** for pending decisions and mentions.
- **Analytics dashboard** for participation and approval trends.
- **Cloud deployment** profiles for production-ready hosting.
- **Integrations** with external productivity tools.

---

<p align="center">
  <img src="img.jpg" alt="Pixel art scenery" width="85%">
</p>
