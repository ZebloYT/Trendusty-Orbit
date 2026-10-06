@echo off
title Trendusty Orbit - Active App Console
cd /d "%~dp0"
color 0A
cls

echo ================================================================================
echo                    TRENDUSTY ORBIT - GLOBAL INTELLIGENCE
echo                              MADE BY TRENDUSTY
echo ================================================================================
echo.
echo [APPLICATION SPECIFICATIONS]
echo  - Name:             Trendusty Orbit
echo  - Platform:         Global 3D Earth Intelligence Simulator
echo  - Engine:           CesiumJS WebGL with High-Performance Zero-Lag Tuning
echo  - Visual Theme:     Cyber Mint and Aerospace Obsidian
echo  - Branding:         Made by Trendusty
echo  - Local Address:    http://localhost:4173
echo.
echo [ACTIVE SURVEILLANCE AND REAL-TIME FEEDS]
echo  [+] Aircraft Feeds:        Live Global ADS-B and OpenSky Flight Tracking
echo  [+] Maritime Feeds:        Marine AIS Vessel Positioning and Port Telemetry
echo  [+] Orbital Satellites:    Real-Time Spacecraft, ISS and Orbital Elements
echo  [+] Environmental:         Live USGS Seismology and NASA FIRMS Thermal Scans
echo  [+] Weather Radar:         Global Wind Models, GFS/ECMWF and Cyclone Paths
echo  [+] Ground Cameras:        Public CCTV Network and Visual Street Feeds
echo  [+] Tactical Cockpit:      3D Ride-Along Follow Cam and HUD Telemetry
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo ================================================================================
    echo  [ERROR] Node.js is not found in your Windows PATH!
    echo  Please install Node.js from https://nodejs.org or restart your terminal.
    echo ================================================================================
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [NOTE] First-time setup: Installing required dependencies...
    call npm install
)

echo ================================================================================
echo  STATUS: Starting server at http://localhost:4173 ...
echo.
echo  Closing this Window can turn off the app!
echo ================================================================================
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:4173"

call npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [NOTE] Trying direct vite launcher...
    call "node_modules\.bin\vite.cmd"
)

echo.
echo ================================================================================
echo  Server stopped.
echo  Closing this Window can turn off the app!
echo ================================================================================
pause
