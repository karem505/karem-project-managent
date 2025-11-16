@echo off
echo ======================================
echo Project Management System - Backend Setup
echo ======================================
echo.

echo Step 1: Creating virtual environment...
python -m venv venv
if errorlevel 1 (
    echo Error: Failed to create virtual environment
    pause
    exit /b 1
)

echo Step 2: Activating virtual environment...
call venv\Scripts\activate.bat

echo Step 3: Upgrading pip...
python -m pip install --upgrade pip

echo Step 4: Installing dependencies...
pip install -r requirements\development.txt
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 5: Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env file created! Please update it with your database credentials.
) else (
    echo .env file already exists.
)

echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo Next steps:
echo 1. Update the .env file with your PostgreSQL credentials
echo 2. Create the database in PostgreSQL
echo 3. Run: python manage.py migrate
echo 4. Run: python manage.py createsuperuser
echo 5. Run: python manage.py runserver
echo.
pause
