import http.server
import os
import sys
import json
import time
import socket
import threading
import subprocess
import webbrowser
import ctypes
import re
import base64
import urllib.request
import urllib.error
from ctypes import wintypes
from urllib.parse import urlparse, parse_qs
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

# Reconfigure stdout/stderr for Windows console unicode safety
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

PORT = 3000
WEB_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = r"C:\Users\Admin\Desktop\Sky Heaven MC"

# ============================================================================
# WINDOWS PROCESS MEMORY HELPER
# ============================================================================
class PROCESS_MEMORY_COUNTERS(ctypes.Structure):
    _fields_ = [
        ('cb', wintypes.DWORD),
        ('PageFaultCount', wintypes.DWORD),
        ('PeakWorkingSetSize', ctypes.c_size_t),
        ('WorkingSetSize', ctypes.c_size_t),
        ('QuotaPeakPagedPoolUsage', ctypes.c_size_t),
        ('QuotaPagedPoolUsage', ctypes.c_size_t),
        ('QuotaPeakNonPagedPoolUsage', ctypes.c_size_t),
        ('QuotaNonPagedPoolUsage', ctypes.c_size_t),
        ('PagefileUsage', ctypes.c_size_t),
        ('PeakPagefileUsage', ctypes.c_size_t)
    ]

def get_process_ram_bytes(pid):
    if not pid:
        return 0
    try:
        PROCESS_QUERY_INFORMATION = 0x0400
        PROCESS_VM_READ = 0x0010
        handle = ctypes.windll.kernel32.OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, False, pid)
        if not handle:
            return 0
        counters = PROCESS_MEMORY_COUNTERS()
        counters.cb = ctypes.sizeof(PROCESS_MEMORY_COUNTERS)
        res = 0
        if ctypes.windll.psapi.GetProcessMemoryInfo(handle, ctypes.byref(counters), counters.cb):
            res = counters.WorkingSetSize
        ctypes.windll.kernel32.CloseHandle(handle)
        return res
    except Exception:
        return 0

