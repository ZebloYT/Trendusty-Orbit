@echo off
color 0A
title Tactical Cursor Pack Installer
echo ===================================================
echo      INSTALLING TACTICAL CURSOR PACK
echo ===================================================
echo.
echo Copying cursor files to Windows directory...
xcopy /y /i "*.cur" "%systemroot%\Cursors\Tactical\" >nul
xcopy /y /i "*.ani" "%systemroot%\Cursors\Tactical\" >nul

echo Applying Registry mappings...
reg add "HKCU\Control Panel\Cursors" /v Arrow /t REG_EXPAND_SZ /d "%systemroot%\Cursors\Tactical\tactical_cursor.cur" /f
reg add "HKCU\Control Panel\Cursors" /v Hand /t REG_EXPAND_SZ /d "%systemroot%\Cursors\Tactical\tactical_link.ani" /f
reg add "HKCU\Control Panel\Cursors" /v AppStarting /t REG_EXPAND_SZ /d "%systemroot%\Cursors\Tactical\tactical_animated.ani" /f
reg add "HKCU\Control Panel\Cursors" /v Wait /t REG_EXPAND_SZ /d "%systemroot%\Cursors\Tactical\tactical_load.ani" /f
reg add "HKCU\Control Panel\Cursors" /v IBeam /t REG_EXPAND_SZ /d "%systemroot%\Cursors\Tactical\tactical_text.cur" /f
reg add "HKCU\Control Panel\Cursors" /v SizeAll /t REG_EXPAND_SZ /d "%systemroot%\Cursors\Tactical\tactical_all.cur" /f
reg add "HKCU\Control Panel\Cursors" /v SizeNESW /t REG_EXPAND_SZ /d "%systemroot%\Cursors\Tactical\tactical_nesw.cur" /f
reg add "HKCU\Control Panel\Cursors" /v SizeNS /t REG_EXPAND_SZ /d "%systemroot%\Cursors\Tactical\tactical_ns.cur" /f
reg add "HKCU\Control Panel\Cursors" /v SizeNWSE /t REG_EXPAND_SZ /d "%systemroot%\Cursors\Tactical\tactical_nwse.cur" /f
reg add "HKCU\Control Panel\Cursors" /v SizeWE /t REG_EXPAND_SZ /d "%systemroot%\Cursors\Tactical\tactical_we.cur" /f

echo Reloading Cursor settings...
:: Trigger SystemParametersInfo to reload cursors (requires a quick PowerShell command or reboot)
powershell -command "$code = '[DllImport(\"user32.dll\")] public static extern bool SystemParametersInfo(uint uiAction, uint uiParam, uint pvParam, uint fWinIni);'; $type = Add-Type -MemberDefinition $code -Name 'NativeMethods' -Namespace 'Win32' -PassThru; $type::SystemParametersInfo(0x0057, 0, 0, 0)"

echo.
echo ===================================================
echo     INSTALLATION COMPLETE!
echo ===================================================
pause
