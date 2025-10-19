@echo off
echo ===============================================
echo         WordExtra Web Application
echo         Markdown to Word Converter
echo ===============================================
echo.

:: Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

:: Check if virtual environment exists
if not exist "venv\" (
    echo [INFO] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
)

:: Activate virtual environment
echo [INFO] Activating virtual environment...
call venv\Scripts\activate.bat

:: Install dependencies
if not exist "venv\installed.flag" (
    echo [INFO] Installing dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo. > venv\installed.flag
) else (
    echo [INFO] Dependencies already installed
)

:: Check if pandoc is installed
echo [INFO] Checking pandoc installation...
pandoc --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Pandoc is not installed!
    echo Download from: https://pandoc.org/installing.html
    echo The application will start but conversion will not work without pandoc.
    echo.
    timeout /t 5 /nobreak >nul
)

:: Create necessary directories
if not exist "uploads\" mkdir uploads
if not exist "downloads\" mkdir downloads
if not exist "static\css\" mkdir static\css
if not exist "static\js\" mkdir static\js
if not exist "templates\" mkdir templates

:: Start the application
echo [INFO] Starting WordExtra Web Application...
echo [INFO] The application will be available at: http://localhost:5000
echo [INFO] Press Ctrl+C to stop the server
echo.

python app.py

:: Deactivate virtual environment when done
deactivate

echo.
echo [INFO] WordExtra stopped. Press any key to exit.
pause >nul