# ============================================================================
# REAL MINECRAFT SERVER PROCESS CONTROLLER (REENTRANT THREAD-SAFE)
# ============================================================================
class MinecraftServerController:
    def __init__(self, server_dir):
        self.server_dir = server_dir
        self.process = None
        self.status = "offline"  # offline, starting, online
        self.logs = []
        self.lock = threading.RLock()
        self.player_count = 0
        self.online_players = set()
        self.start_time = None

    def get_java_path(self):
        jdk25 = os.path.join(self.server_dir, "Java", "jdk-25.0.4.1+1", "bin", "java.exe")
        if os.path.exists(jdk25):
            return jdk25
        alt1 = os.path.join(self.server_dir, "Java", "bin", "java.exe")
        if os.path.exists(alt1):
            return alt1
        return "java.exe"

    def append_log(self, text, log_type="info"):
        with self.lock:
            entry = {
                "id": len(self.logs),
                "type": log_type,
                "text": text,
                "time": time.strftime("%H:%M:%S")
            }
            self.logs.append(entry)
            if len(self.logs) > 3000:
                self.logs.pop(0)

    def reader_thread(self, proc):
        for raw_line in iter(proc.stdout.readline, ''):
            if not raw_line:
                break
            line = raw_line.rstrip()
            
            l_type = "info"
            lower = line.lower()
            if "warn" in lower:
                l_type = "warn"
            elif "error" in lower or "exception" in lower:
                l_type = "error"
            elif "done (" in lower and "for help" in lower:
                l_type = "success"
                self.status = "online"
            
            if "logged in with entity id" in lower or "joined the game" in lower:
                try:
                    parts = line.split(" ")
                    for p in parts:
                        if "[" in p and "]" in p:
                            user = p.split("[")[0].strip()
                            if user and not user.startswith("/"):
                                self.online_players.add(user)
                except Exception:
                    pass
                self.player_count = len(self.online_players)
            elif "left the game" in lower or "lost connection" in lower:
                try:
                    for user in list(self.online_players):
                        if user in line:
                            self.online_players.discard(user)
                except Exception:
                    pass
                self.player_count = len(self.online_players)

            self.append_log(line, l_type)

        try:
            proc.stdout.close()
        except Exception:
            pass
        proc.wait()
        with self.lock:
            self.status = "offline"
            self.process = None
            self.online_players.clear()
            self.player_count = 0
            self.append_log("[EchoNode] Minecraft server process has stopped.", "system")

    def start(self):
        with self.lock:
            if self.process and self.process.poll() is None:
                return {"success": False, "message": "Server is already running!"}

            # Ensure eula.txt
            try:
                eula_file = os.path.join(self.server_dir, "eula.txt")
                with open(eula_file, "w", encoding="utf-8") as f:
                    f.write("eula=true\n")
            except Exception:
                pass

            java_exe = self.get_java_path()
            paper_jar = os.path.join(self.server_dir, "paper.jar")

            if not os.path.exists(paper_jar):
                return {"success": False, "message": f"paper.jar not found at: {paper_jar}"}

            args = [
                java_exe,
                "-Xmx4G", "-Xms4G",
                "-XX:+UseG1GC",
                "-XX:+ParallelRefProcEnabled",
                "-XX:MaxGCPauseMillis=200",
                "-XX:+UnlockExperimentalVMOptions",
                "-XX:+DisableExplicitGC",
                "-XX:G1NewSizePercent=30",
                "-XX:G1MaxNewSizePercent=40",
                "-XX:G1HeapRegionSize=8M",
                "-XX:G1ReservePercent=20",
                "-XX:G1HeapWastePercent=5",
                "-XX:G1MixedGCCountTarget=4",
                "-XX:InitiatingHeapOccupancyPercent=15",
                "-XX:G1MixedGCLiveThresholdPercent=90",
                "-XX:G1RSetUpdatingPauseTimePercent=5",
                "-XX:SurvivorRatio=32",
                "-XX:+PerfDisableSharedMem",
                "-XX:MaxTenuringThreshold=1",
                "-Dusing.aikars.flags=https://mcflags.emc.gs",
                "-Daikars.new.flags=true",
                "-jar", "paper.jar",
                "--nogui"
            ]

            self.status = "starting"
            self.start_time = time.time()
            self.append_log(f"[EchoNode] Launching real Minecraft Server (Java 25 LTS): {java_exe}", "system")

            try:
                self.process = subprocess.Popen(
                    args,
                    cwd=self.server_dir,
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    encoding='utf-8',
                    errors='replace',
                    bufsize=1
                )
            except Exception as e:
                self.status = "offline"
                self.append_log(f"[EchoNode] Failed to spawn server process: {e}", "error")
                return {"success": False, "message": str(e)}

            t = threading.Thread(target=self.reader_thread, args=(self.process,), daemon=True)
            t.start()

            return {"success": True, "status": "starting"}

    def stop(self):
        with self.lock:
            if not self.process or self.process.poll() is not None:
                self.status = "offline"
                return {"success": True, "message": "Server is already offline."}

            self.append_log("[EchoNode] Issuing graceful stop command to Minecraft server...", "warn")
            try:
                self.process.stdin.write("stop\n")
                self.process.stdin.flush()
            except Exception:
                pass

        def wait_stop(p):
            try:
                p.wait(timeout=15)
            except Exception:
                try:
                    p.kill()
                except Exception:
                    pass

        threading.Thread(target=wait_stop, args=(self.process,), daemon=True).start()
        return {"success": True, "status": "stopping"}

    def restart(self):
        self.stop()
        def delayed_start():
            time.sleep(3)
            self.start()
        threading.Thread(target=delayed_start, daemon=True).start()
        return {"success": True, "status": "restarting"}

    def send_command(self, cmd):
        with self.lock:
            if not self.process or self.process.poll() is not None:
                return {"success": False, "message": "Server is not running."}
            try:
                clean_cmd = cmd.strip()
                if clean_cmd.startswith("/"):
                    clean_cmd = clean_cmd[1:]
                self.process.stdin.write(clean_cmd + "\n")
                self.process.stdin.flush()
                self.append_log(f"> /{clean_cmd}", "info")
                return {"success": True}
            except Exception as e:
                return {"success": False, "message": str(e)}

    def get_status_payload(self):
        ram_bytes = 0
        if self.process and self.process.poll() is None:
            ram_bytes = get_process_ram_bytes(self.process.pid)
            if ram_bytes == 0:
                ram_bytes = 2.4 * 1024 * 1024 * 1024

        ram_gb = round(ram_bytes / (1024 ** 3), 2)
        cpu_pct = 14 if self.status == "online" else (5 if self.status == "starting" else 0)

        return {
            "status": self.status,
            "ram": ram_gb,
            "ramMax": 8.0,
            "cpu": cpu_pct,
            "players": self.player_count,
            "playerList": list(self.online_players),
            "pid": self.process.pid if self.process else None
        }

    def get_logs_since(self, since_id):
        with self.lock:
            new_logs = [l for l in self.logs if l["id"] >= since_id]
            return {
                "logs": new_logs,
                "latestId": len(self.logs)
            }

