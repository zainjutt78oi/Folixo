@echo off
title Folixo - Setup & Run
color 0A
echo.
echo  ==========================================
echo    FOLIXO - World Class Resume Builder
echo    By Muhammad Zain Asif - UOG
echo  ==========================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python not found!
    echo  Download from: https://python.org/downloads/
    echo  IMPORTANT: Check "Add Python to PATH" during install!
    pause & exit /b
)
echo  [OK] Python found

if not exist "venv" (
    echo  [1/4] Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat

echo  [2/4] Installing packages...
pip install --upgrade pip -q
pip install Flask==3.0.0 Flask-Login==0.6.3 Flask-SQLAlchemy==3.1.1 Werkzeug==3.0.1 python-dotenv==1.0.0 anthropic==0.25.0 SQLAlchemy==2.0.23 itsdangerous==2.1.2 reportlab==4.1.0 -q
echo  [OK] Packages installed

if not exist "database" mkdir database
echo  [OK] Database folder ready

echo  [3/4] Checking .env file...
if not exist ".env" (
    echo SECRET_KEY=folixo-secret-key-change-this-2024> .env
    echo CLAUDE_API_KEY=your_claude_api_key_here>> .env
    echo ADMIN_EMAIL=admin@folixo.com>> .env
    echo FLASK_ENV=development>> .env
    echo FLASK_DEBUG=1>> .env
    echo.
    echo  [IMPORTANT] Open .env file and add your CLAUDE_API_KEY
    echo  Get it FREE from: console.anthropic.com
    echo.
)

echo  [4/4] Starting Folixo...
echo.
echo  ==========================================
echo   Website:     http://127.0.0.1:5000
echo   Admin:       http://127.0.0.1:5000/admin/login
echo   Admin Email: admin@folixo.com
echo   Admin Pass:  Admin@Folixo2024!
echo   Stop:        Ctrl+C
echo  ==========================================
echo.
python run.py
pause
