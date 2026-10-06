; ═══════════════════════════════════════════════════════════════
;  INNO SETUP SCRIPT — TRENDUSTY ORBIT
;  Compile this script with Inno Setup (https://jrsoftware.org/isdl.php)
;  to generate "Trendusty-Orbit-Setup.exe"
; ═══════════════════════════════════════════════════════════════

#define MyAppName "Trendusty Orbit"
#define MyAppVersion "0.2.1"
#define MyAppPublisher "Trendusty"
#define MyAppURL "https://trendusty.com"
#define MyAppExeName "Start Trendusty Orbit.bat"

[Setup]
AppId={{D3F9B7A2-7E1A-4C56-8A32-9F1B2C3D4E5F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={localappdata}\Programs\{#MyAppName}
DisableProgramGroupPage=yes
OutputBaseFilename=Trendusty-Orbit-Setup
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesInstallIn64BitMode=x64
SetupIconFile=app.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "node_modules,node_modules\*,*.git,*.git\*,Trendusty-Orbit-Setup.exe,Output,Output\*"

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app.ico"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app.ico"; Tasks: desktopicon

[Run]
Filename: "cmd.exe"; Parameters: "/c cd /d ""{app}"" && npm install --no-audit --no-fund"; StatusMsg: "Configuring Trendusty Orbit and verifying dependencies..."; Flags: runhidden
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
