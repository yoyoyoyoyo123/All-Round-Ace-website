@echo off
setlocal

cd /d "%~dp0"
title ARA Website Launcher

echo ============================================
echo   ARA Website Auto Launcher
echo ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
  ) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
  ) else (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    echo.
    echo Tips:
    echo 1. Install Node.js LTS
    echo 2. Re-open terminal/IDE after installation
    echo.
    pause
    exit /b 1
  )
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm is not available.
  echo Please reinstall Node.js.
  echo.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo [WARN] package.json not found.
  if exist "index.html" (
    echo Opening index.html directly...
    start "" "index.html"
    exit /b 0
  )
  echo [ERROR] No known project entry found.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo Starting development server...
echo.
call npm run dev -- --open

echo.
echo Dev server stopped.
pause
