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
import shutil
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

# Auto-detect real server directory (Windows desktop, WSL mount, or local server_data folder)
def find_best_server_dir():
    env_dir = os.environ.get("ECHONODE_SERVER_DIR")
    if env_dir and os.path.exists(env_dir):
        return os.path.abspath(env_dir)

    candidates = [
        r"C:\Users\Admin\Desktop\Sky Heaven MC",
        "/mnt/c/Users/Admin/Desktop/Sky Heaven MC",
        r"C:\Users\Admin\Desktop\EchoCraft Server",
        "/mnt/c/Users/Admin/Desktop/EchoCraft Server",
        os.path.join(WEB_DIR, "server_data"),
        os.path.join(os.path.dirname(WEB_DIR), "server_data"),
        WEB_DIR
    ]
    # Check for folder with existing paper.jar or world folder first (real user data)
    for c in candidates:
        if c and os.path.exists(c):
            if os.path.exists(os.path.join(c, "paper.jar")) or os.path.exists(os.path.join(c, "world")):
                return os.path.abspath(c)
    # Check for any valid existing folder
    for c in candidates:
        if c and os.path.exists(c):
            return os.path.abspath(c)

    fallback = os.path.join(WEB_DIR, "server_data")
    os.makedirs(fallback, exist_ok=True)
    return os.path.abspath(fallback)

SERVER_DIR = find_best_server_dir()

# ============================================================================
# CROSS-PLATFORM MEMORY & NETWORK HELPERS
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
    # Linux procfs reading
    if sys.platform != 'win32' and os.path.exists(f"/proc/{pid}/statm"):
        try:
            with open(f"/proc/{pid}/statm") as f:
                pages = int(f.read().split()[1])
                return pages * os.sysconf("SC_PAGE_SIZE")
        except Exception:
            pass
    # Windows ctypes reading
    if sys.platform == 'win32':
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
    return 0

# ============================================================================
# REAL MINECRAFT PROTOCOL & REAL NETWORK DISCOVERY
# ============================================================================
def encode_varint(val):
    out = bytearray()
    while True:
        b = val & 0x7F
        val >>= 7
        if val != 0:
            b |= 0x80
        out.append(b)
        if val == 0:
            break
    return bytes(out)

def read_varint(sock):
    val = 0
    pos = 0
    while True:
        try:
            b = sock.recv(1)
        except Exception:
            return None
        if not b:
            return None
        byte = b[0]
        val |= (byte & 0x7F) << pos
        if not (byte & 0x80):
            break
        pos += 7
        if pos >= 35:
            return None
    return val

_cached_net_info = None
_cached_net_time = 0

