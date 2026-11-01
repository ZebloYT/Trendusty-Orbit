@echo off
title EchoNode - Pure Survival Minecraft Server
cd /d "%~dp0"
echo ==============================================================
echo       EchoNode - Pure Survival Minecraft Server
echo ==============================================================

set "SERVER_DIR=C:\Users\Admin\Desktop\Sky Heaven MC"
if not exist "%SERVER_DIR%" set "SERVER_DIR=%~dp0server_data"

REM Detect Java 25 or Java 21
set "JAVA_EXE="
if exist "C:\Users\Admin\Desktop\EchoCraft Server\Java\jdk-25.0.4.1+1\bin\java.exe" (
    set "JAVA_EXE=C:\Users\Admin\Desktop\EchoCraft Server\Java\jdk-25.0.4.1+1\bin\java.exe"
) else if exist "%SERVER_DIR%\Java\jdk-25.0.4.1+1\bin\java.exe" (
    set "JAVA_EXE=%SERVER_DIR%\Java\jdk-25.0.4.1+1\bin\java.exe"
) else if exist "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot\bin\java.exe" (
    set "JAVA_EXE=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot\bin\java.exe"
) else (
    set "JAVA_EXE=java"
)

echo [EchoNode] Server Folder : %SERVER_DIR%
echo [EchoNode] Java Binary   : %JAVA_EXE%
echo [EchoNode] Memory Limit  : 6GB RAM
echo.
cd /d "%SERVER_DIR%"
echo eula=true > eula.txt

"%JAVA_EXE%" -Xmx6G -Xms2G -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -Dterminal.jline=false -Dfile.encoding=UTF-8 -jar paper.jar --nogui
pause
