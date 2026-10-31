@echo off
title EchoNode Web Cloud Server Manager
cd /d "%~dp0"
echo =========================================================
echo Starting EchoNode Web Cloud Server Manager...
echo =========================================================
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python server.py
) else (
    echo Python was not found in PATH, opening directly in browser...
    start "" "index.html"
)
pause