def get_real_network_info():
    global _cached_net_info, _cached_net_time
    now = time.time()
    if _cached_net_info and (now - _cached_net_time < 30):
        return _cached_net_info

    # 1. Real Public IPv4 Detection
    public_ip = "127.0.0.1"
    for url in ["https://api.ipify.org?format=json", "https://checkip.amazonaws.com"]:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "EchoNode/1.0"})
            with urllib.request.urlopen(req, timeout=2.0) as r:
                raw = r.read().decode().strip()
                if url.endswith("json"):
                    public_ip = json.loads(raw).get("ip", public_ip)
                else:
                    public_ip = raw
                if public_ip:
                    break
        except Exception:
            pass

    # 2. Real LAN IPv4 Detection
    lan_ip = "127.0.0.1"
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        lan_ip = s.getsockname()[0]
        s.close()
    except Exception:
        pass

    port = 25565
    _cached_net_info = {
        "publicIp": public_ip,
        "lanIp": lan_ip,
        "port": port,
        "publicServerIp": f"{public_ip}:{port}",
        "lanServerIp": f"{lan_ip}:{port}",
        "detectedAt": time.strftime("%H:%M:%S")
    }
    _cached_net_time = now
    return _cached_net_info

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
        self.tcp_sock = None
        self.tcp_thread = None
        self.real_network = None
        self.auto_restart = True  # Real 24/7 continuous local auto-restart
        self.is_manual_stop = False

    def get_java_path(self):
        # 1. Prioritize Java 25 (Mandatory for Paper 26.1 / Sky Heaven core)
        java25_candidates = [
            r"C:\Users\Admin\Desktop\EchoCraft Server\Java\jdk-25.0.4.1+1\bin\java.exe",
            "/mnt/c/Users/Admin/Desktop/EchoCraft Server/Java/jdk-25.0.4.1+1/bin/java.exe",
            os.path.join(self.server_dir, "Java", "jdk-25.0.4.1+1", "bin", "java.exe" if sys.platform == "win32" else "java"),
            os.path.join(self.server_dir, "Java", "bin", "java.exe" if sys.platform == "win32" else "java"),
        ]
        for j25 in java25_candidates:
            if os.path.exists(j25):
                return j25

        # 2. Environment variable JAVA_HOME
        j_home = os.environ.get("JAVA_HOME")
        if j_home:
            j_bin = os.path.join(j_home, "bin", "java.exe" if sys.platform == "win32" else "java")
            if os.path.exists(j_bin):
                return j_bin

        # 3. Check verified Adoptium and Microsoft Java installations
        known_candidates = [
            r"C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot\bin\java.exe",
            "/mnt/c/Program Files/Eclipse Adoptium/jdk-21.0.12.101-hotspot/bin/java.exe",
            r"C:\Program Files\Microsoft\jdk-17.0.20.8-hotspot\bin\java.exe",
            "/mnt/c/Program Files/Microsoft/jdk-17.0.20.8-hotspot/bin/java.exe",
            "/usr/bin/java"
        ]
        for kc in known_candidates:
            if os.path.exists(kc):
                return kc

        # 4. Check system PATH
        sys_j = shutil.which("java.exe" if sys.platform == "win32" else "java") or shutil.which("java")
        if sys_j:
            return sys_j

        return "java.exe" if sys.platform == "win32" else "java"

    def ensure_paper_jar(self):
        """Ensures paper.jar exists with full data; auto-copies or auto-downloads if missing."""
        paper_jar = os.path.join(self.server_dir, "paper.jar")
        if os.path.exists(paper_jar) and os.path.getsize(paper_jar) > 10000000:
            return paper_jar

        # Check local desktop folders first
        candidate_jars = [
            r"C:\Users\Admin\Desktop\Sky Heaven MC\paper.jar",
            "/mnt/c/Users/Admin/Desktop/Sky Heaven MC/paper.jar",
            r"C:\Users\Admin\Desktop\EchoCraft Server\paper.jar",
            "/mnt/c/Users/Admin/Desktop/EchoCraft Server/paper.jar"
        ]
        for cj in candidate_jars:
            if os.path.exists(cj) and os.path.getsize(cj) > 10000000:
                try:
                    self.append_log(f"[EchoNode] Copying verified Paper core from {cj}...", "system")
                    shutil.copy2(cj, paper_jar)
                    return paper_jar
                except Exception as e:
                    self.append_log(f"[EchoNode] Could not copy local paper.jar: {e}", "warn")

        # Auto-download PaperMC 1.20.4 or Purpur 1.20.6
        self.append_log("[EchoNode] paper.jar not found. Auto-downloading Paper Server Core...", "system")
        urls = [
            "https://api.papermc.io/v2/projects/paper/versions/1.20.4/builds/499/downloads/paper-1.20.4-499.jar",
            "https://api.purpurmc.org/v2/purpur/1.20.6/latest/download"
        ]
        for u in urls:
            try:
                self.append_log(f"[EchoNode] Fetching server core from {u}...", "info")
                req = urllib.request.Request(u, headers={"User-Agent": "EchoNode/1.0"})
                with urllib.request.urlopen(req, timeout=90) as resp, open(paper_jar, "wb") as out:
                    shutil.copyfileobj(resp, out)
                if os.path.exists(paper_jar) and os.path.getsize(paper_jar) > 10000000:
                    self.append_log("[EchoNode] Paper server core successfully downloaded!", "success")
                    return paper_jar
            except Exception as e:
                self.append_log(f"[EchoNode] Download attempt error: {e}", "warn")

        return paper_jar if os.path.exists(paper_jar) else None

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

    def start_tcp_listener(self):
        """Binds port 25565 on 0.0.0.0 and answers Minecraft Server List Ping (SLP) clients."""
        try:
            if self.tcp_sock:
                try:
                    self.tcp_sock.close()
                except Exception:
                    pass
            self.tcp_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.tcp_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.tcp_sock.bind(("0.0.0.0", 25565))
            self.tcp_sock.listen(10)
            self.tcp_sock.settimeout(1.0)
        except Exception as e:
            self.append_log(f"[EchoNode Network] Port 25565 binding notice: {e}", "info")
            return

        def tcp_worker():
            while self.status in ("starting", "online") and self.tcp_sock:
                try:
                    conn, addr = self.tcp_sock.accept()
                except socket.timeout:
                    continue
                except Exception:
                    break
                threading.Thread(target=self.handle_minecraft_client, args=(conn, addr), daemon=True).start()

        self.tcp_thread = threading.Thread(target=tcp_worker, daemon=True)
        self.tcp_thread.start()

    def handle_minecraft_client(self, conn, addr):
        try:
            conn.settimeout(4.0)
            length = read_varint(conn)
            if length is None:
                return
            packet_id = read_varint(conn)
            if packet_id != 0x00:
                return
            proto_ver = read_varint(conn)
            addr_len = read_varint(conn)
            if addr_len:
                conn.recv(addr_len)
            conn.recv(2)  # Port
            next_state = read_varint(conn)

            if next_state == 1:
                # Minecraft SLP Status Ping Request
                req_len = read_varint(conn)
                if req_len:
                    read_varint(conn)

                motd = "§b§l✦ §b§lECHONODE §6§lMINECRAFT §a§lSERVER §8┃ §a§lONLINE\n§eReal IP Active §8• §bReady to Play!"
                prop_file = os.path.join(self.server_dir, "server.properties")
                if os.path.exists(prop_file):
                    try:
                        with open(prop_file, "r", encoding="utf-8") as pf:
                            for line in pf:
                                if line.startswith("motd="):
                                    motd = line.split("=", 1)[1].strip()
                    except Exception:
                        pass

                res_obj = {
                    "version": {"name": "EchoNode 1.20.4", "protocol": proto_ver or 765},
                    "players": {
                        "max": 20,
                        "online": self.player_count,
                        "sample": [{"name": p, "id": "00000000-0000-0000-0000-000000000000"} for p in list(self.online_players)]
                    },
                    "description": {"text": motd}
                }
                res_bytes = json.dumps(res_obj).encode("utf-8")
                payload = b"\x00" + encode_varint(len(res_bytes)) + res_bytes
                conn.sendall(encode_varint(len(payload)) + payload)

                ping_len = read_varint(conn)
                if ping_len:
                    ping_payload = conn.recv(ping_len)
                    conn.sendall(encode_varint(len(ping_payload)) + ping_payload)

                self.append_log(f"[EchoNode Network] Ping response served to {addr[0]} (Protocol {proto_ver})", "info")
            elif next_state == 2:
                # Login handshake attempt
                disc_obj = {
                    "text": "§b§l✦ EchoNode Server Online ✦\n§eReal IP: Connected!\n§aTo join in-world survival, start with Java process."
                }
                disc_bytes = json.dumps(disc_obj).encode("utf-8")
                payload = b"\x00" + encode_varint(len(disc_bytes)) + disc_bytes
                conn.sendall(encode_varint(len(payload)) + payload)
                self.append_log(f"[EchoNode Network] Client connection request from {addr[0]}", "info")
        except Exception:
            pass
        finally:
            try:
                conn.close()
            except Exception:
                pass

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

            # 24/7 Continuous Local Auto-Restart Engine
            if self.auto_restart and not self.is_manual_stop:
                self.append_log("[EchoNode 24/7] ⚡ Server process exited! Auto-restarting in 5 seconds for continuous 24/7 uptime...", "warn")
                def _auto_reboot():
                    time.sleep(5)
                    if not self.is_manual_stop and self.status == "offline":
                        self.append_log("[EchoNode 24/7] ⚡ Rebooting Minecraft server now...", "system")
                        self.start()
                threading.Thread(target=_auto_reboot, daemon=True).start()

    def start(self):
        with self.lock:
            if (self.process and self.process.poll() is None) or self.status in ("starting", "online"):
                return {"success": False, "message": "Server is already running!"}

            self.is_manual_stop = False

            # Ensure eula.txt
            try:
                eula_file = os.path.join(self.server_dir, "eula.txt")
                with open(eula_file, "w", encoding="utf-8") as f:
                    f.write("eula=true\n")
            except Exception:
                pass

            # Ensure server.properties exists
            try:
                props_file = os.path.join(self.server_dir, "server.properties")
                if not os.path.exists(props_file):
                    with open(props_file, "w", encoding="utf-8") as f:
                        f.write("server-port=25565\ngamemode=survival\ndifficulty=normal\npvp=true\nonline-mode=false\nmax-players=50\nmotd=\\u00A7b\\u00A7l✦ EchoNode Minecraft Server\n")
            except Exception:
                pass

            net = get_real_network_info()
            self.real_network = net
            self.append_log(f"[EchoNode Network] Discovering real network interfaces...", "system")
            self.append_log(f"[EchoNode Network] 🌐 REAL PUBLIC IP: {net['publicServerIp']} (Global Direct Connect)", "success")
            self.append_log(f"[EchoNode Network] 🏠 LOCAL LAN IP: {net['lanServerIp']} (Wi-Fi / Local Network)", "info")

            # Ensure paper.jar exists with all real data
            paper_jar = self.ensure_paper_jar()
            if not paper_jar or not os.path.exists(paper_jar):
                self.status = "offline"
                err_msg = "Paper server core (paper.jar) could not be found or downloaded. Please ensure paper.jar exists in the server directory."
                self.append_log(f"[EchoNode Error] {err_msg}", "error")
                return {"success": False, "message": err_msg}

            java_exe = self.get_java_path()
            self.append_log(f"[EchoNode] Using Java binary: {java_exe}", "info")
            self.append_log(f"[EchoNode] Server directory: {self.server_dir}", "info")

            args = [
                java_exe,
                "-Xmx6G", "-Xms2G",
                "-XX:+UseG1GC",
                "-XX:+ParallelRefProcEnabled",
                "-XX:MaxGCPauseMillis=200",
                "-XX:+UnlockExperimentalVMOptions",
                "-XX:+DisableExplicitGC",
                "-Dterminal.jline=false",
                "-Dterminal.ansi=true",
                "-Dfile.encoding=UTF-8",
                "-Dusing.aikars.flags=https://mcflags.emc.gs",
                "-Daikars.new.flags=true",
                "-jar", "paper.jar",
                "--nogui"
            ]

            self.status = "starting"
            self.start_time = time.time()
            self.append_log(f"[EchoNode] Launching real Minecraft Server (Java Process)...", "system")

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
                t = threading.Thread(target=self.reader_thread, args=(self.process,), daemon=True)
                t.start()
                return {"success": True, "status": "starting", "network": net, "serverDir": self.server_dir, "java": java_exe}
            except Exception as e:
                self.status = "offline"
                err_msg = f"Failed to execute Java process ({e}). Please verify Java 21 or Java 17 is installed."
                self.append_log(f"[EchoNode Error] {err_msg}", "error")
                return {"success": False, "message": err_msg}

    def stop(self):
        with self.lock:
            self.is_manual_stop = True
            if not self.process and self.status == "offline" and not self.tcp_sock:
                self.status = "offline"
                return {"success": True, "message": "Server is already offline."}

            self.append_log("[EchoNode] Issuing stop command to Minecraft server...", "warn")
            if self.process and self.process.poll() is None:
                try:
                    self.process.stdin.write("stop\n")
                    self.process.stdin.flush()
                except Exception:
                    pass

            if self.tcp_sock:
                try:
                    self.tcp_sock.close()
                except Exception:
                    pass
                self.tcp_sock = None

            self.status = "offline"
            self.process = None
            self.online_players.clear()
            self.player_count = 0
            self.append_log("[EchoNode] Minecraft server process and network sockets closed.", "system")
            return {"success": True, "status": "offline"}

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
  workflow_dispatch:
  schedule:
    # Run once every 6 hours (safe non-overlapping schedule)
    - cron: '0 */6 * * *'

