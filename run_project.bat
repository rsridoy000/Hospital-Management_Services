@echo off
chcp 65001 >nul
title Hospital Management System - Setup & Launch
color 0A

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║              Hospital Management System                  ║
echo  ║              Auto Setup ^& Launch Script                  ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

REM ─────────────────────────────────────────────
REM  STEP 1: Check Python is installed
REM ─────────────────────────────────────────────
echo [1/7] Checking Python installation...
python --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo.
    echo  [ERROR] Python is NOT installed on this computer!
    echo  Please download and install Python 3.10 or higher from:
    echo  https://www.python.org/downloads/
    echo.
    echo  Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)
FOR /F "tokens=*" %%v IN ('python --version') DO echo  Found: %%v
echo.

REM ─────────────────────────────────────────────
REM  STEP 2: Create virtual environment if missing
REM ─────────────────────────────────────────────
echo [2/7] Setting up virtual environment...
IF NOT EXIST "venv" (
    echo  Creating new virtual environment...
    python -m venv venv
    IF ERRORLEVEL 1 (
        echo  [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo  Virtual environment created successfully!
) ELSE (
    echo  Virtual environment already exists.
)
echo.

REM ─────────────────────────────────────────────
REM  STEP 3: Activate venv and install packages
REM ─────────────────────────────────────────────
echo [3/7] Installing required packages...
call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet --disable-pip-version-check
IF ERRORLEVEL 1 (
    echo  [ERROR] Package installation failed. Check your internet connection.
    pause
    exit /b 1
)
echo  All packages installed successfully!
echo.

REM ─────────────────────────────────────────────
REM  STEP 4: Setup .env file if missing
REM ─────────────────────────────────────────────
echo [4/7] Checking environment configuration...
IF NOT EXIST ".env" (
    echo  Creating default .env file...
    (
        echo DEBUG=True
        echo SECRET_KEY=django-insecure-hospital-default-key-change-in-production
        echo DATABASE_URL=sqlite:///db.sqlite3
    ) > .env
    echo  .env file created with SQLite database ^(default^).
) ELSE (
    echo  .env file found.
)
echo.

REM ─────────────────────────────────────────────
REM  STEP 5: Run database migrations
REM ─────────────────────────────────────────────
echo [5/7] Setting up database...
python manage.py migrate --run-syncdb >nul 2>&1
python manage.py migrate
IF ERRORLEVEL 1 (
    echo  [WARNING] Some migrations may have failed. Continuing anyway...
)
echo.

REM ─────────────────────────────────────────────
REM  STEP 6: Seed Default Data (Patients, Doctors, Medicines)
REM ─────────────────────────────────────────────
echo [6/7] Seeding default database records...
python seed_db.py >nul 2>&1
echo  Demo data loaded (if it wasn't already).
echo.

REM ─────────────────────────────────────────────
REM  STEP 7: Create default admin if not exists
REM ─────────────────────────────────────────────
echo [7/7] Checking for admin account...
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); u=User.objects.create_superuser('admin', 'admin@hospital.com', 'admin123') if not User.objects.filter(username='admin').exists() else None; u.role='ADMIN' if u else None; u.save() if u else None; print('  [OK] Admin account checked/created.')" 2>nul
echo.

REM ─────────────────────────────────────────────
REM  LAUNCH SERVER
REM ─────────────────────────────────────────────
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║                   SETUP COMPLETE!                        ║
echo  ╠══════════════════════════════════════════════════════════╣
echo  ║                                                          ║
echo  ║   Open your browser and go to:                           ║
echo  ║                                                          ║
echo  ║        http://127.0.0.1:8000                             ║
echo  ║                                                          ║
echo  ║   Default Login Accounts:                                ║
echo  ║   Admin       → admin      / admin123                    ║
echo  ║   Doctor      → dr_smith   / pass123                     ║
echo  ║   Receptionist→ recep1     / pass123                     ║
echo  ║   Patient     → patient1   / pass123                     ║
echo  ║                                                          ║
echo  ║   Press CTRL+C to stop the server                        ║
echo  ║                                                          ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.

REM Open browser automatically after 2 seconds
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:8000

REM Start server
python manage.py runserver

pause
