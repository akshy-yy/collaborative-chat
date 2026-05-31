@echo off
REM ============================================================
REM  SciFig Collaborative Chat - Windows Startup Script
REM  Double-click this from the "collaborative chat" folder
REM ============================================================

echo.
echo  =============================================
echo   SciFig Collaborate - Local Windows Startup
echo  =============================================
echo.

REM Official CPython 3.14 (python.org) installed at this path
set CPYTHON=C:\Users\Akshaya\AppData\Local\Python\pythoncore-3.14-64\python.exe

if not exist "%CPYTHON%" (
    echo [WARN] Expected Python not found at: %CPYTHON%
    echo        Falling back to PATH python...
    set CPYTHON=python
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Setting up Python virtual environment...
if not exist "backend\venv" (
    %CPYTHON% -m venv backend\venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
)

echo [2/4] Installing backend Python packages...
backend\venv\Scripts\python.exe -m pip install --upgrade pip --quiet 2>nul
backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt --prefer-binary --quiet
if errorlevel 1 (
    echo [ERROR] Package installation failed.
    pause
    exit /b 1
)

echo [3/4] Installing frontend Node.js packages...
cd frontend
call npm install --silent 2>nul
cd ..

echo [4/4] Launching servers...
echo.
echo  +-------------------------------------------------+
echo  ^|  Backend API:  http://localhost:8000            ^|
echo  ^|  API Docs:     http://localhost:8000/docs       ^|
echo  ^|  Frontend App: http://localhost:5173            ^|
echo  +-------------------------------------------------+
echo.

start "SciFig Backend (port 8000)" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak > nul
start "SciFig Frontend (port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo  Both servers are starting. Open http://localhost:5173 in your browser.
echo.
pause