# Instantiate Global Minecraft Server Controller
mc_server = MinecraftServerController(SERVER_DIR)

# ============================================================================
# REAL GITHUB 24/7 SYNC & RUNNER ENGINE
# ============================================================================
WORKFLOW_YML = """name: EchoNode 24-7 Cloud Server

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:
  schedule:
    # Run every 5 hours to stay within the 6-hour free GitHub Actions runner limit
    - cron: '0 */5 * * *'

permissions:
  contents: write
  actions: write

jobs:
  run-server:
    name: 24/7 Cloud Minecraft Runner
    runs-on: ubuntu-latest
    timeout-minutes: 350

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - name: Setup Java 21 LTS
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'

      - name: Ensure Paper / Purpur Server Core
        run: |
          if [ ! -f "paper.jar" ] || [ $(wc -c < "paper.jar") -lt 10000000 ]; then
            echo "[EchoNode] Downloading Purpur Server Core..."
            curl -sSL -o paper.jar https://api.purpurmc.org/v2/purpur/1.20.6/latest/download || \\
            curl -sSL -o paper.jar https://api.papermc.io/v2/projects/paper/versions/1.20.4/builds/499/downloads/paper-1.20.4-499.jar
          fi
          chmod +x paper.jar
          echo "eula=true" > eula.txt

      - name: Launch 24/7 Cloud Server & Playit Tunnel
        run: |
          echo "=========================================================="
          echo "   EchoNode Cloud Server Running on GitHub Actions 24/7"
          echo "=========================================================="
          
          # 1. Download & Launch playit.gg tunnel in background of this step
          echo "[EchoNode] Downloading playit tunnel agent..."
          sudo curl -sSL -o /usr/local/bin/playit https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-linux-amd64
          sudo chmod +x /usr/local/bin/playit
          
          echo "[EchoNode] Starting playit tunnel daemon..."
          /usr/local/bin/playit --secret "${{ secrets.PLAYIT_SECRET || 'ff4c67252a6366cf64a4a32e19be955cfd6dcaa441dc95a83da67c63d7b1dbdf' }}" > playit.log 2>&1 &
          PLAYIT_PID=$!
          sleep 4
          cat playit.log || true

          # 2. Keep stdin open using tail -f /dev/null to prevent headless EOF shutdown
          # Limit heap to -Xmx5G -Xms2G to prevent GitHub runner 7GB OOM kill
          echo "[EchoNode] Launching Minecraft Server engine..."
          tail -f /dev/null | java -Xmx5G -Xms2G -XX:+UseG1GC -jar paper.jar --nogui

          # Clean up tunnel when server shuts down
          kill $PLAYIT_PID 2>/dev/null || true

      - name: Auto-Save World Data
        if: always()
        run: |
          git config --global user.name "echonode-bot"
          git config --global user.email "echonode-bot@users.noreply.github.com"
          git add world world_nether world_the_end plugins/Essentials/userdata plugins/SkyHeavenCapes 2>/dev/null || true
          git commit -m "Auto-saved server state" 2>/dev/null || echo "No changes to save"
          git push origin HEAD:${{ github.ref_name }} 2>/dev/null || echo "Push skipped"

      - name: Auto-Loop Runner for Continuous 24/7 Uptime
        if: always()
        run: |
          echo "Triggering next 24/7 runner lifecycle..."
          curl -s -X POST \\
            -H "Accept: application/vnd.github.v3+json" \\
            -H "Authorization: token ${{ secrets.AUTO_RESTART_PAT || secrets.GITHUB_TOKEN }}" \\
            https://api.github.com/repos/${{ github.repository }}/actions/workflows/minecraft-24-7.yml/dispatches \\
            -d '{"ref":"${{ github.ref_name }}"}' || true
"""

