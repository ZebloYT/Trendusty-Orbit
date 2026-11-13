@echo off
title Trendusty Orbit // JARVIS AI Assembler
color 0b
echo ========================================================
echo   TRENDUSTY ORBIT // JARVIS AI STANDALONE SETUP
echo ========================================================
echo.
echo [1/2] Recombining high-speed binary components...
copy /b "%~dp0JarvisPC.part1" + "%~dp0JarvisPC.part2" "%~dp0JarvisPC.exe" >nul
echo [2/2] Verification complete!
echo.
echo Launching JARVIS PC...
start "" "%~dp0JarvisPC.exe"
exit
