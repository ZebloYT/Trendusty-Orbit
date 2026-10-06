@echo off
color 0A
title Tactical Cursor Installer

echo ==============================================
echo       TACTICAL OS CURSOR INSTALLER
echo ==============================================
echo.

set "CSC=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
if not exist "%CSC%" (
    set "CSC=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)

if not exist "%CSC%" (
    echo [ERROR] .NET Framework 4.0 or higher is required.
    pause
    exit /b 1
)

if not exist "tactical_cursor.cur" (
    echo [ERROR] tactical_cursor.cur not found!
    echo Please make sure you extracted all files from the ZIP before running.
    pause
    exit /b 1
)

echo [1/3] Compiling installer executable (TacticalCursorSetup.exe)...
"%CSC%" /nologo /out:TacticalCursorSetup.exe Setup_Cursor.cs >nul

if not exist "TacticalCursorSetup.exe" (
    echo [ERROR] Failed to compile the EXE.
    pause
    exit /b 1
)

echo [2/3] Running installer...
TacticalCursorSetup.exe

echo [3/3] Cleaning up...
del TacticalCursorSetup.exe

echo.
echo Setup Complete! Press any key to exit.
pause >nul