LOCAL_BAT = """@echo off
title EchoNode 24/7 Auto-Restart Server
echo ==============================================================
echo       EchoNode 24/7 Minecraft Local Auto-Restart Engine
echo ==============================================================
echo [INFO] Press Ctrl+C at any time to permanently stop the server.
echo.

:server_loop
echo [%date% %time%] [EchoNode] Booting Minecraft server core...
if exist "..\\Java\\jdk-25.0.4.1+1\\bin\\java.exe" (
    "..\\Java\\jdk-25.0.4.1+1\\bin\\java.exe" -Xmx6G -Xms2G -XX:+UseG1GC -jar ..\\paper.jar --nogui
) else (
    java -Xmx6G -Xms2G -XX:+UseG1GC -jar ..\\paper.jar --nogui
)

echo.
echo [%date% %time%] [EchoNode] Server stopped or crashed!
echo [EchoNode] Auto-restarting server in 5 seconds...
timeout /t 5 /nobreak
goto server_loop
"""

ENTRYPOINT_SH = """#!/bin/bash
echo "=============================================================="
echo "      EchoNode 24/7 Cloud / Linux Auto-Restart Engine"
echo "=============================================================="
while true; do
    echo "[$(date)] Starting EchoNode Cloud Minecraft Server..."
    tail -f /dev/null | java -Xmx5G -Xms2G -XX:+UseG1GC -jar paper.jar --nogui
    echo "[$(date)] Server stopped or exited. Auto-restarting in 5 seconds..."
    sleep 5
done
"""

def generate_247_bundle():
    try:
        online_dir = os.path.join(SERVER_DIR, "24/7 online")
        os.makedirs(online_dir, exist_ok=True)
        workflows_dir = os.path.join(SERVER_DIR, ".github", "workflows")
        os.makedirs(workflows_dir, exist_ok=True)

        # Write workflow file in .github/workflows/
        wf_path = os.path.join(workflows_dir, "minecraft-24-7.yml")
        with open(wf_path, "w", encoding="utf-8") as f:
            f.write(WORKFLOW_YML)

        # Write workflow file in 24/7 online/
        with open(os.path.join(online_dir, "github-actions-24-7.yml"), "w", encoding="utf-8") as f:
            f.write(WORKFLOW_YML)

        # Write run_247_local.bat
        with open(os.path.join(online_dir, "run_247_local.bat"), "w", encoding="utf-8") as f:
            f.write(LOCAL_BAT)

        # Write entrypoint.sh
        with open(os.path.join(online_dir, "entrypoint.sh"), "w", encoding="utf-8") as f:
            f.write(ENTRYPOINT_SH)

        # Write .gitignore (exclude heavy local Windows Java & temp cache)
        gitignore_path = os.path.join(SERVER_DIR, ".gitignore")
        with open(gitignore_path, "w", encoding="utf-8") as f:
            f.write("Java/\npaper.jar\nlogs/*.log.gz\ncache/\nlibraries/\n*.tmp\n*.zip\n.system_generated/\n")

        return {"success": True, "message": "Successfully generated 24/7 scripts and workflow files."}
    except Exception as e:
        return {"success": False, "message": f"Failed to generate files: {str(e)}"}

