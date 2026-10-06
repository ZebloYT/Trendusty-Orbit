@echo off
setlocal EnableDelayedExpansion
title Trendusty Orbit - System Installer
color 0B
cls

echo ================================================================================
echo                    TRENDUSTY ORBIT - SYSTEM INSTALLER
echo                              MADE BY TRENDUSTY
echo ================================================================================
echo.
echo [1/4] Verifying prerequisites...

where node >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Node.js is not found on your system!
    echo.
    echo Node.js is required to run Trendusty Orbit.
    echo Opening https://nodejs.org in your browser so you can download the LTS version...
    start https://nodejs.org
    echo.
    echo Once installed, run this installer again.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v 2^>nul') do set NODE_VER=%%v
echo  [OK] Node.js detected: %NODE_VER%

echo.
echo [2/4] Installing application to Windows AppData...
set "INSTALL_DIR=%LOCALAPPDATA%\Programs\Trendusty Orbit"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo  Target: %INSTALL_DIR%
echo  Copying core files (disconnecting from current folder)...

:: Copy all files except git
robocopy "%~dp0." "%INSTALL_DIR%" /E /XD .git .github /XF Trendusty-Orbit-Setup.iss >nul
echo  [OK] Files installed into independent directory.

echo.
echo [3/4] Verifying dependencies in installed directory...
cd /d "%INSTALL_DIR%"
call npm install --no-audit --no-fund >nul 2>&1
if %errorlevel% neq 0 (
    echo  [NOTE] Running dependency setup...
    call npm install
)
echo  [OK] Dependencies verified.

echo.
echo [4/4] Creating Desktop and Start Menu Shortcuts...

set "TARGET_BAT=%INSTALL_DIR%\Start Trendusty Orbit.bat"
set "ICON_PATH=%INSTALL_DIR%\app.ico"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$desktop = [Environment]::GetFolderPath('Desktop'); " ^
  "$programs = [Environment]::GetFolderPath('Programs'); " ^
  "$s1 = $ws.CreateShortcut((Join-Path $desktop 'Trendusty Orbit.lnk')); " ^
  "$s1.TargetPath = '%TARGET_BAT%'; " ^
  "$s1.WorkingDirectory = '%INSTALL_DIR%'; " ^
  "$s1.IconLocation = '%ICON_PATH%'; " ^
  "$s1.Description = 'Trendusty Orbit - Global Intelligence Console'; " ^
  "$s1.Save(); " ^
  "$s2 = $ws.CreateShortcut((Join-Path $programs 'Trendusty Orbit.lnk')); " ^
  "$s2.TargetPath = '%TARGET_BAT%'; " ^
  "$s2.WorkingDirectory = '%INSTALL_DIR%'; " ^
  "$s2.IconLocation = '%ICON_PATH%'; " ^
  "$s2.Description = 'Trendusty Orbit - Global Intelligence Console'; " ^
  "$s2.Save();"

echo  [OK] Desktop shortcut created!
echo  [OK] Start Menu shortcut created!

:: Create Uninstaller
(
echo @echo off
echo title Uninstall Trendusty Orbit
echo echo Removing Trendusty Orbit...
echo del /f /q "%%USERPROFILE%%\Desktop\Trendusty Orbit.lnk" 2^>nul
echo del /f /q "%%APPDATA%%\Microsoft\Windows\Start Menu\Programs\Trendusty Orbit.lnk" 2^>nul
echo rmdir /s /q "%INSTALL_DIR%"
echo echo Trendusty Orbit has been uninstalled.
echo pause
) > "%INSTALL_DIR%\Uninstall Trendusty Orbit.bat"

echo.
echo ================================================================================
echo  INSTALLATION COMPLETE!
echo ================================================================================
echo.
echo  Trendusty Orbit is now installed independently at:
echo  %INSTALL_DIR%
echo.
echo  The app is NOT connected to this download folder anymore.
echo  You can now launch it anytime from your Desktop or Start Menu.
echo.
echo  Launching Trendusty Orbit now and closing this installer...
timeout /t 3 >nul

start "" "%INSTALL_DIR%\Start Trendusty Orbit.bat"
exit