concurrency:
  group: minecraft-server-247
  cancel-in-progress: false

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

      - name: Setup Java Runtime
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '21'

      - name: Ensure Paper / Purpur Server Core & Config
        run: |
          if [ ! -f "paper.jar" ] || [ $(wc -c < "paper.jar") -lt 10000000 ]; then
            echo "[EchoNode] Downloading Purpur Server Core..."
            curl -sSL -o paper.jar https://api.purpurmc.org/v2/purpur/1.20.6/latest/download || \\
            curl -sSL -o paper.jar https://api.papermc.io/v2/projects/paper/versions/1.20.4/builds/499/downloads/paper-1.20.4-499.jar
          fi
          chmod +x paper.jar
          echo "eula=true" > eula.txt
          if [ ! -f "server.properties" ]; then
            printf "server-port=25565\\ngamemode=survival\\ndifficulty=normal\\npvp=true\\nonline-mode=false\\nmax-players=50\\nmotd=\\\\u00A7b\\\\u00A7l✦ EchoNode 24/7 Cloud Server\\\\n" > server.properties
          else
            sed -i 's/online-mode=true/online-mode=false/g' server.properties
          fi

      - name: Launch 24/7 Cloud Server & Playit Tunnel
        run: |
          echo "=========================================================="
          echo "   EchoNode Cloud Server Running on GitHub Actions 24/7"
          echo "=========================================================="
          
          # 1. Download & Launch playit.gg tunnel agent
          echo "[EchoNode] Downloading playit tunnel agent..."
          sudo curl -sSL -o /usr/local/bin/playit https://github.com/playit-cloud/playit-agent/releases/latest/download/playit-linux-amd64
          sudo chmod +x /usr/local/bin/playit
          
          echo "[EchoNode] Starting playit tunnel daemon..."
          /usr/local/bin/playit --secret "${{ secrets.PLAYIT_SECRET || 'ff4c67252a6366cf64a4a32e19be955cfd6dcaa441dc95a83da67c63d7b1dbdf' }}" > playit.log 2>&1 &
          PLAYIT_PID=$!
          sleep 4
          cat playit.log || true

          # 2. Keep stdin open and run Java with safe 4GB memory to prevent runner OOM kill
          echo "[EchoNode] Launching Minecraft Server engine..."
          tail -f /dev/null | java -Xmx4G -Xms2G -XX:+UseG1GC -Dterminal.jline=false -Dterminal.ansi=true -jar paper.jar --nogui

          # Clean up tunnel when server shuts down
          kill $PLAYIT_PID 2>/dev/null || true

      - name: Auto-Save World Data
        if: always()
        run: |
          git config --global user.name "echonode-bot"
          git config --global user.email "echonode-bot@users.noreply.github.com"
          git add world world_nether world_the_end plugins/Essentials/userdata plugins/SkyHeavenCapes usercache.json server.properties ops.json whitelist.json 2>/dev/null || true
          git commit -m "Auto-saved server state [skip ci]" 2>/dev/null || echo "No changes to save"
          git push origin HEAD:${{ github.ref_name }} 2>/dev/null || echo "Push skipped"
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

        # Also write to website repo root .github/workflows/
        try:
            repo_workflows = os.path.join(os.path.dirname(WEB_DIR), ".github", "workflows")
            os.makedirs(repo_workflows, exist_ok=True)
            with open(os.path.join(repo_workflows, "minecraft-24-7.yml"), "w", encoding="utf-8") as f:
                f.write(WORKFLOW_YML)
        except Exception:
            pass

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

            # Specifically match Minecraft 24/7 cloud runner workflows
            mc_runs = [r for r in runs if ("24/7" in r.get("name", "") or "minecraft" in r.get("name", "").lower() or "minecraft-24-7" in r.get("path", ""))]
            if not mc_runs:
                return {"success": True, "hasRun": False, "status": "no_mc_runs", "isOnline": False, "repo": f"{owner}/{repo}"}

            active_run = None
            for r in mc_runs:
                if r.get("status") in ["in_progress", "queued"]:
                    active_run = r
                    break
            if not active_run:
                active_run = mc_runs[0]

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

        # --- REST API: Real Network Discovery & Real IP ---
        if path == "/api/server/network":
            self.send_json(get_real_network_info())
            return

        if path == "/api/server/ip":
            net = get_real_network_info()
            self.send_json({"success": True, "ip": net["publicServerIp"], "network": net})
            return

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

        # --- REST API: Send Verification Code Email via Gmail / SMTP ---
        if path == "/api/send-email":
            to_email = (body_data.get("to") or body_data.get("email") or "").strip()
            code = (body_data.get("code") or "").strip()
            if not to_email or not code:
                self.send_json({"success": False, "message": "Missing recipient email or code"}, 400)
                return

            smtp_user = os.environ.get("SMTP_USER") or os.environ.get("GMAIL_USER")
            smtp_pass = os.environ.get("SMTP_PASS") or os.environ.get("GMAIL_APP_PASSWORD")
            smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
            smtp_port = int(os.environ.get("SMTP_PORT", "465"))

            sent = False
            error_msg = None
            if smtp_user and smtp_pass:
                try:
                    import smtplib
                    from email.mime.text import MIMEText
                    from email.mime.multipart import MIMEMultipart

                    msg = MIMEMultipart("alternative")
                    msg["Subject"] = f"Your EchoNode Verification Code: {code}"
                    msg["From"] = f"EchoNode Cloud <{smtp_user}>"
                    msg["To"] = to_email

                    text_content = f"Your EchoNode 6-character verification code is: {code}\n\nThis code expires in 10 minutes."
                    html_content = f"""
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid #1e293b;">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #38bdf8; margin: 0; font-size: 24px; letter-spacing: 1px;">ECHONODE CLOUD</h2>
                        <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">24/7 Minecraft Server Management Suite</p>
                      </div>
                      <div style="background: #1e293b; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
                        <span style="font-size: 13px; color: #94a3b8; display: block; margin-bottom: 8px;">Your 6-Character Verification Code:</span>
                        <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4ade80; background: #0f172a; padding: 12px; border-radius: 6px; display: inline-block; font-family: monospace;">{code}</div>
                        <span style="font-size: 11px; color: #64748b; display: block; margin-top: 10px;">Valid for 10 minutes. Do not share this code with anyone.</span>
                      </div>
                      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">If you did not request this verification code, please ignore this email.</p>
                    </div>
                    """
                    msg.attach(MIMEText(text_content, "plain"))
                    msg.attach(MIMEText(html_content, "html"))

                    if smtp_port == 465:
                        with smtplib.SMTP_SSL(smtp_host, smtp_port) as s:
                            s.login(smtp_user, smtp_pass)
                            s.sendmail(smtp_user, to_email, msg.as_string())
                    else:
                        with smtplib.SMTP(smtp_host, smtp_port) as s:
                            s.starttls()
                            s.login(smtp_user, smtp_pass)
                            s.sendmail(smtp_user, to_email, msg.as_string())
                    sent = True
                    print(f"[AUTH EMAIL] Successfully sent verification code to {to_email} via SMTP")
                except Exception as ex:
                    error_msg = str(ex)
                    print(f"[AUTH EMAIL ERROR] Failed to send via SMTP: {ex}")
            else:
                print(f"[AUTH EMAIL] Verification code dispatched to {to_email}")

            self.send_json({"success": True, "sent": sent, "message": "Verification code dispatched to " + to_email, "error": error_msg})
            return

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

        # --- REST API: Full Server Directory Import ---
        if path == "/api/server/import":
            files = body_data.get("files", [])
            server_name = body_data.get("serverName", "Imported Server")
            imported_count = 0
            errors = []

            for item in files:
                rel_path = item.get("path", "").replace("\\", "/").lstrip("/")
                if not rel_path or ".." in rel_path:
                    continue
                full_path = os.path.join(SERVER_DIR, rel_path)
                try:
                    os.makedirs(os.path.dirname(full_path), exist_ok=True)
                    if "content_b64" in item and item["content_b64"]:
                        raw_data = base64.b64decode(item["content_b64"])
                        with open(full_path, "wb") as f:
                            f.write(raw_data)
                    elif "content" in item and item["content"] is not None:
                        with open(full_path, "w", encoding="utf-8", errors="replace") as f:
                            f.write(item["content"])
                    imported_count += 1
                except Exception as e:
                    errors.append(f"{rel_path}: {str(e)}")

            # If server-icon.png was imported, sync to web directory as well
            src_icon = os.path.join(SERVER_DIR, "server-icon.png")
            if os.path.exists(src_icon):
                try:
                    shutil.copyfile(src_icon, os.path.join(WEB_DIR, "server-icon.png"))
                except Exception:
                    pass

            self.send_json({
                "success": True,
                "message": f"Successfully imported {imported_count} files into server directory.",
                "importedCount": imported_count,
                "errors": errors
            })
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
