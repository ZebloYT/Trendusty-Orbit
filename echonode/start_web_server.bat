@echo off
title EchoNode Minecraft Web Server Manager & 24/7 Engine
cd /d "%~dp0"
echo =========================================================
echo    EchoNode Minecraft Web Server Manager ^& 24/7 Engine
echo =========================================================

REM Check for Python in PATH or standard py launcher
set "PYTHON_EXE="
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 set "PYTHON_EXE=python"
if not defined PYTHON_EXE (
    where py >nul 2>nul
    if %ERRORLEVEL% EQU 0 set "PYTHON_EXE=py -3"
)
if not defined PYTHON_EXE (
    if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
    if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
)

if defined PYTHON_EXE (
    echo [EchoNode] Launching Python backend server (%PYTHON_EXE%)...
    echo [EchoNode] Opening Web Panel at http://localhost:3000...
    start "" "http://localhost:3000"
    %PYTHON_EXE% server.py
) else (
    echo [WARN] Python was not found in PATH!
    echo Opening EchoNode Web Panel directly in browser...
    start "" "index.html"
)
pause