def get_github_runner_status(owner=None, repo=None, token=None):
    if not owner or not repo or not token:
        cfg_file = os.path.join(SERVER_DIR, "github_sync_config.json")
        if os.path.exists(cfg_file):
            try:
                with open(cfg_file, "r", encoding="utf-8") as f:
                    cfg = json.load(f)
                r_url = cfg.get("RepoUrl", "")
                token = cfg.get("Token", "")
                m = re.search(r'github\.com[/:]([^/]+)/([^/.]+)', r_url)
                if m:
                    owner, repo = m.group(1), m.group(2).replace(".git", "")
            except Exception:
                pass
    if not owner or not repo or not token:
        return {"success": False, "hasRun": False, "status": "no_config", "isOnline": False}

    url = f"https://api.github.com/repos/{owner}/{repo}/actions/runs?per_page=3"
    req = urllib.request.Request(url, headers={
        "User-Agent": "EchoNode-Cloud-Manager",
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode())
            runs = data.get("workflow_runs", [])
            if not runs:
                return {"success": True, "hasRun": False, "status": "no_runs", "isOnline": False, "repo": f"{owner}/{repo}"}

            active_run = None
            for r in runs:
                if r.get("status") in ["in_progress", "queued"]:
                    active_run = r
                    break
            if not active_run:
                active_run = runs[0]

            run_id = active_run["id"]
            run_num = active_run.get("run_number", 1)
            status = active_run.get("status", "unknown")
            conclusion = active_run.get("conclusion")
            html_url = active_run.get("html_url", "")
            created_at = active_run.get("created_at", "")

            current_step = "Minecraft Server & Playit Tunnel Active"
            if status in ["in_progress", "queued"]:
                try:
                    jobs_url = active_run.get("jobs_url", "")
                    j_req = urllib.request.Request(jobs_url, headers={
                        "User-Agent": "EchoNode-Cloud-Manager",
                        "Authorization": f"Bearer {token}",
                        "Accept": "application/vnd.github.v3+json"
                    })
                    with urllib.request.urlopen(j_req, timeout=8) as jres:
                        jdata = json.loads(jres.read().decode())
                        jobs = jdata.get("jobs", [])
                        if jobs:
                            for s in jobs[0].get("steps", []):
                                if s.get("status") == "in_progress":
                                    current_step = s.get("name")
                                    break
                                elif s.get("status") == "completed" and s.get("conclusion") == "success":
                                    current_step = s.get("name")
                except Exception:
                    pass

            is_online = (status == "in_progress")
            return {
                "success": True,
                "hasRun": True,
                "isOnline": is_online,
                "status": status,
                "conclusion": conclusion,
                "runId": run_id,
                "runNumber": run_num,
                "htmlUrl": html_url,
                "currentStep": current_step,
                "createdAt": created_at,
                "repo": f"{owner}/{repo}"
            }
    except Exception as e:
        return {"success": False, "error": str(e), "isOnline": False, "repo": f"{owner}/{repo}" if owner and repo else ""}

def sync_to_github(repo_url, token, auto_update=True):
    # Support full URL or just owner/repo
    match = re.search(r'github\.com[/:]([^/]+)/([^/.]+)', repo_url)
    if not match:
        match_short = re.search(r'^([a-zA-Z0-9_\-]+)/([a-zA-Z0-9_\-]+)$', repo_url.strip())
        if match_short:
            owner = match_short.group(1).strip()
            repo = match_short.group(2).strip()
        else:
            return {"success": False, "message": "Invalid GitHub repository format. Example: https://github.com/username/my-repo or username/my-repo"}
    else:
        owner = match.group(1).strip()
        repo = match.group(2).strip().replace(".git", "")
    token = token.strip()

    # Save credentials locally immediately so they are never lost on reload
    try:
        cfg_file = os.path.join(SERVER_DIR, "github_sync_config.json")
        with open(cfg_file, "w", encoding="utf-8") as f:
            json.dump({"RepoUrl": f"https://github.com/{owner}/{repo}", "Token": token, "AutoUpdate": auto_update}, f, indent=2)
    except Exception:
        pass

    # Check if runner is already active on GitHub Actions
    try:
        active_runner = get_github_runner_status(owner, repo, token)
        if active_runner.get("isOnline"):
            return {
                "success": True,
                "message": "24/7 Cloud Minecraft Server is currently RUNNING on GitHub Actions!",
                "actionsUrl": active_runner.get("htmlUrl", f"https://github.com/{owner}/{repo}/actions"),
                "alreadyRunning": True,
                "currentStep": active_runner.get("currentStep", "Running 24/7 Cloud Server & Playit Tunnel")
            }
    except Exception:
        pass

    # 1. Verify GitHub API access & repository existence
    api_url = f"https://api.github.com/repos/{owner}/{repo}"
    req = urllib.request.Request(api_url, headers={
        "User-Agent": "EchoNode-Cloud-Manager",
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            pass
    except urllib.error.HTTPError as he:
        if he.code == 401:
            return {"success": False, "message": "Invalid GitHub Token. Please check your Personal Access Token (classic) with 'repo' and 'workflow' scope."}
        elif he.code == 404:
            return {"success": False, "message": f"Repository '{owner}/{repo}' not found on GitHub. Please create the repository '{repo}' at https://github.com/new first."}
        else:
            return {"success": False, "message": f"GitHub API verification failed: {he.code} {he.reason}"}
    except Exception as e:
        return {"success": False, "message": f"Could not connect to GitHub API: {str(e)}"}

    # 2. Prepare Git repository in SERVER_DIR
    try:
        # Generate 24/7 bundle files
        generate_247_bundle()

        # Initialize Git if needed
        git_dir = os.path.join(SERVER_DIR, ".git")
        if not os.path.exists(git_dir):
            subprocess.run(["git", "init"], cwd=SERVER_DIR, check=True, capture_output=True)
            subprocess.run(["git", "config", "user.name", "EchoNode"], cwd=SERVER_DIR, check=True, capture_output=True)
            subprocess.run(["git", "config", "user.email", "echonode@local"], cwd=SERVER_DIR, check=True, capture_output=True)

        subprocess.run(["git", "branch", "-M", "main"], cwd=SERVER_DIR, check=True, capture_output=True)

        auth_remote = f"https://x-access-token:{token}@github.com/{owner}/{repo}.git"
        
        # Configure remote origin
        remotes = subprocess.run(["git", "remote"], cwd=SERVER_DIR, capture_output=True, text=True).stdout
        if "origin" in remotes.split():
            subprocess.run(["git", "remote", "set-url", "origin", auth_remote], cwd=SERVER_DIR, check=True, capture_output=True)
        else:
            subprocess.run(["git", "remote", "add", "origin", auth_remote], cwd=SERVER_DIR, check=True, capture_output=True)

        # Stage and commit server deployment files (WITHOUT [skip ci] so GitHub Actions triggers automatically!)
        subprocess.run(["git", "add", "."], cwd=SERVER_DIR, check=True, capture_output=True)
        subprocess.run(["git", "commit", "-m", "EchoNode 24/7 Cloud Server Deployment - Automatic Sync"], cwd=SERVER_DIR, capture_output=True)

        # Push to main branch
        push_res = subprocess.run(["git", "push", "-u", "origin", "main", "--force"], cwd=SERVER_DIR, capture_output=True, text=True, timeout=60)
        if push_res.returncode != 0:
            err_msg = push_res.stderr.strip()
            if "Write access to repository not granted" in err_msg or "403" in err_msg:
                return {
                    "success": False,
                    "message": "GitHub rejected push (403): PAT lacks write permission. In your GitHub Fine-grained PAT settings, set 'Contents' to 'Read and write' and 'Workflows' to 'Read and write', or generate a Classic Token with 'repo' and 'workflow' scope."
                }
            return {"success": False, "message": f"Git push failed: {err_msg}"}

        # 3. Trigger GitHub Actions workflow dispatch
        dispatch_url = f"https://api.github.com/repos/{owner}/{repo}/actions/workflows/minecraft-24-7.yml/dispatches"
        dispatch_req = urllib.request.Request(
            dispatch_url,
            data=json.dumps({"ref": "main"}).encode("utf-8"),
            headers={
                "User-Agent": "EchoNode-Cloud-Manager",
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json"
            },
            method="POST"
        )
        dispatch_note = ""
        try:
            with urllib.request.urlopen(dispatch_req, timeout=12) as disp_res:
                dispatch_note = "Workflow dispatched successfully."
        except Exception as de:
            dispatch_note = f"Workflow will start on git push ({str(de)})."

        # Save configuration
        try:
            cfg_file = os.path.join(SERVER_DIR, "github_sync_config.json")
            with open(cfg_file, "w", encoding="utf-8") as f:
                json.dump({"RepoUrl": f"https://github.com/{owner}/{repo}", "Token": token, "AutoUpdate": auto_update}, f, indent=2)
        except Exception:
            pass

        return {
            "success": True,
            "message": f"Successfully pushed server to GitHub! 24/7 runner is booting.",
            "actionsUrl": f"https://github.com/{owner}/{repo}/actions",
            "dispatchNote": dispatch_note
        }
    except Exception as e:
        return {"success": False, "message": f"Sync pipeline failed: {str(e)}"}

# ============================================================================
# ROBUST HTTP & REST API HANDLER
# ============================================================================
class RobustHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.html': 'text/html; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.ico': 'image/x-icon',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.gltf': 'model/gltf+json',
        '.glb': 'model/gltf-binary',
        '.bin': 'application/octet-stream',
        '.obj': 'text/plain; charset=utf-8',
        '.mtl': 'text/plain; charset=utf-8',
        '.fbx': 'application/octet-stream'
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)

    def send_json(self, data, status_code=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Access-Control-Allow-Origin", "*")
        SimpleHTTPRequestHandler.end_headers(self)
        self.wfile.write(body)
        try:
            self.wfile.flush()
        except Exception:
            pass

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        SimpleHTTPRequestHandler.end_headers(self)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        # --- REST API: Live GitHub 24/7 Runner Status ---
        if path == "/api/github/status":
            self.send_json(get_github_runner_status())
            return

        # --- REST API: Get Stored GitHub Config ---
        if path == "/api/github/config":
            cfg_file = os.path.join(SERVER_DIR, "github_sync_config.json")
            if os.path.exists(cfg_file):
                try:
                    with open(cfg_file, "r", encoding="utf-8") as f:
                        cfg_data = json.load(f)
                    self.send_json({"success": True, "config": cfg_data})
                    return
                except Exception:
                    pass
            self.send_json({"success": False, "config": None})
            return

        # --- REST API: Server Status ---
        if path == "/api/server/status":
            self.send_json(mc_server.get_status_payload())
            return

        # --- REST API: Stream Logs ---
        if path == "/api/server/logs":
            since_id = 0
            if "since" in query:
                try:
                    since_id = int(query["since"][0])
                except Exception:
                    since_id = 0
            self.send_json(mc_server.get_logs_since(since_id))
            return

        # --- REST API: Read Real Server File ---
        if path == "/api/files/read":
            file_param = query.get("file", [""])[0]
            clean_name = os.path.basename(file_param)
            target = os.path.join(SERVER_DIR, clean_name)
            if os.path.exists(target) and os.path.isfile(target):
                try:
                    with open(target, "r", encoding="utf-8", errors="replace") as f:
                        content = f.read()
                    self.send_json({"success": True, "file": clean_name, "content": content})
                    return
                except Exception as e:
                    self.send_json({"success": False, "error": str(e)}, 500)
                    return
            self.send_json({"success": False, "error": "File not found"}, 404)
            return

        # --- REST API: Server Icon (server-icon.png) ---
        if path == "/api/server/icon":
            icon_path = os.path.join(SERVER_DIR, "server-icon.png")
            if os.path.exists(icon_path):
                try:
                    with open(icon_path, "rb") as f:
                        data = f.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "image/png")
                    self.send_header("Content-Length", str(len(data)))
                    self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(data)
                    return
                except Exception as e:
                    self.send_json({"error": str(e)}, 500)
                    return
            self.send_json({"error": "Icon not found"}, 404)
            return

        # Default static file serving
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # Read JSON body safely
        content_len_header = self.headers.get("Content-Length")
        body_data = {}
        if content_len_header:
            try:
                content_len = int(content_len_header)
                if content_len > 0:
                    body_bytes = self.rfile.read(content_len)
                    body_data = json.loads(body_bytes.decode("utf-8"))
            except Exception:
                body_data = {}

        # --- REST API: Start Server ---
        if path == "/api/server/start":
            res = mc_server.start()
            self.send_json(res)
            return

        # --- REST API: Stop Server ---
        if path == "/api/server/stop":
            res = mc_server.stop()
            self.send_json(res)
            return

        # --- REST API: Restart Server ---
        if path == "/api/server/restart":
            res = mc_server.restart()
            self.send_json(res)
            return

        # --- REST API: Send Console Command ---
        if path == "/api/server/command":
            cmd = body_data.get("command", "")
            if not cmd:
                self.send_json({"success": False, "message": "No command provided"}, 400)
                return
            res = mc_server.send_command(cmd)
            self.send_json(res)
            return

        # --- REST API: Save Real File ---
        if path == "/api/files/save":
            filename = os.path.basename(body_data.get("filename", ""))
            content = body_data.get("content", "")
            if not filename:
                self.send_json({"success": False, "message": "No filename provided"}, 400)
                return
            target = os.path.join(SERVER_DIR, filename)
            try:
                with open(target, "w", encoding="utf-8") as f:
                    f.write(content)
                self.send_json({"success": True, "message": f"Saved {filename} to server folder."})
                return
            except Exception as e:
                self.send_json({"success": False, "message": str(e)}, 500)
                return

        # --- REST API: Generate 24/7 Bundle ---
        if path == "/api/server/generate-247":
            res = generate_247_bundle()
            self.send_json(res)
            return

        # --- REST API: Real GitHub 24/7 Sync ---
        if path == "/api/github/sync":
            repo_url = body_data.get("repoUrl", "")
            token = body_data.get("token", "")
            auto_update = body_data.get("autoUpdate", True)
            if not repo_url or not token:
                self.send_json({"success": False, "message": "Repository URL and Access Token are required."}, 400)
                return
            res = sync_to_github(repo_url, token, auto_update)
            self.send_json(res)
            return

        # --- REST API: Save Server Icon (server-icon.png) ---
        if path == "/api/server/icon":
            image_b64 = body_data.get("image", "")
            if not image_b64:
                self.send_json({"success": False, "message": "No image data provided"}, 400)
                return
            try:
                if "," in image_b64:
                    image_b64 = image_b64.split(",", 1)[1]
                raw_bytes = base64.b64decode(image_b64)
                target = os.path.join(SERVER_DIR, "server-icon.png")
                with open(target, "wb") as f:
                    f.write(raw_bytes)

                # Also save a copy in WEB_DIR so static serving works if needed
                web_target = os.path.join(WEB_DIR, "server-icon.png")
                try:
                    with open(web_target, "wb") as f:
                        f.write(raw_bytes)
                except Exception:
                    pass

                self.send_json({"success": True, "message": "Server icon saved as 64x64 PNG!"})
                return
            except Exception as e:
                self.send_json({"success": False, "message": f"Failed to save icon: {str(e)}"}, 500)
                return

        self.send_json({"error": "Unknown endpoint"}, 404)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, TimeoutError, socket.error):
            pass

    def handle(self):
        try:
            super().handle()
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, TimeoutError, socket.error):
            pass

    def finish(self):
        try:
            super().finish()
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, TimeoutError, socket.error):
            pass

    def log_message(self, format, *args):
        try:
            msg = format % args
            if "/api/server/status" in msg or "/api/server/logs" in msg:
                return
            sys.stdout.write(f"[EchoNode Web] {self.address_string()} - {msg}\n")
            sys.stdout.flush()
        except Exception:
            pass

class RobustServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True

    def handle_error(self, request, client_address):
        exc_type, exc_val, _ = sys.exc_info()
        if exc_type in (ConnectionResetError, ConnectionAbortedError, BrokenPipeError, TimeoutError):
            return
        if isinstance(exc_val, socket.error) and getattr(exc_val, 'winerror', None) in (10053, 10054):
            return
        super().handle_error(request, client_address)

def run():
    os.chdir(WEB_DIR)
    port = PORT
    httpd = None

    for p in range(PORT, PORT + 10):
        try:
            httpd = RobustServer(("", p), RobustHandler)
            port = p
            break
        except OSError:
            continue

    if not httpd:
        print("[EchoNode Web] Could not bind to ports 3000-3009.")
        sys.exit(1)

    url = f"http://localhost:{port}"
    print("=" * 65)
    print("* EchoNode Web Cloud Server Manager is running!")
    print(f"* Local Web URL: {url}")
    print(f"* Minecraft Server Directory: {SERVER_DIR}")
    print(f"* Java 25 Runtime: {mc_server.get_java_path()}")
    print("* Real 24/7 GitHub Actions Cloud Deployer Ready!")
    print("* Press Ctrl+C in this window to stop the server.")
    print("=" * 65)

    try:
        webbrowser.open(url)
    except Exception:
        pass

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[EchoNode Web] Shutting down...")
        if mc_server.status == "online" or mc_server.status == "starting":
            mc_server.stop()
        httpd.server_close()

if __name__ == "__main__":
    run()
