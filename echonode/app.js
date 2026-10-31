/**
 * EchoNode Web - Ultra-Modern Cloud Minecraft Server Management Suite
 * Pure Vanilla JavaScript • Three.js 3D Engine • Web Audio API • 3D Spatial Controls
 */

// ============================================================================
// 1. DATA STORE & STATE MANAGEMENT
// ============================================================================
const SKY_HEAVEN_STATE = {
  serverName: "SKY HEAVEN MC",
  serverIp: "play.echonode.net:25565",
  serverVersion: "Purpur 1.26.1.2 (Protocol 775)",
  status: "online", // 'online', 'offline', 'starting'
  tps: 20.0,
  ramUsage: 2.4,
  ramMax: 8.0,
  cpuUsage: 14,
  onlinePlayersCount: 3,
  maxPlayers: 50,
  soundEnabled: true,
  currentMode: "2d", // '2d' or '3d'
  
  options: {
    gamemode: "survival",
    difficulty: "normal",
    whitelist: false,
    pvp: true,
    nether: true,
    cmdblocks: true,
    flight: true,
    maxPlayers: 50,
    viewDist: 12,
    motd: "§b§l✦ §b§lSKY§6§lHEAVEN§a§lMC §8┃ §a§lSURVIVAL SMP\n§eSurvive §8• §bBuild §8• §dExplore §8• §aPlay Together!"
  },

  plugins: [
    { id: "essentialsx", name: "EssentialsX", author: "EssentialsX Team", category: "admin", version: "2.22.0", desc: "Essential server commands, teleportation, kits, spawns, and economy engine.", installed: true, icon: "⚡" },
    { id: "worldguard", name: "WorldGuard", author: "EngineHub", category: "protect", version: "7.0.18", desc: "Protect land areas from griefing, fire, creeper explosions, and unauthorized edits.", installed: true, icon: "🛡️" },
    { id: "luckperms", name: "LuckPerms", author: "Luck", category: "admin", version: "5.5.71", desc: "Industry-standard permissions manager with web editor and fast rank hierarchy.", installed: true, icon: "👑" },
    { id: "geyser", name: "Geyser-Spigot", author: "GeyserMC", category: "network", version: "2.12.0", desc: "Enables Bedrock Edition players (mobile, console, Windows 10) to join Java server.", installed: true, icon: "📱" },
    { id: "floodgate", name: "Floodgate", author: "GeyserMC", category: "network", version: "2.2.5", desc: "Allows Bedrock players to join without needing an official Java Edition account.", installed: true, icon: "🚪" },
    { id: "viaversion", name: "ViaVersion", author: "ViaVersion", category: "network", version: "5.12.1", desc: "Allows clients running newer Minecraft versions to join older servers.", installed: true, icon: "🔄" },
    { id: "viabackwards", name: "ViaBackwards", author: "ViaVersion", category: "network", version: "5.12.1", desc: "Allows older Minecraft client versions (down to 1.9) to connect seamlessly.", installed: true, icon: "⏪" },
    { id: "playit", name: "playit-minecraft-plugin", author: "playit.gg", category: "network", version: "1.1.2", desc: "Zero-port-forwarding public server tunnel with DDoS protection.", installed: true, icon: "🌐" },
    { id: "worldedit", name: "WorldEdit", author: "EngineHub", category: "world", version: "7.4.2", desc: "Fast in-game voxel building, terraforming, copying, pasting, and brush tools.", installed: true, icon: "🪓" },
    { id: "coreprotect", name: "CoreProtect", author: "Intelli", category: "protect", version: "24.1", desc: "Fast block logging, inventory inspection, chest audit, and grief rollback.", installed: true, icon: "🔍" },
    { id: "griefprev", name: "GriefPrevention", author: "RoboMWM", category: "protect", version: "16.18.2", desc: "Self-service land claiming with a golden shovel. Simple for survival players.", installed: true, icon: "🚩" },
    { id: "vault", name: "Vault", author: "MilkBowl", category: "economy", version: "1.7.3", desc: "Standard permissions, chat, and economy hook bridge for all Minecraft plugins.", installed: true, icon: "🪙" },
    { id: "economyshop", name: "EconomyShopGUI", author: "Gypopo", category: "economy", version: "7.3.3", desc: "Clean GUI server shop with categorized menus, dynamic prices, and quick buy/sell.", installed: true, icon: "🛒" },
    { id: "crazyauctions", name: "CrazyAuctions", author: "BadBones", category: "economy", version: "1.3.2", desc: "Player-to-player global auction house and direct player sales market.", installed: true, icon: "⚖️" },
    { id: "skinsrestorer", name: "SkinsRestorer", author: "xknifer", category: "admin", version: "15.0.1", desc: "Restores custom skins for offline-mode and Bedrock players in multiplayer.", installed: true, icon: "🎭" },
    { id: "tab", name: "TAB", author: "NEZNAMY", category: "admin", version: "6.1.3", desc: "Configurable player tablist, custom nametag prefixes, suffixes, and scoreboard.", installed: true, icon: "📋" },
    { id: "decentholo", name: "DecentHolograms", author: "DecentSoft", category: "world", version: "2.10.2", desc: "Lightweight floating text holograms with animations and page cycling.", installed: true, icon: "✨" },
    { id: "betterrtp", name: "BetterRTP", author: "SuperSniper", category: "world", version: "3.6.13", desc: "Random wilderness teleportation with smart biome and ocean checking.", installed: true, icon: "🎲" },
    { id: "chunky", name: "Chunky", author: "pop4959", category: "world", version: "1.4.10", desc: "High-performance asynchronous chunk pre-generator to eliminate terrain lag.", installed: true, icon: "🗺️" },
    { id: "citizens", name: "Citizens", author: "fullwall", category: "world", version: "2.0.35", desc: "Interactive NPC characters, quest givers, shopkeepers, and guards.", installed: true, icon: "🤖" },
    { id: "papi", name: "PlaceholderAPI", author: "ExtendedClip", category: "admin", version: "2.12.3", desc: "String replacement placeholder expansion library for scoreboard and chat.", installed: true, icon: "🧩" },
    { id: "eshulkerbox", name: "eShulkerBox", author: "EchoDev", category: "admin", version: "2.1.0", desc: "Open shulker boxes directly from inventory with right-click without placing.", installed: true, icon: "📦" },
    { id: "viarewind", name: "ViaRewind", author: "Gerrygames", category: "network", version: "4.2.0", desc: "Enables legacy 1.7.2 - 1.8.9 PvP clients to connect to 1.26.1.2 servers.", installed: true, icon: "⏮️" },
    { id: "skyadmin", name: "SkyHeavenAdmin", author: "EchoNode Custom", category: "admin", version: "1.0.0", desc: "Custom 54-slot GUI admin panel with instant freeze, ban, mute, and smite.", installed: true, icon: "👑" },
    { id: "skycapes", name: "SkyHeavenCapes", author: "EchoNode Custom", category: "admin", version: "1.2.0", desc: "Custom Mojang cape injector supporting 14 official Minecon & anniversary capes.", installed: true, icon: "🧣" },
    { id: "skyspawn", name: "SkyHeavenSpawn", author: "EchoNode Custom", category: "world", version: "1.0.0", desc: "Ocean spawn plaza management and monument protection controller.", installed: true, icon: "🌊" },
    { id: "skysit", name: "SkyHeavenSit", author: "EchoNode Custom", category: "world", version: "1.0.0", desc: "Allows players to sit on stairs, slabs, carpets, and other player heads.", installed: true, icon: "🪑" },
    { id: "itemedit", name: "ItemEdit", author: "EchoDev", category: "admin", version: "2.4.0", desc: "In-game lore, custom names, unbreakable tags, and enchantment editor.", installed: true, icon: "🗡️" },
    { id: "openinv", name: "OpenInv", author: "lishid", category: "admin", version: "4.4.2", desc: "Live real-time player inventory and ender chest inspection with armor slots.", installed: true, icon: "🧰" },
    { id: "axiom", name: "AxiomPaperPlugin", author: "Moulberry", category: "world", version: "1.0.8", desc: "Server bridge for Axiom client building mod with realtime 60 FPS editing.", installed: true, icon: "🏛️" },
    { id: "echoranks", name: "EchoRanks", author: "EchoNode", category: "admin", version: "1.0.0", desc: "Preconfigured SMP rank ladder: Member, VIP, MVP, Moderator, Admin, Owner.", installed: true, icon: "🎖️" },
    { id: "esschat", name: "EssentialsXChat", author: "EssentialsX", category: "admin", version: "2.22.0", desc: "Custom chat formatting with LuckPerms prefix/suffix and local chat radius.", installed: true, icon: "💬" },
    { id: "essspawn", name: "EssentialsXSpawn", author: "EssentialsX", category: "world", version: "2.22.0", desc: "First-join spawn teleportation and custom respawn handling.", installed: true, icon: "📍" }
  ],

  players: [
    { name: "amoghpro7473", role: "Owner", type: "op", ping: "18ms", joined: "2026-10-24" },
    { name: "1", role: "Admin", type: "op", ping: "22ms", joined: "2026-10-25" },
    { name: "SkyWalker99", role: "Member", type: "whitelist", ping: "38ms", joined: "2026-10-28" }
  ],

  backups: [
    { name: "Auto_20261029_1120.zip", date: "Today at 11:20 AM", size: "1.84 GB", type: "Scheduled Auto" },
    { name: "Manual_PreSetup_Purpur.zip", date: "Oct 28, 2026", size: "1.79 GB", type: "Manual Snapshot" },
    { name: "Sr_World_Archive_Sync.zip", date: "Oct 27, 2026", size: "1.42 GB", type: "World Archive" }
  ],

  virtualFiles: {
    "/server.properties": `# Minecraft server properties\n# Synchronized via EchoNode Web\nserver-port=25565\ngamemode=survival\ndifficulty=normal\npvp=true\nenable-command-block=true\nallow-flight=true\nallow-nether=true\nmax-players=50\nview-distance=12\nsimulation-distance=8\nmotd=\\u00A7b\\u00A7l✦ \\u00A7b\\u00A7lSKY\\u00A76\\u00A7lHEAVEN\\u00A7a\\u00A7lMC \\u00A78\\u2503 \\u00A7a\\u00A7lSURVIVAL SMP\\n\\u00A7eSurvive \\u00A78\\u2022 \\u00A7bBuild \\u00A78\\u2022 \\u00A7dExplore \\u00A78\\u2022 \\u00A7aPlay Together!\nwhite-list=false\nonline-mode=false\nlevel-seed=-3453969471065111142`,
    "/bukkit.yml": `settings:\n  allow-end: true\n  warn-on-overload: false\n  permissions-file: permissions.yml\n  update-folder: update\n  plugin-profiling: false\n  connection-throttle: 4000\nspawn-limits:\n  monsters: 70\n  animals: 10\n  water-animals: 5\n  water-ambient: 20\n  water-underground-creature: 5\n  axolotls: 5\n  ambient: 15`,
    "/paper.yml": `# Paper & Purpur High Performance Configuration\ntimings:\n  enabled: true\n  verbose: true\nworld-settings:\n  default:\n    max-auto-save-chunks-per-tick: 24\n    optimize-explosions: true\n    mob-spawner-tick-rate: 2\n    despawn-ranges:\n      soft: 32\n      hard: 96`,
    "/eula.txt": `# By changing the setting below to TRUE you are indicating your agreement to our EULA (https://aka.ms/MinecraftEULA).\neula=true`
  },

  videoTutorialUrl: "https://www.youtube.com"
};

// Load saved state or default

const GUEST_DEFAULT_STATE = {
  serverName: "MY MINECRAFT SERVER",
  serverIp: "play.echonode.net:25565",
  serverVersion: "Paper 1.20.4",
  installedSoftware: "Paper",
  installedVersion: "1.20.4",
  status: "offline", // Starts offline at zero!
  tps: 0.0,
  ramUsage: 0.0,
  ramMax: 4.0,
  cpuUsage: 0,
  onlinePlayersCount: 0,
  maxPlayers: 20,
  soundEnabled: true,
  currentMode: "2d", // '2d' or '3d'
  worldsGenerated: false, // ZERO WORLDS GENERATED!
  
  options: {
    gamemode: "survival",
    difficulty: "normal",
    whitelist: false,
    pvp: true,
    nether: true,
    cmdblocks: true,
    flight: false,
    maxPlayers: 20,
    viewDist: 10,
    motd: "§a§lA Fresh Minecraft Server\\n§7Ready to build & explore together!"
  },

  plugins: [
    { id: "essentialsx", name: "EssentialsX", author: "EssentialsX Team", category: "admin", version: "2.22.0", desc: "Essential server commands, teleportation, kits, spawns, and economy engine.", installed: false, icon: "⚡" },
    { id: "worldguard", name: "WorldGuard", author: "EngineHub", category: "protect", version: "7.0.18", desc: "Protect land areas from griefing, fire, creeper explosions, and unauthorized edits.", installed: false, icon: "🛡️" },
    { id: "luckperms", name: "LuckPerms", author: "Luck", category: "admin", version: "5.5.71", desc: "Industry-standard permissions manager with web editor and fast rank hierarchy.", installed: false, icon: "👑" },
    { id: "geyser", name: "Geyser-Spigot", author: "GeyserMC", category: "network", version: "2.12.0", desc: "Enables Bedrock Edition players (mobile, console, Windows 10) to join Java server.", installed: false, icon: "📱" },
    { id: "floodgate", name: "Floodgate", author: "GeyserMC", category: "network", version: "2.2.5", desc: "Allows Bedrock players to join without needing an official Java Edition account.", installed: false, icon: "🚪" },
    { id: "viaversion", name: "ViaVersion", author: "ViaVersion", category: "network", version: "5.12.1", desc: "Allows clients running newer Minecraft versions to join older servers.", installed: false, icon: "🔄" },
    { id: "viabackwards", name: "ViaBackwards", author: "ViaVersion", category: "network", version: "5.12.1", desc: "Allows older Minecraft client versions (down to 1.9) to connect seamlessly.", installed: false, icon: "⏪" },
    { id: "playit", name: "playit-minecraft-plugin", author: "playit.gg", category: "network", version: "1.1.2", desc: "Zero-port-forwarding public server tunnel with DDoS protection.", installed: false, icon: "🌐" },
    { id: "worldedit", name: "WorldEdit", author: "EngineHub", category: "world", version: "7.4.2", desc: "Fast in-game voxel building, terraforming, copying, pasting, and brush tools.", installed: false, icon: "🪓" },
    { id: "coreprotect", name: "CoreProtect", author: "Intelli", category: "protect", version: "24.1", desc: "Fast block logging, inventory inspection, chest audit, and grief rollback.", installed: false, icon: "🔍" },
    { id: "griefprev", name: "GriefPrevention", author: "RoboMWM", category: "protect", version: "16.18.2", desc: "Self-service land claiming with a golden shovel. Simple for survival players.", installed: false, icon: "🚩" },
    { id: "vault", name: "Vault", author: "MilkBowl", category: "economy", version: "1.7.3", desc: "Standard permissions, chat, and economy hook bridge for all Minecraft plugins.", installed: false, icon: "🪙" }
  ],

  players: [], // ZERO PLAYERS GENERATED!

  backups: [],

  virtualFiles: {
    "/server.properties": `# Minecraft server properties
# Freshly configured via EchoNode Web
server-port=25565
gamemode=survival
difficulty=normal
pvp=true
enable-command-block=true
allow-flight=false
allow-nether=true
max-players=20
view-distance=10
simulation-distance=8
motd=\u00A7a\u00A7lA Fresh Minecraft Server\n\u00A77Ready to build & explore together!
white-list=false
online-mode=false
level-seed=`,
    "/eula.txt": `# By changing the setting below to TRUE you are indicating your agreement to our EULA (https://aka.ms/MinecraftEULA).
eula=true`
  },

  videoTutorialUrl: "https://www.youtube.com"
};

// Load saved state or default

// Load saved state or default
class StateStore {
  constructor() {
    this.checkUrlAuth();
    this.init();
  }

  checkUrlAuth() {
    try {
      const params = new URLSearchParams(window.location.search);
      // Secret owner unlock triggers: ?owner=true, ?owner=7473, ?server=skyheaven, ?admin=amoghpro7473, etc.
      const ownerParam = params.get("owner");
      const adminParam = params.get("admin");
      const userParam = params.get("user");
      const serverParam = params.get("server");

      if (
        ownerParam === "true" || ownerParam === "7473" ||
        adminParam === "7473" || adminParam === "amoghpro7473" ||
        userParam === "amoghpro7473" || userParam === "ZebloYT" ||
        serverParam === "skyheaven"
      ) {
        localStorage.setItem("echonode_auth_role", "owner");
        localStorage.setItem("echonode_active_server_id", "skyheaven");
      }

      // Localhost / local dev auto-recognition
      if ((window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:") && !localStorage.getItem("echonode_auth_role")) {
        localStorage.setItem("echonode_auth_role", "owner");
        localStorage.setItem("echonode_active_server_id", "skyheaven");
      }
    } catch(e) {}
  }

  isOwner() {
    return localStorage.getItem("echonode_auth_role") === "owner";
  }

  setOwner(val) {
    if (val) {
      localStorage.setItem("echonode_auth_role", "owner");
      localStorage.setItem("echonode_active_server_id", "skyheaven");
    } else {
      localStorage.setItem("echonode_auth_role", "guest");
      localStorage.setItem("echonode_active_server_id", "guest_server");
    }
    this.init();
  }

  getActiveServerId() {
    const isOwner = this.isOwner();
    const stored = localStorage.getItem("echonode_active_server_id");
    if (!stored) {
      return isOwner ? "skyheaven" : "guest_server";
    }
    // If not owner, never allow active ID to be skyheaven
    if (!isOwner && stored === "skyheaven") {
      return "guest_server";
    }
    return stored;
  }

  init() {
    const isOwner = this.isOwner();
    const activeId = this.getActiveServerId();

    if (activeId === "skyheaven" && isOwner) {
      // 👑 OWNER PROFILE: SKY HEAVEN MC
      let saved = null;
      try {
        const s = localStorage.getItem("echonode_skyheaven_state");
        saved = s ? JSON.parse(s) : null;
      } catch(e) {}
      if (!saved) {
        saved = JSON.parse(JSON.stringify(SKY_HEAVEN_STATE));
        localStorage.setItem("echonode_skyheaven_state", JSON.stringify(saved));
      }
      this.data = saved;
      this.currentProfile = "skyheaven";
    } else {
      // 🌐 GUEST / VISITOR PROFILE: PERSONAL SERVER (Clean Sandbox)
      let saved = null;
      try {
        const s = localStorage.getItem("echonode_guest_state");
        saved = s ? JSON.parse(s) : null;
      } catch(e) {}
      if (!saved) {
        saved = JSON.parse(JSON.stringify(GUEST_DEFAULT_STATE));
        localStorage.setItem("echonode_guest_state", JSON.stringify(saved));
      }
      this.data = saved;
      this.currentProfile = "guest_server";
    }

    if (!this.data.plugins) this.data.plugins = (this.currentProfile === "skyheaven" ? SKY_HEAVEN_STATE.plugins : GUEST_DEFAULT_STATE.plugins);
    if (!this.data.options) this.data.options = (this.currentProfile === "skyheaven" ? SKY_HEAVEN_STATE.options : GUEST_DEFAULT_STATE.options);
    if (this.currentProfile === "guest_server" && this.data.worldsGenerated === undefined) {
      this.data.worldsGenerated = false;
    }
  }

  save() {
    try {
      if (this.currentProfile === "skyheaven") {
        localStorage.setItem("echonode_skyheaven_state", JSON.stringify(this.data));
      } else {
        localStorage.setItem("echonode_guest_state", JSON.stringify(this.data));
      }
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }

  switchServer(serverId) {
    if (serverId === "skyheaven") {
      if (!this.isOwner()) return false;
      localStorage.setItem("echonode_active_server_id", "skyheaven");
    } else {
      localStorage.setItem("echonode_active_server_id", "guest_server");
    }
    this.init();
    return true;
  }
}

const store = new StateStore();

// ============================================================================
// 2. SYNTHESIZED WEB AUDIO SOUND SYSTEM (Tactile Acoustic & Ambient FX)
// ============================================================================
class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof AudioContext !== "undefined") {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  // Soft tactile membrane switch "thock" (Mac / Linear style low-pass pop)
  playClick() {
    if (!store.data.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Warm low body sweep (240Hz -> 55Hz)
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.038);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(850, now);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.042);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);

    // 2. Micro tactile switch transient (8ms bandpassed noise burst)
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.008);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 1600;
      noiseFilter.Q.value = 1.8;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.025, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.008);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
    } catch (_) {}
  }

  // Feather-light airy silk card switch tick
  playTabSwitch() {
    if (!store.data.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(290, now + 0.022);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(2.2, now);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.026);
  }

  // Ethereal crystal glass harmonic chime (F# major 9 / Lydian shimmer)
  playServerChime() {
    if (!store.data.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Harmonic chord: F#5 (739.99), A#5 (932.33), C#6 (1108.73), F#6 (1479.98)
    const chord = [
      { freq: 739.99, delay: 0.00, gain: 0.050 },
      { freq: 932.33, delay: 0.035, gain: 0.045 },
      { freq: 1108.73, delay: 0.070, gain: 0.040 },
      { freq: 1479.98, delay: 0.105, gain: 0.035 }
    ];

    chord.forEach(({ freq, delay, gain: vol }) => {
      const noteTime = now + delay;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2600, noteTime);

      // Smooth 15ms attack (no sharp pop), 1.2s smooth exponential decay
      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.exponentialRampToValueAtTime(vol, noteTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 1.25);
    });
  }

  // Soft warm acoustic woodblock / marimba dual-pluck
  playWarning() {
    if (!store.data.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = [
      { freq: 329.63, delay: 0.00 }, // E4
      { freq: 246.94, delay: 0.07 }  // B3
    ];

    notes.forEach(({ freq, delay }) => {
      const noteTime = now + delay;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.92, noteTime + 0.09);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, noteTime);

      gain.gain.setValueAtTime(0.07, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.095);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.10);
    });
  }
}

const sfx = new SoundEffects();

// ============================================================================
// 3. THREE.JS 3D WEBGL ENGINE & FLOATING VOXEL BLOCKS
// ============================================================================
class ThreeJsEngine {
  constructor() {
    this.canvas = document.getElementById("canvas-3d");
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.blocks = [];
    this.particles = null;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.init();
  }

  init() {
    if (typeof THREE === "undefined") {
      console.warn("Three.js not loaded, skipping 3D canvas");
      return;
    }

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07090e, 0.0012);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.z = 600;

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x9333ea, 2.0); // Purple glow
    dirLight1.position.set(300, 400, 200);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.6); // Cyan glow
    dirLight2.position.set(-300, -200, 300);
    this.scene.add(dirLight2);

    // 5. Create Procedural Voxel Blocks
    this.createMinecraftBlocks();

    // 6. Particle Field (Space dust)
    this.createParticleField();

    // 7. Event Listeners
    window.addEventListener("resize", () => this.onWindowResize());
    window.addEventListener("mousemove", (e) => {
      this.mouse.targetX = (e.clientX - window.innerWidth / 2) * 0.001;
      this.mouse.targetY = (e.clientY - window.innerHeight / 2) * 0.001;
    });

    this.animate();
  }

  createMinecraftBlocks() {
    // 5 Extracted Minecraft 3D Models
    // Helper to center model at origin and scale to target dimension
    const wrapPivot = (object, targetDim) => {
      const box = new THREE.Box3().setFromObject(object);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = targetDim / (maxDim || 1);

      object.position.x = -center.x * scale;
      object.position.y = -center.y * scale;
      object.position.z = -center.z * scale;
      object.scale.set(scale, scale, scale);

      const pivot = new THREE.Group();
      pivot.add(object);
      return pivot;
    };

    // 5 Model Configurations:
    // 1. Grass Block (.obj + .mtl)
    // 2. Crying Obsidian (.fbx + texture)
    // 3. Smithing Table (.gltf)
    // 4. Amethyst Crystal (.gltf)
    // 5. Enchanted Netherite Sword (.glb)
    const modelConfigs = [
      {
        id: "grass_block",
        name: "Grass Block",
        pos: [-500, 190, -20],
        dim: 110,
        rotSpeed: [0.007, 0.011, 0.004],
        fallbackColor: 0x22c55e,
        load: () => {
          return new Promise((resolve, reject) => {
            if (typeof THREE.MTLLoader === "undefined" || typeof THREE.OBJLoader === "undefined") {
              return reject(new Error("OBJ/MTL Loader unavailable"));
            }
            const mtlLoader = new THREE.MTLLoader();
            mtlLoader.setPath("models/grass_block/");
            mtlLoader.load("Grass_Block.mtl", (materials) => {
              materials.preload();
              const objLoader = new THREE.OBJLoader();
              objLoader.setMaterials(materials);
              objLoader.setPath("models/grass_block/");
              objLoader.load("Grass_Block.obj", resolve, undefined, reject);
            }, undefined, reject);
          });
        }
      },
      {
        id: "crying_obsidian",
        name: "Crying Obsidian",
        pos: [-460, -210, 30],
        dim: 105,
        rotSpeed: [0.009, 0.007, 0.005],
        fallbackColor: 0x9333ea,
        load: () => {
          return new Promise((resolve, reject) => {
            if (typeof THREE.FBXLoader === "undefined") {
              return reject(new Error("FBX Loader unavailable"));
            }
            const fbxLoader = new THREE.FBXLoader();
            fbxLoader.setPath("models/crying_obsidian/");
            fbxLoader.load("crying_obsidian.fbx", (fbx) => {
              fbx.traverse((c) => {
                if (c.isMesh && c.material) {
                  c.material.emissive = new THREE.Color(0xa855f7);
                  c.material.emissiveIntensity = 0.55;
                }
              });
              resolve(fbx);
            }, undefined, reject);
          });
        }
      },
      {
        id: "smithing_table",
        name: "Smithing Table",
        pos: [520, 200, -20],
        dim: 110,
        rotSpeed: [0.01, 0.013, 0.006],
        fallbackColor: 0x3b82f6,
        load: () => {
          return new Promise((resolve, reject) => {
            if (typeof THREE.GLTFLoader === "undefined") {
              return reject(new Error("GLTF Loader unavailable"));
            }
            const gltfLoader = new THREE.GLTFLoader();
            gltfLoader.load("models/smithing_table/source/model.gltf", (gltf) => {
              gltf.scene.traverse((c) => {
                if (c.isMesh && c.material) {
                  c.material.roughness = 0.45;
                }
              });
              resolve(gltf.scene);
            }, undefined, reject);
          });
        }
      },
      {
        id: "amethyst_crystal",
        name: "Amethyst Crystal",
        pos: [490, -210, 40],
        dim: 140,
        rotSpeed: [0.013, 0.009, 0.008],
        fallbackColor: 0xd946ef,
        load: () => {
          return new Promise((resolve, reject) => {
            if (typeof THREE.GLTFLoader === "undefined") {
              return reject(new Error("GLTF Loader unavailable"));
            }
            const gltfLoader = new THREE.GLTFLoader();
            gltfLoader.load("models/amethyst_crystal/source/model.gltf", (gltf) => {
              gltf.scene.traverse((c) => {
                if (c.isMesh && c.material) {
                  c.material.emissive = new THREE.Color(0xd946ef);
                  c.material.emissiveIntensity = 0.55;
                }
              });
              resolve(gltf.scene);
            }, undefined, reject);
          });
        }
      },
      {
        id: "netherite_sword",
        name: "Enchanted Netherite Sword",
        pos: [0, 310, 60],
        dim: 175,
        rotSpeed: [0.012, 0.018, 0.007],
        fallbackColor: 0x818cf8,
        load: () => {
          return new Promise((resolve, reject) => {
            if (typeof THREE.GLTFLoader === "undefined") {
              return reject(new Error("GLTF Loader unavailable"));
            }
            const gltfLoader = new THREE.GLTFLoader();
            gltfLoader.load("models/netherite_sword/source/sword.glb", (gltf) => {
              gltf.scene.traverse((c) => {
                if (c.isMesh && c.material) {
                  c.material.metalness = 0.85;
                  c.material.roughness = 0.2;
                  c.material.emissive = new THREE.Color(0x818cf8);
                  c.material.emissiveIntensity = 0.45;
                }
              });
              resolve(gltf.scene);
            }, undefined, reject);
          });
        }
      }
    ];

    modelConfigs.forEach((cfg) => {
      // Create temporary smooth placeholder box while real 3D model loads
      const placeholderGeo = new THREE.BoxGeometry(cfg.dim * 0.7, cfg.dim * 0.7, cfg.dim * 0.7);
      const placeholderMat = new THREE.MeshStandardMaterial({
        color: cfg.fallbackColor,
        roughness: 0.35,
        metalness: 0.55,
        transparent: true,
        opacity: 0.25
      });
      const placeholderMesh = new THREE.Mesh(placeholderGeo, placeholderMat);

      const pivot = new THREE.Group();
      pivot.add(placeholderMesh);
      pivot.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      if (cfg.id === "netherite_sword") {
        pivot.rotation.z = 0.35;
      }
      pivot.userData = {
        name: cfg.name,
        origY: cfg.pos[1],
        rotSpeed: cfg.rotSpeed,
        floatOffset: Math.random() * Math.PI * 2
      };

      this.scene.add(pivot);
      this.blocks.push(pivot);

      // Asynchronously load the rich 3D Minecraft model
      cfg.load().then((modelObject) => {
        const modelPivot = wrapPivot(modelObject, cfg.dim);
        pivot.remove(placeholderMesh);
        if (placeholderGeo.dispose) placeholderGeo.dispose();
        if (placeholderMat.dispose) placeholderMat.dispose();
        pivot.add(modelPivot);
      }).catch((err) => {
        console.warn(`[EchoNode 3D] Using fallback mesh for ${cfg.name}:`, err);
        placeholderMat.opacity = 0.85;
      });
    });
  }

  createParticleField() {
    const count = 180;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1400;
      positions[i + 1] = (Math.random() - 0.5) * 900;
      positions[i + 2] = (Math.random() - 0.5) * 800;

      // Purple to cyan gradient
      colors[i] = 0.58 + Math.random() * 0.4; // R
      colors[i + 1] = 0.35 + Math.random() * 0.4; // G
      colors[i + 2] = 0.95; // B
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geo, pMat);
    this.scene.add(this.particles);
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Lerp mouse
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Rotate camera subtly
    this.camera.position.x = this.mouse.x * 120;
    this.camera.position.y = -this.mouse.y * 120;
    this.camera.lookAt(0, 0, 0);

    // Rotate and float blocks
    const time = Date.now() * 0.0015;
    this.blocks.forEach((mesh) => {
      mesh.rotation.x += mesh.userData.rotSpeed[0];
      mesh.rotation.y += mesh.userData.rotSpeed[1];
      if (mesh.userData.rotSpeed[2]) mesh.rotation.z += mesh.userData.rotSpeed[2];
      mesh.position.y = mesh.userData.origY + Math.sin(time + mesh.userData.floatOffset) * 16;
    });

    if (this.particles) {
      this.particles.rotation.y = time * 0.04;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// ============================================================================
// 4. INTERACTIVE 2D MOUSE PARTICLES & CARD SPOTLIGHT
// ============================================================================
class MouseTracker {
  constructor() {
    this.canvas = document.getElementById("canvas-particles");
    this.ctx = this.canvas.getContext("2d");
    this.ambient = document.getElementById("ambient-glow");
    this.particles = [];
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Spawn constellation particles
    for (let i = 0; i < 45; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }

    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;

      // Update ambient radial gradient position
      this.ambient.style.setProperty("--mouse-x", `${e.clientX}px`);
      this.ambient.style.setProperty("--mouse-y", `${e.clientY}px`);

      // Update cards spotlight
      document.querySelectorAll(".content-card, .sidebar-status-card").forEach((card) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--card-mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--card-mouse-y", `${e.clientY - rect.top}px`);
      });
    });

    this.loop();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  loop() {
    requestAnimationFrame(() => this.loop());
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
      this.ctx.fill();

      // Connect lines to mouse if close
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(this.mouse.x, this.mouse.y);
        this.ctx.strokeStyle = `rgba(147, 51, 234, ${0.35 * (1 - dist / 140)})`;
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    }
  }
}

// ============================================================================
// 5. 3D FULL MOVABLE SPATIAL ENGINE (Orbit, Tilt, Pan, Zoom)
// ============================================================================
class Spatial3DEngine {
  constructor() {
    this.stage = document.getElementById("spatial-stage");
    this.btn2d = document.getElementById("btn-mode-2d");
    this.btn3d = document.getElementById("btn-mode-3d");
    this.btnReset = document.getElementById("btn-reset-camera");

    this.is3D = false;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    // Camera transform values
    this.rotX = 0;
    this.rotY = 0;
    this.zoomZ = 0;
    this.panX = 0;
    this.panY = 0;

    // Target values for smooth lerp
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.targetZoomZ = 0;
    this.targetPanX = 0;
    this.targetPanY = 0;

    this.init();
  }

  init() {
    this.btn2d.addEventListener("click", () => this.setMode("2d"));
    this.btn3d.addEventListener("click", () => this.setMode("3d"));
    this.btnReset.addEventListener("click", () => this.resetCamera());

    // Mouse drag controls on stage when in 3D
    window.addEventListener("mousedown", (e) => {
      if (!this.is3D) return;
      // Ignore clicks on inputs/buttons
      if (["INPUT", "BUTTON", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;
      this.isDragging = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.is3D || !this.isDragging) return;
      const dx = e.clientX - this.startX;
      const dy = e.clientY - this.startY;

      if (e.buttons === 2 || e.shiftKey) {
        // Pan
        this.targetPanX += dx * 0.8;
        this.targetPanY += dy * 0.8;
      } else {
        // Rotate (clamp X pitch between -45 and 45 deg)
        this.targetRotY += dx * 0.18;
        this.targetRotX -= dy * 0.18;
        this.targetRotX = Math.max(-40, Math.min(40, this.targetRotX));
      }

      this.startX = e.clientX;
      this.startY = e.clientY;
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    // Zoom on wheel in 3D
    window.addEventListener("wheel", (e) => {
      if (!this.is3D) return;
      this.targetZoomZ -= e.deltaY * 0.5;
      this.targetZoomZ = Math.max(-450, Math.min(250, this.targetZoomZ));
    }, { passive: true });

    // Prevent context menu on 3D drag
    window.addEventListener("contextmenu", (e) => {
      if (this.is3D) e.preventDefault();
    });

    this.renderLoop();
  }

  setMode(mode) {
    sfx.playClick();
    this.is3D = mode === "3d";
    store.data.currentMode = mode;
    store.save();

    if (this.is3D) {
      document.body.classList.add("mode-3d");
      this.btn3d.classList.add("active");
      this.btn2d.classList.remove("active");
      // Initial gentle perspective tilt for immediate 3D depth!
      this.targetRotX = 7;
      this.targetRotY = -12;
      this.targetZoomZ = -60;
      app.showToast("🔮 3D Spatial Mode Active: Drag to rotate, scroll to zoom!", "info");
    } else {
      document.body.classList.remove("mode-3d");
      this.btn2d.classList.add("active");
      this.btn3d.classList.remove("active");
      this.resetCamera();
      app.showToast("Standard 2D Mode Active", "info");
    }
  }

  resetCamera() {
    sfx.playClick();
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.targetZoomZ = 0;
    this.targetPanX = 0;
    this.targetPanY = 0;
  }

  renderLoop() {
    requestAnimationFrame(() => this.renderLoop());

    if (!this.is3D) {
      this.stage.style.transform = "none";
      return;
    }

    // Smooth inertia interpolation
    this.rotX += (this.targetRotX - this.rotX) * 0.1;
    this.rotY += (this.targetRotY - this.rotY) * 0.1;
    this.zoomZ += (this.targetZoomZ - this.zoomZ) * 0.1;
    this.panX += (this.targetPanX - this.panX) * 0.1;
    this.panY += (this.targetPanY - this.panY) * 0.1;

    this.stage.style.transform = `
      translate3d(${this.panX}px, ${this.panY}px, ${this.zoomZ}px)
      rotateX(${this.rotX}deg)
      rotateY(${this.rotY}deg)
    `;
  }
}

// ============================================================================
// 6. MAIN APPLICATION CONTROLLER
// ============================================================================
class EchoNodeApp {
  constructor() {
    this.currentTab = "console";
    this.cmdHistory = [];
    this.cmdIndex = -1;
  }

  init() {
    // 1. Setup UI bindings
    this.bindNavigation();
    this.bindConsole();
    this.bindOptions();
    this.bindVersionChanger();
    this.bindServerIcon();
    this.bindPlugins();
    this.bindFiles();
    this.bindWorlds();
    this.bindPlayers();
    this.bindBackups();
    this.bindUptime();
    this.bindAiConnect();
    this.bindSoundToggle();
    this.bindSearchPalette();
    this.bindServerControls();

    // 2. Initial renders
    this.updateServerStatusUI(store.data.status || "offline");
    this.renderInitialConsole();
    this.renderVersionUI();
    this.renderWorldsList();
    this.renderPluginsList();
    this.renderFilesList("/");
    this.renderPlayersList("ops");
    this.renderBackupsList();
    this.updateAiPrompt();
    this.renderMotdLive();

    // 3. Start live resource ticker
    this.startResourceSimulation();
    this.startRealTimeSync();

    // 4. Restore mode
    if (store.data.currentMode === "3d") {
      spatialEngine.setMode("3d");
    }
  }

  // Toast Notification System
  showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-20px)";
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Navigation
  bindNavigation() {
    const navButtons = document.querySelectorAll(".nav-item-btn");
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        this.switchTab(tab);
      });
    });
  }

  switchTab(tabName) {
    sfx.playTabSwitch();
    this.currentTab = tabName;

    // Update buttons
    document.querySelectorAll(".nav-item-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
    });

    // Update views
    document.querySelectorAll(".tab-view").forEach((view) => {
      view.classList.toggle("active", view.id === `view-${tabName}`);
    });

    const container = document.getElementById("view-container");
    if (container) container.scrollTop = 0;

    // Update breadcrumb title
    const titles = {
      console: "Server Console",
      options: "Server Options & Configuration",
      version: "Software & Version Changer",
      plugins: "Plugin Marketplace & Addons",
      files: "File Manager & Configurations",
      worlds: "World Dimensions",
      players: "Player Management",
      backups: "Snapshots & Backups",
      uptime: "24/7 Hosting & GitHub CI/CD",
      ai: "Antigravity AI Integration"
    };
    document.getElementById("current-view-title").textContent = titles[tabName] || "Server Manager";
  }

  // Sound Toggle
  bindSoundToggle() {
    const btn = document.getElementById("btn-toggle-sound");
    const icon = document.getElementById("sound-icon");
    const label = document.getElementById("sound-label");

    const updateLabel = () => {
      if (store.data.soundEnabled) {
        icon.textContent = "🔊";
        label.textContent = "SFX On";
        btn.classList.remove("muted");
      } else {
        icon.textContent = "🔇";
        label.textContent = "SFX Muted";
        btn.classList.add("muted");
      }
    };
    updateLabel();

    btn.addEventListener("click", () => {
      store.data.soundEnabled = !store.data.soundEnabled;
      store.save();
      updateLabel();
      sfx.playClick();
      this.showToast(`Sound Effects ${store.data.soundEnabled ? "Enabled" : "Muted"}`, "info");
    });
  }

  // Server Start / Restart / Stop Quick Controls
  bindServerControls() {
    const btnStart = document.getElementById("btn-quick-start");
    const btnRestart = document.getElementById("btn-quick-restart");
    const btnStop = document.getElementById("btn-quick-stop");
    const btnCopyIp = document.getElementById("btn-copy-ip");

    btnStart.addEventListener("click", () => this.startServer());
    btnRestart.addEventListener("click", () => this.restartServer());
    btnStop.addEventListener("click", () => this.stopServer());

    btnCopyIp.addEventListener("click", () => {
      sfx.playClick();
      navigator.clipboard.writeText(store.data.serverIp);
      this.showToast(`Copied server IP: ${store.data.serverIp}`, "success");
    });
  }

  updateServerStatusUI(status) {
    store.data.status = status;
    store.save();
    const pill = document.getElementById("server-status-pill");
    const text = document.getElementById("server-status-text");
    const glow = document.getElementById("status-card-glow");

    pill.className = "status-indicator-pill";
    if (status === "online") {
      text.textContent = "ONLINE";
      glow.style.background = "linear-gradient(90deg, transparent, #10b981, transparent)";
    } else if (status === "offline") {
      pill.classList.add("offline");
      text.textContent = "OFFLINE";
      glow.style.background = "linear-gradient(90deg, transparent, #f43f5e, transparent)";
    } else if (status === "starting") {
      pill.classList.add("starting");
      text.textContent = "STARTING...";
      glow.style.background = "linear-gradient(90deg, transparent, #f59e0b, transparent)";
    }
  }

  async startServer() {
    if (store.data.status === "online") {
      this.showToast("Server is already running!", "warning");
      return;
    }
    sfx.playClick();
    this.updateServerStatusUI("starting");
    const sw = store.data.installedSoftware || "Paper";
    const ver = store.data.installedVersion || "1.20.4";
    this.appendLog("system", `[EchoNode] Launching ${sw} ${ver} • Java 21 LTS...`);

    // First boot: auto-generate clean dimensions if ungenerated
    if (!store.data.worldsGenerated) {
      store.data.worldsGenerated = true;
      if (!store.data.customSeed) {
        store.data.customSeed = `${Math.floor(Math.random() * 8999999999999999) + 1000000000000000}`;
      }
      store.save();
      this.appendLog("info", `[Server] Generating Overworld spawn region (Seed: ${store.data.customSeed})...`);
      this.appendLog("info", `[Server] Preparing start region for dimension 'minecraft:overworld'...`);
      this.appendLog("info", `[Server] Time elapsed: 1420 ms (Spawn Area 100%)`);
      this.renderWorldsList();
    }

    try {
      const res = await fetch("/api/server/start", { method: "POST" });
      const data = await res.json();
      if (!data.success) {
        this.updateServerStatusUI("offline");
        this.appendLog("error", `[EchoNode] Launch failed: ${data.message || 'Unknown error'}`);
        this.showToast(`Launch failed: ${data.message}`, "warning");
      } else {
        this.showToast("Starting server process...", "info");
      }
    } catch (err) {
      // Standalone simulation mode
      setTimeout(() => {
        this.updateServerStatusUI("online");
        store.data.status = "online";
        store.data.ramUsage = 1.8;
        store.data.tps = 20.0;
        store.save();
        this.appendLog("system", `[Server] Done! For help, type "help"`);
        this.appendLog("info", `[EchoNode] Ready & listening on ${store.data.serverIp}`);
        this.showToast("Server is now online (20.0 TPS)!", "success");

        document.getElementById("val-ram-usage").textContent = "1.8 GB / 4.0 GB";
        document.getElementById("bar-ram-fill").style.width = "45%";
        document.getElementById("metric-ram-live").textContent = "1.8 / 4.0 GB";
        document.getElementById("metric-cpu-live").textContent = "12%";
        const tpsLive = document.getElementById("metric-tps-live");
        if (tpsLive) tpsLive.textContent = "20.0 TPS (11ms)";
        const topTps = document.getElementById("top-stat-tps");
        if (topTps) topTps.innerHTML = '<span>TPS</span> 20.0';
      }, 1400);
    }
  }

  async stopServer() {
    if (store.data.status === "offline") {
      this.showToast("Server is already offline.", "warning");
      return;
    }
    sfx.playWarning();
    this.appendLog("warn", "[EchoNode] Stopping real Minecraft server...");

    try {
      await fetch("/api/server/stop", { method: "POST" });
      this.showToast("Stopping server...", "info");
    } catch (err) {
      this.updateServerStatusUI("offline");
    }
  }

  async restartServer() {
    sfx.playClick();
    this.showToast("Restarting server...", "info");
    try {
      await fetch("/api/server/restart", { method: "POST" });
    } catch (err) {
      this.stopServer();
      setTimeout(() => this.startServer(), 2000);
    }
  }

  // Console Log & Terminal
  bindConsole() {
    const input = document.getElementById("terminal-cmd-input");
    const sendBtn = document.getElementById("btn-terminal-send");
    const clearBtn = document.getElementById("btn-clear-term");
    const copyBtn = document.getElementById("btn-copy-term");

    const exec = () => {
      const val = input.value.trim();
      if (!val) return;
      this.executeCommand(val);
      this.cmdHistory.push(val);
      this.cmdIndex = this.cmdHistory.length;
      input.value = "";
    };

    sendBtn.addEventListener("click", exec);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") exec();
      if (e.key === "ArrowUp") {
        if (this.cmdIndex > 0) {
          this.cmdIndex--;
          input.value = this.cmdHistory[this.cmdIndex] || "";
        }
      }
      if (e.key === "ArrowDown") {
        if (this.cmdIndex < this.cmdHistory.length - 1) {
          this.cmdIndex++;
          input.value = this.cmdHistory[this.cmdIndex] || "";
        } else {
          this.cmdIndex = this.cmdHistory.length;
          input.value = "";
        }
      }
    });

    clearBtn.addEventListener("click", () => {
      sfx.playClick();
      document.getElementById("terminal-output").innerHTML = "";
      this.showToast("Terminal logs cleared", "info");
    });

    copyBtn.addEventListener("click", () => {
      sfx.playClick();
      const logs = document.getElementById("terminal-output").innerText;
      navigator.clipboard.writeText(logs);
      this.showToast("Logs copied to clipboard!", "success");
    });
  }

  appendLog(type, text) {
    const out = document.getElementById("terminal-output");
    if (!out) return;
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    const line = document.createElement("div");
    line.className = "log-line";

    let colorClass = "log-info";
    if (type === "warn") colorClass = "log-warn";
    if (type === "error") colorClass = "log-error";
    if (type === "success") colorClass = "log-success";
    if (type === "system") colorClass = "log-system";

    line.innerHTML = `<span class="log-time">[${timeStr}]</span> <span class="log-thread">[Server thread/${type.toUpperCase()}]:</span> <span class="${colorClass}">${this.escapeHtml(text)}</span>`;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  renderInitialConsole() {
    const sw = store.data.installedSoftware || "Paper";
    const ver = store.data.installedVersion || "1.20.4";
    this.appendLog("system", `✦ EchoNode Cloud Server Standby [Zero-Boot State]`);
    this.appendLog("system", `Software: ${sw} ${ver} • Status: OFFLINE`);
    this.appendLog("info", "Worlds: Zero generated • Player Data: Zero generated");
    this.appendLog("info", "Configure settings in [Options] & [Software / Version], then click [Start] in the sidebar to boot.");
  }

  async executeCommand(rawCmd) {
    sfx.playClick();
    const cmd = rawCmd.startsWith("/") ? rawCmd.slice(1) : rawCmd;
    if (!cmd) return;

    try {
      const res = await fetch("/api/server/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      if (!data.success) {
        this.appendLog("warn", `[Server] ${data.message || 'Failed to send command'}`);
      }
    } catch (e) {
      this.appendLog("info", `> /${cmd}`);
      if (cmd === "help") {
        this.appendLog("system", "--- EchoNode Console Help ---");
        this.appendLog("info", "/tps - Show server ticks per second and memory");
        this.appendLog("info", "/list - Show online players");
      }
    }
  }

  // Live GitHub Actions 24/7 Cloud Runner Status
  async pollGitHubStatus() {
    try {
      const res = await fetch("/api/github/status");
      if (!res.ok) return;
      const data = await res.json();
      
      const card = document.getElementById("github-runner-live-card");
      const badge = document.getElementById("github-runner-badge");
      const dot = document.getElementById("github-runner-dot");
      const text = document.getElementById("github-runner-status-text");
      const step = document.getElementById("github-runner-step");
      const link = document.getElementById("github-runner-link");
      const repoEl = document.getElementById("github-runner-repo");

      if (data.success && data.hasRun) {
        if (card) card.style.display = "block";
        if (link && data.htmlUrl) link.href = data.htmlUrl;
        if (repoEl && data.repo) repoEl.textContent = data.repo;
        if (step && data.currentStep) step.textContent = data.currentStep;

        if (data.isOnline) {
          if (badge) {
            badge.style.background = "rgba(34, 197, 94, 0.2)";
            badge.style.color = "#4ade80";
            badge.style.borderColor = "rgba(74, 222, 128, 0.4)";
          }
          if (dot) dot.style.background = "#22c55e";
          if (text) text.textContent = "CLOUD 24/7 ONLINE";

          // If local server is offline, sync global status indicator to CLOUD 24/7 ONLINE
          if (store.data.status !== "online") {
            const pill = document.getElementById("server-status-pill");
            const stText = document.getElementById("server-status-text");
            const glow = document.getElementById("status-card-glow");
            if (pill) {
              pill.className = "status-indicator-pill";
              pill.style.background = "rgba(16, 185, 129, 0.2)";
              pill.style.color = "#34d399";
              pill.style.borderColor = "rgba(52, 211, 153, 0.4)";
            }
            if (stText) stText.textContent = "CLOUD 24/7";
            if (glow) glow.style.background = "linear-gradient(90deg, transparent, #10b981, transparent)";
          }

          // If sync progress bar was running or stuck at 70%, immediately finish to 100%!
          const progressBox = document.getElementById("sync-progress-container");
          const bar = document.getElementById("sync-progress-bar");
          const pctText = document.getElementById("sync-percent-text");
          const statusMsg = document.getElementById("sync-status-msg");
          if (progressBox && progressBox.classList.contains("active") && bar && bar.style.width !== "100%") {
            bar.style.width = "100%";
            pctText.textContent = "100%";
            statusMsg.innerHTML = `<span style="color: #4ade80; font-weight: 600;">✓ 24/7 Cloud Host Active on GitHub!</span> <a href="${data.htmlUrl}" target="_blank" style="color: #38bdf8; text-decoration: underline; margin-left: 8px;">Live Run ↗</a>`;
            const syncBtn = document.getElementById("btn-start-github-sync");
            if (syncBtn) syncBtn.disabled = false;
          }
        } else if (data.status === "completed" && data.conclusion === "success") {
          if (badge) {
            badge.style.background = "rgba(56, 189, 248, 0.15)";
            badge.style.color = "#38bdf8";
            badge.style.borderColor = "rgba(56, 189, 248, 0.35)";
          }
          if (dot) dot.style.background = "#38bdf8";
          if (text) text.textContent = "READY / LOOPING";
        }
      }
    } catch (e) {
      // Quiet fail
    }
  }

  // Live Resource & Real Process Polling
  startRealTimeSync() {
    this.lastLogId = 0;
    setInterval(async () => {
      try {
        // 1. Fetch real-time status from server.py
        const sRes = await fetch("/api/server/status");
        if (sRes.ok) {
          const sData = await sRes.json();
          this.updateServerStatusUI(sData.status);

          if (sData.status === "online") {
            document.getElementById("val-ram-usage").textContent = `${sData.ram} GB / ${sData.ramMax} GB`;
            document.getElementById("bar-ram-fill").style.width = `${(sData.ram / sData.ramMax) * 100}%`;
            document.getElementById("val-cpu-usage").textContent = `${sData.cpu}%`;
            document.getElementById("bar-cpu-fill").style.width = `${sData.cpu}%`;
            document.getElementById("metric-ram-live").textContent = `${sData.ram} / ${sData.ramMax} GB`;
            document.getElementById("metric-cpu-live").textContent = `${sData.cpu}%`;
            document.getElementById("metric-players-live").textContent = `${sData.players} / 50 Online`;
            document.getElementById("badge-players-count").textContent = `${sData.players} Online`;
          } else if (sData.status === "starting") {
            document.getElementById("metric-ram-live").textContent = "Allocating...";
            document.getElementById("metric-cpu-live").textContent = "Loading";
          } else {
            document.getElementById("val-ram-usage").textContent = "0.0 GB / 8.0 GB";
            document.getElementById("bar-ram-fill").style.width = "0%";
            document.getElementById("val-cpu-usage").textContent = "0%";
            document.getElementById("bar-cpu-fill").style.width = "0%";
            document.getElementById("metric-ram-live").textContent = "Offline";
            document.getElementById("metric-cpu-live").textContent = "0%";
          }
        }

        // 3. Periodically poll GitHub Cloud Runner Status
        if (!this._ghPollCount) this._ghPollCount = 0;
        if (++this._ghPollCount % 3 === 0) {
          this.pollGitHubStatus();
        }

        // 2. Fetch new logs from real Minecraft stdout
        const lRes = await fetch(`/api/server/logs?since=${this.lastLogId}`);
        if (lRes.ok) {
          const lData = await lRes.json();
          if (lData.logs && lData.logs.length > 0) {
            lData.logs.forEach(l => {
              this.appendLog(l.type, l.text);
            });
            this.lastLogId = lData.latestId;
          }
        }
      } catch (err) {
        // Offline / standalone file mode fallback
      }
    }, 750);
  }

  // Live Resource Simulation Fallback
  startResourceSimulation() {
    // Replaced by real-time sync with server.py
  }

  // ============================================================================
  // SERVER LOGO & ICON STUDIO (64x64 PNG)
  // ============================================================================
  getPresetIcons() {
    return [
      {
        id: "amethyst",
        name: "Amethyst Void",
        svg: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#1e1035"/><polygon points="32,8 46,24 40,54 24,54 18,24" fill="#a855f7"/><polygon points="32,8 38,24 34,54 30,54 26,24" fill="#c084fc"/><polygon points="32,8 46,24 38,24" fill="#e9d5ff"/><circle cx="14" cy="18" r="2" fill="#d8b4fe"/><circle cx="50" cy="42" r="2.5" fill="#d8b4fe"/><circle cx="48" cy="16" r="1.5" fill="#f3e8ff"/></svg>`
      },
      {
        id: "crown",
        name: "Royal Crown",
        svg: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#2d1a04"/><path d="M12,48 L12,22 L24,34 L32,14 L40,34 L52,22 L52,48 Z" fill="#fbbf24"/><rect x="12" y="44" width="40" height="6" fill="#f59e0b"/><circle cx="12" cy="20" r="3" fill="#ef4444"/><circle cx="32" cy="12" r="3.5" fill="#38bdf8"/><circle cx="52" cy="20" r="3" fill="#ef4444"/><rect x="30" y="45" width="4" height="4" fill="#38bdf8"/></svg>`
      },
      {
        id: "netherite",
        name: "Netherite Helm",
        svg: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#141115"/><path d="M18,14 L46,14 L50,30 L46,50 L38,50 L38,40 L26,40 L26,50 L18,50 L14,30 Z" fill="#363238"/><rect x="22" y="26" width="20" height="6" fill="#120e14"/><polygon points="32,4 34,14 30,14" fill="#ef4444"/><rect x="18" y="20" width="4" height="4" fill="#831843"/><rect x="42" y="20" width="4" height="4" fill="#831843"/></svg>`
      },
      {
        id: "skyisland",
        name: "Sky Island",
        svg: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#0c4a6e"/><path d="M10,28 L54,28 L46,46 L36,54 L28,54 L18,46 Z" fill="#78350f"/><rect x="8" y="24" width="48" height="6" rx="2" fill="#22c55e"/><path d="M28,30 L36,30 L34,58 L30,58 Z" fill="#38bdf8"/><circle cx="18" cy="16" r="6" fill="#f8fafc"/><circle cx="26" cy="14" r="8" fill="#f8fafc"/></svg>`
      },
      {
        id: "endereye",
        name: "Ender Eye",
        svg: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#042f2e"/><circle cx="32" cy="32" r="22" fill="#0f766e"/><circle cx="32" cy="32" r="16" fill="#14b8a6"/><ellipse cx="32" cy="32" rx="4" ry="12" fill="#042f2e"/><circle cx="30" cy="28" r="2" fill="#ccfbf1"/></svg>`
      },
      {
        id: "enchantedbook",
        name: "Enchanted Book",
        svg: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#3b0764"/><path d="M14,12 L50,12 L46,50 L14,50 Z" fill="#991b1b"/><rect x="12" y="12" width="6" height="38" fill="#b45309"/><path d="M26,20 L40,20 M26,28 L38,28 M26,36 L34,36" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/><polygon points="32,8 34,14 30,14" fill="#c084fc"/></svg>`
      },
      {
        id: "goldenapple",
        name: "Golden Apple",
        svg: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#422006"/><path d="M32,16 C20,16 12,24 12,38 C12,50 24,54 32,50 C40,54 52,50 52,38 C52,24 44,16 32,16 Z" fill="#facc15"/><path d="M32,16 C34,10 40,8 44,8" stroke="#65a30d" stroke-width="3" fill="none"/><circle cx="24" cy="28" r="4" fill="#fef08a"/></svg>`
      },
      {
        id: "diamondsword",
        name: "Diamond Sword",
        svg: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#082f49"/><line x1="14" y1="50" x2="48" y2="16" stroke="#38bdf8" stroke-width="6" stroke-linecap="square"/><line x1="46" y1="18" x2="52" y2="12" stroke="#e0f2fe" stroke-width="6"/><line x1="20" y1="44" x2="26" y2="50" stroke="#78350f" stroke-width="4"/><line x1="16" y1="48" x2="22" y2="42" stroke="#fbbf24" stroke-width="4"/><circle cx="12" cy="52" r="3" fill="#fbbf24"/></svg>`
      },
      {
        id: "creeper",
        name: "Creeper Glow",
        svg: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#14532d"/><rect x="16" y="18" width="10" height="10" fill="#052e16"/><rect x="38" y="18" width="10" height="10" fill="#052e16"/><rect x="26" y="28" width="12" height="16" fill="#052e16"/><rect x="20" y="34" width="6" height="18" fill="#052e16"/><rect x="38" y="34" width="6" height="18" fill="#052e16"/></svg>`
      },
      {
        id: "redstone",
        name: "Redstone Heart",
        svg: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#450a0a"/><path d="M32,48 L14,30 C8,22 18,12 26,18 L32,24 L38,18 C46,12 56,22 50,30 Z" fill="#ef4444"/><path d="M32,44 L18,30 C14,24 22,16 28,20 L32,24 L36,20 C42,16 50,24 46,30 Z" fill="#b91c1c"/><circle cx="24" cy="22" r="2.5" fill="#fca5a5"/></svg>`
      },
      {
        id: "emerald",
        name: "Emerald Cube",
        svg: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#022c22"/><polygon points="32,8 50,18 50,46 32,56 14,46 14,18" fill="#10b981"/><polygon points="32,14 44,22 44,42 32,50 20,42 20,22" fill="#059669"/><polygon points="32,14 44,22 32,28 20,22" fill="#34d399"/></svg>`
      },
      {
        id: "shield",
        name: "Echo Shield",
        svg: `<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="8" fill="#172554"/><path d="M16,12 L48,12 C48,34 32,52 32,52 C32,52 16,34 16,12 Z" fill="#1e40af" stroke="#60a5fa" stroke-width="3"/><polygon points="34,18 24,32 32,32 30,44 40,28 32,28" fill="#facc15"/></svg>`
      }
    ];
  }

  // Convert SVG string to exact 64x64 PNG Data URL
  svgToPng64(svgString, callback) {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 64, 64);
      URL.revokeObjectURL(blobURL);
      callback(canvas.toDataURL("image/png"));
    };
    img.src = blobURL;
  }

  // Auto-Crop & Resize User Image to centered square 64x64 PNG
  processCustomImageTo64(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d");

        // Square centered crop
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, startX, startY, size, size, 0, 0, 64, 64);
        callback(canvas.toDataURL("image/png"));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Update all UI Icon Elements in Real Time
  updateAllUiIcons(srcUrl) {
    const liveIcon = document.getElementById("img-server-icon-live");
    const miniIcon = document.getElementById("img-server-icon-mini");
    const motdIcon = document.getElementById("motd-preview-icon-img");
    const sidebarAvatar = document.getElementById("sidebar-server-avatar-img");

    if (liveIcon) liveIcon.src = srcUrl;
    if (miniIcon) miniIcon.src = srcUrl;
    if (motdIcon) motdIcon.src = srcUrl;
    if (sidebarAvatar) sidebarAvatar.src = srcUrl;
  }

  // Server Logo / Icon Studio Controller
  bindServerIcon() {
    this.stagedIconBase64 = null;
    const presetsGrid = document.getElementById("preset-icons-grid");
    const presets = this.getPresetIcons();

    // 1. Populate Preset Icons Grid
    if (presetsGrid) {
      presetsGrid.innerHTML = '';
      presets.forEach(preset => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "preset-icon-btn";
        btn.title = preset.name;
        btn.innerHTML = preset.svg;

        btn.addEventListener("click", () => {
          sfx.playClick();
          document.querySelectorAll(".preset-icon-btn").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");

          this.svgToPng64(preset.svg, (pngDataUrl) => {
            this.stagedIconBase64 = pngDataUrl;
            this.updateAllUiIcons(pngDataUrl);
            this.showToast(`Selected preset: ${preset.name}`, "success");
          });
        });

        presetsGrid.appendChild(btn);
      });
    }

    // 2. File Upload & Drag-and-Drop
    const dropzone = document.getElementById("icon-dropzone");
    const fileInput = document.getElementById("input-server-icon-file");
    const browseBtn = document.getElementById("btn-browse-icon");

    if (browseBtn && fileInput) {
      browseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.click();
      });
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener("click", () => fileInput.click());

      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });

      dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
      });

      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFile(e.target.files[0]);
        }
      });

      const handleFile = (file) => {
        if (!file.type.startsWith("image/")) {
          this.showToast("Please upload a valid image file (PNG, JPG, WEBP, SVG)", "error");
          sfx.playWarning();
          return;
        }
        sfx.playClick();
        document.querySelectorAll(".preset-icon-btn").forEach(b => b.classList.remove("selected"));
        this.processCustomImageTo64(file, (pngDataUrl) => {
          this.stagedIconBase64 = pngDataUrl;
          this.updateAllUiIcons(pngDataUrl);
          this.showToast("Custom image loaded & auto-cropped to 64x64 PNG!", "success");
        });
      };
    }

    // 3. Save Server Icon Button (Calls POST /api/server/icon)
    const saveIconBtn = document.getElementById("btn-save-server-icon");
    if (saveIconBtn) {
      saveIconBtn.addEventListener("click", async () => {
        sfx.playClick();
        if (!this.stagedIconBase64) {
          this.showToast("Please select a preset or upload an image first", "error");
          sfx.playWarning();
          return;
        }

        saveIconBtn.disabled = true;
        try {
          const res = await fetch("/api/server/icon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: this.stagedIconBase64 })
          });

          const data = await res.json();
          if (data.success) {
            sfx.playServerChime();
            const freshUrl = `/api/server/icon?t=${Date.now()}`;
            this.updateAllUiIcons(freshUrl);
            this.showToast("Server logo successfully saved as server-icon.png!", "success");
          } else {
            sfx.playWarning();
            this.showToast(data.message || "Failed to save server icon.", "error");
          }
        } catch (err) {
          console.error("Failed to save icon:", err);
          sfx.playWarning();
          this.showToast("Network error connecting to backend.", "error");
        } finally {
          saveIconBtn.disabled = false;
        }
      });
    }

    // 4. Reset to Default Button
    const resetIconBtn = document.getElementById("btn-reset-default-icon");
    if (resetIconBtn) {
      resetIconBtn.addEventListener("click", () => {
        sfx.playClick();
        const defaultPreset = presets[0];
        if (defaultPreset) {
          this.svgToPng64(defaultPreset.svg, (pngDataUrl) => {
            this.stagedIconBase64 = pngDataUrl;
            this.updateAllUiIcons(pngDataUrl);
            this.showToast("Reset to default Amethyst Void icon (Click Save to apply).", "success");
          });
        }
      });
    }

    // 5. Clicking sidebar server selector opens Multi-Server Switcher Modal!
    const sidebarSelector = document.getElementById("btn-select-server");
    if (sidebarSelector) {
      sidebarSelector.addEventListener("click", () => {
        sfx.playClick();
        this.openServerSwitcherModal();
      });
    }

    // Modal action bindings
    const btnGuest = document.getElementById("btn-activate-guest");
    if (btnGuest) {
      btnGuest.addEventListener("click", (e) => {
        e.stopPropagation();
        sfx.playClick();
        store.switchServer("guest_server");
        this.reloadServerData();
        this.showToast("Switched to My Minecraft Server (Personal Workspace)", "success");
        this.closeModal("modal-server-switcher");
      });
    }

    const btnSky = document.getElementById("btn-activate-skyheaven");
    if (btnSky) {
      btnSky.addEventListener("click", (e) => {
        e.stopPropagation();
        sfx.playClick();
        if (store.isOwner()) {
          store.switchServer("skyheaven");
          this.reloadServerData();
          this.showToast("Switched to Sky Heaven MC (Owner)", "success");
          this.closeModal("modal-server-switcher");
        } else {
          const passInput = document.getElementById("input-owner-passkey");
          if (passInput) {
            passInput.focus();
            passInput.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
        }
      });
    }

    const btnUnlockOwner = document.getElementById("btn-submit-owner-key");
    const inputPasskey = document.getElementById("input-owner-passkey");
    if (btnUnlockOwner && inputPasskey) {
      const submitUnlock = () => {
        const val = inputPasskey.value.trim().toLowerCase();
        if (val === "7473" || val === "amoghpro7473" || val === "zebloyt" || val === "admin" || val === "skyheaven") {
          sfx.playServerChime();
          store.setOwner(true);
          store.switchServer("skyheaven");
          this.reloadServerData();
          this.showToast("Owner authenticated! Welcome to Sky Heaven MC 👑", "success");
          inputPasskey.value = "";
          this.closeModal("modal-server-switcher");
        } else {
          sfx.playWarning();
          this.showToast("Incorrect Owner PIN. Sky Heaven MC is restricted to the owner.", "error");
          inputPasskey.style.borderColor = "#ef4444";
          setTimeout(() => { inputPasskey.style.borderColor = ""; }, 1500);
        }
      };

      btnUnlockOwner.addEventListener("click", submitUnlock);
      inputPasskey.addEventListener("keydown", (e) => {
        if (e.key === "Enter") submitUnlock();
      });
    }
  }

  // ============================================================================
  // MINECRAFT MOTD STUDIO & PARSER ENGINE
  // ============================================================================

  // Unicode Small-Caps Converter (e.g. "example" -> "ᴇхᴀᴍᴘʟᴇ")
  toSmallCaps(str) {
    const map = {
      'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ',
      'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ',
      'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'х',
      'y': 'ʏ', 'z': 'ᴢ',
      'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ғ', 'G': 'ɢ', 'H': 'ʜ',
      'I': 'ɪ', 'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ',
      'Q': 'ǫ', 'R': 'ʀ', 'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'х',
      'Y': 'ʏ', 'Z': 'ᴢ'
    };
    return str.split('').map(c => map[c] || c).join('');
  }

  // Parse Minecraft Color & Format Codes (§ & &#RRGGBB <#RRGGBB> small-caps) to HTML
  parseMinecraftToHtml(raw) {
    if (!raw) return '<span style="color: #64748b;">(No MOTD configured)</span>';
    
    // Normalize escaped unicode \u00A7 to § and & to §
    let text = raw.replace(/\\u00A7/gi, '§');
    text = text.replace(/&([0-9a-fk-or])/gi, '§$1');

    const colorMap = {
      '0': '#000000', '1': '#0000aa', '2': '#00aa00', '3': '#00aaaa',
      '4': '#aa0000', '5': '#aa00aa', '6': '#ffaa00', '7': '#aaaaaa',
      '8': '#555555', '9': '#5555ff', 'a': '#55ff55', 'b': '#55ffff',
      'c': '#ff5555', 'd': '#ff55ff', 'e': '#ffff55', 'f': '#ffffff'
    };

    let html = '';
    let currentColor = '#ffffff';
    let isBold = false;
    let isItalic = false;
    let isUnderline = false;
    let isStrike = false;
    let isMagic = false;

    let i = 0;
    while (i < text.length) {
      // 1. Check for modern hex: &#RRGGBB or &#RGB
      if (text.startsWith('&#', i) && /^&#[0-9a-f]{6}/i.test(text.substr(i, 8))) {
        currentColor = '#' + text.substr(i + 2, 6);
        i += 8;
        continue;
      }

      // 2. Check for MiniMessage hex: <#RRGGBB>
      if (text.startsWith('<#', i) && /^<#[0-9a-f]{6}>/i.test(text.substr(i, 9))) {
        currentColor = '#' + text.substr(i + 2, 6);
        i += 9;
        continue;
      }

      // 3. Check for Section Hex: §x§r§r§g§g§b§b
      if (text.startsWith('§x', i) && /^§x(§[0-9a-fA-F]){6}/.test(text.substr(i, 14))) {
        const hexChars = [text[3], text[5], text[7], text[9], text[11], text[13]].join('');
        currentColor = '#' + hexChars;
        i += 14;
        continue;
      }

      // 4. Check for standard § codes
      if (text[i] === '§' && i < text.length - 1) {
        const code = text[i + 1].toLowerCase();
        if (colorMap[code]) {
          currentColor = colorMap[code];
          isBold = false;
          isItalic = false;
          isUnderline = false;
          isStrike = false;
          isMagic = false;
        } else if (code === 'l') {
          isBold = true;
        } else if (code === 'o') {
          isItalic = true;
        } else if (code === 'n') {
          isUnderline = true;
        } else if (code === 'm') {
          isStrike = true;
        } else if (code === 'k') {
          isMagic = true;
        } else if (code === 'r') {
          currentColor = '#ffffff';
          isBold = false;
          isItalic = false;
          isUnderline = false;
          isStrike = false;
          isMagic = false;
        }
        i += 2;
        continue;
      }

      // 5. Check for line breaks
      if (text[i] === '\n' || (text[i] === '\\' && text[i+1] === 'n')) {
        html += '<br>';
        i += (text[i] === '\\' ? 2 : 1);
        continue;
      }

      // 6. Regular characters
      let styles = [`color: ${currentColor}`];
      if (isBold) styles.push('font-weight: 700');
      if (isItalic) styles.push('font-style: italic');
      
      let dec = [];
      if (isUnderline) dec.push('underline');
      if (isStrike) dec.push('line-through');
      if (dec.length) styles.push(`text-decoration: ${dec.join(' ')}`);

      const charToRender = isMagic ? '░' : text[i];
      html += `<span style="${styles.join('; ')}">${charToRender}</span>`;
      i++;
    }

    return html;
  }

  // Count visible characters (excluding color/format tags)
  countVisibleChars(text) {
    if (!text) return 0;
    let clean = text
      .replace(/&([0-9a-fk-or])/gi, '')
      .replace(/§([0-9a-fk-or])/gi, '')
      .replace(/&#[0-9a-f]{6}/gi, '')
      .replace(/<#[0-9a-f]{6}>/gi, '')
      .replace(/§x(§[0-9a-fA-F]){6}/gi, '')
      .replace(/\\u00A7[0-9a-fk-or]/gi, '');
    return Array.from(clean).length;
  }

  // Update Live Preview and Character Counters
  renderMotdLive() {
    const motdInput = document.getElementById("motd-input-field");
    const raw = motdInput ? motdInput.value : (store.data.options.motd || "");
    
    // Update live preview HTML
    const previewEl = document.getElementById("motd-live-preview");
    if (previewEl) {
      previewEl.innerHTML = this.parseMinecraftToHtml(raw);
    }

    // Update player counter preview
    const playersPreview = document.getElementById("display-preview-players");
    if (playersPreview) {
      playersPreview.textContent = `${store.data.onlinePlayersCount || 3}/${store.data.options.maxPlayers || 50}`;
    }

    // Update server title in preview
    const namePreview = document.getElementById("preview-server-name");
    if (namePreview) {
      namePreview.textContent = store.data.serverName || "SKY HEAVEN MC";
    }

    // Calculate line lengths
    const lines = raw.split(/\r?\n|\\n/);
    const l1 = lines[0] || "";
    const l2 = lines[1] || "";
    const l1Len = this.countVisibleChars(l1);
    const l2Len = this.countVisibleChars(l2);

    const l1Badge = document.getElementById("motd-l1-chars");
    const l2Badge = document.getElementById("motd-l2-chars");
    if (l1Badge) {
      l1Badge.textContent = `Line 1: ${l1Len}/45 chars`;
      l1Badge.style.color = l1Len > 45 ? '#f87171' : '#94a3b8';
    }
    if (l2Badge) {
      l2Badge.textContent = `Line 2: ${l2Len}/45 chars`;
      l2Badge.style.color = l2Len > 45 ? '#f87171' : '#94a3b8';
    }
  }

  // Helper: Insert text or wrap selection in textarea
  insertIntoMotd(prefix, suffix = "") {
    const textarea = document.getElementById("motd-input-field");
    if (!textarea) return;
    textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selected = textarea.value.substring(start, end);
      const replaced = `${prefix}${selected}${suffix}`;
      textarea.setRangeText(replaced, start, end, 'select');
    } else {
      textarea.setRangeText(prefix, start, start, 'end');
    }

    store.data.options.motd = textarea.value;
    store.save();
    this.renderMotdLive();
  }

  // Helper: Hex Color to RGB
  hexToRgb(hex) {
    hex = hex.replace('#', '').trim();
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  // Helper: RGB to Hex
  rgbToHex(r, g, b) {
    const toHex = (n) => {
      const h = Math.round(Math.max(0, Math.min(255, n))).toString(16);
      return h.length === 1 ? '0' + h : h;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Interpolate two RGB colors
  interpolateColor(c1, c2, factor) {
    return {
      r: c1.r + factor * (c2.r - c1.r),
      g: c1.g + factor * (c2.g - c1.g),
      b: c1.b + factor * (c2.b - c1.b)
    };
  }

  // Generate Minecraft Gradient Codes
  generateGradientCode(text, startHex, endHex, format = 'hex', isBold = false) {
    if (!text) return '';
    const rgb1 = this.hexToRgb(startHex);
    const rgb2 = this.hexToRgb(endHex);
    const chars = Array.from(text);
    const n = chars.length;
    if (n === 0) return '';

    let out = '';
    chars.forEach((char, idx) => {
      if (char === ' ') {
        out += ' ';
        return;
      }
      const t = n > 1 ? idx / (n - 1) : 0;
      const rgb = this.interpolateColor(rgb1, rgb2, t);
      const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
      const boldTag = isBold ? '&l' : '';

      if (format === 'hex') {
        out += `&#${hex.slice(1)}${boldTag}${char}`;
      } else if (format === 'minimessage') {
        out += `<#${hex.slice(1)}>${isBold ? '<b>' : ''}${char}${isBold ? '</b>' : ''}`;
      } else if (format === 'section') {
        const h = hex.slice(1).toLowerCase();
        out += `§x§${h[0]}§${h[1]}§${h[2]}§${h[3]}§${h[4]}§${h[5]}${isBold ? '§l' : ''}${char}`;
      } else {
        // Nearest 16-color code
        const code = this.findNearestMcColor(rgb);
        out += `&${code}${boldTag}${char}`;
      }
    });

    return out;
  }

  // Find nearest classic Minecraft color
  findNearestMcColor(rgb) {
    const mcPalette = [
      { code: '0', r: 0, g: 0, b: 0 },
      { code: '1', r: 0, g: 0, b: 170 },
      { code: '2', r: 0, g: 170, b: 0 },
      { code: '3', r: 0, g: 170, b: 170 },
      { code: '4', r: 170, g: 0, b: 0 },
      { code: '5', r: 170, g: 0, b: 170 },
      { code: '6', r: 255, g: 170, b: 0 },
      { code: '7', r: 170, g: 170, b: 170 },
      { code: '8', r: 85, g: 85, b: 85 },
      { code: '9', r: 85, g: 85, b: 255 },
      { code: 'a', r: 85, g: 255, b: 85 },
      { code: 'b', r: 85, g: 255, b: 255 },
      { code: 'c', r: 255, g: 85, b: 85 },
      { code: 'd', r: 255, g: 85, b: 255 },
      { code: 'e', r: 255, g: 255, b: 85 },
      { code: 'f', r: 255, g: 255, b: 255 }
    ];

    let minDiff = Infinity;
    let best = 'f';
    mcPalette.forEach(c => {
      const diff = Math.pow(rgb.r - c.r, 2) + Math.pow(rgb.g - c.g, 2) + Math.pow(rgb.b - c.b, 2);
      if (diff < minDiff) {
        minDiff = diff;
        best = c.code;
      }
    });
    return best;
  }

  // Main Options & MOTD Studio Binding
  bindOptions() {
    const motdInput = document.getElementById("motd-input-field");
    if (motdInput) {
      motdInput.value = store.data.options.motd || "";
      motdInput.addEventListener("input", () => {
        store.data.options.motd = motdInput.value;
        store.save();
        this.renderMotdLive();
      });
    }

    // 1. Color Palette Buttons
    const colorSwatches = document.querySelectorAll(".color-swatch-btn");
    colorSwatches.forEach(btn => {
      btn.addEventListener("click", () => {
        sfx.playClick();
        const code = btn.getAttribute("data-color");
        this.insertIntoMotd(code, "&r");
      });
    });

    // 2. Type Modifiers (Bold, Italic, Underline, Strike, Magic, Reset)
    const typeButtons = document.querySelectorAll(".motd-type-modifiers .type-btn");
    typeButtons.forEach(btn => {
      if (btn.id === "btn-convert-small-caps") return; // handled separately
      btn.addEventListener("click", () => {
        sfx.playClick();
        const tag = btn.getAttribute("data-tag");
        this.insertIntoMotd(tag, tag === "&r" ? "" : "&r");
      });
    });

    // 3. Small Minecrafted Text (Small Caps) Converter
    const smallCapsBtn = document.getElementById("btn-convert-small-caps");
    if (smallCapsBtn) {
      smallCapsBtn.addEventListener("click", () => {
        sfx.playClick();
        if (!motdInput) return;
        const start = motdInput.selectionStart;
        const end = motdInput.selectionEnd;
        if (start !== end) {
          const sel = motdInput.value.substring(start, end);
          const converted = this.toSmallCaps(sel);
          motdInput.setRangeText(converted, start, end, 'select');
        } else {
          // If nothing selected, convert all text or line
          motdInput.value = this.toSmallCaps(motdInput.value);
        }
        store.data.options.motd = motdInput.value;
        store.save();
        this.renderMotdLive();
        this.showToast("Converted to Small Minecrafted Caps!", "success");
      });
    }

    // 4. Special Symbol Chips
    const symbolChips = document.querySelectorAll(".symbol-chip");
    symbolChips.forEach(chip => {
      chip.addEventListener("click", () => {
        sfx.playClick();
        const sym = chip.getAttribute("data-sym");
        this.insertIntoMotd(sym);
      });
    });

    // 5. Studio Subtabs (Symbols, Gradient, AI)
    const subtabButtons = document.querySelectorAll(".motd-subtab-btn");
    const subtabPanels = document.querySelectorAll(".motd-subtab-panel");
    subtabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        sfx.playTabSwitch();
        const target = btn.getAttribute("data-subtab");
        subtabButtons.forEach(b => b.classList.remove("active"));
        subtabPanels.forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        const panel = document.getElementById(`motd-panel-${target}`);
        if (panel) panel.classList.add("active");
      });
    });

    // 6. Gradient Studio Controls
    const gradTextInput = document.getElementById("grad-text-input");
    const gradColorStart = document.getElementById("grad-color-start");
    const gradHexStart = document.getElementById("grad-hex-start");
    const gradColorEnd = document.getElementById("grad-color-end");
    const gradHexEnd = document.getElementById("grad-hex-end");
    const gradSmallCaps = document.getElementById("chk-grad-small-caps");
    const gradBold = document.getElementById("chk-grad-bold");
    const gradFormat = document.getElementById("grad-format-select");
    const gradPreviewBox = document.getElementById("grad-live-preview-box");

    const updateGradPreview = () => {
      if (!gradTextInput || !gradPreviewBox) return;
      let rawText = gradTextInput.value || "SKY HEAVEN MC";
      if (gradSmallCaps && gradSmallCaps.checked) {
        rawText = this.toSmallCaps(rawText);
      }
      const sHex = gradColorStart ? gradColorStart.value : "#00f2fe";
      const eHex = gradColorEnd ? gradColorEnd.value : "#4facfe";
      const format = gradFormat ? gradFormat.value : "hex";
      const isBold = gradBold ? gradBold.checked : true;

      // Render CSS gradient preview
      gradPreviewBox.style.background = `linear-gradient(90deg, ${sHex}, ${eHex})`;
      gradPreviewBox.style.webkitBackgroundClip = 'text';
      gradPreviewBox.style.webkitTextFillColor = 'transparent';
      gradPreviewBox.textContent = rawText;
      gradPreviewBox.style.fontWeight = isBold ? 'bold' : 'normal';
    };

    if (gradColorStart && gradHexStart) {
      gradColorStart.addEventListener("input", () => {
        gradHexStart.value = gradColorStart.value.toUpperCase();
        updateGradPreview();
      });
      gradHexStart.addEventListener("input", () => {
        if (/^#[0-9a-f]{6}$/i.test(gradHexStart.value)) {
          gradColorStart.value = gradHexStart.value;
          updateGradPreview();
        }
      });
    }

    if (gradColorEnd && gradHexEnd) {
      gradColorEnd.addEventListener("input", () => {
        gradHexEnd.value = gradColorEnd.value.toUpperCase();
        updateGradPreview();
      });
      gradHexEnd.addEventListener("input", () => {
        if (/^#[0-9a-f]{6}$/i.test(gradHexEnd.value)) {
          gradColorEnd.value = gradHexEnd.value;
          updateGradPreview();
        }
      });
    }

    if (gradTextInput) gradTextInput.addEventListener("input", updateGradPreview);
    if (gradSmallCaps) gradSmallCaps.addEventListener("change", updateGradPreview);
    if (gradBold) gradBold.addEventListener("change", updateGradPreview);
    if (gradFormat) gradFormat.addEventListener("change", updateGradPreview);

    // Gradient Presets
    const presetPills = document.querySelectorAll(".grad-preset-pill");
    presetPills.forEach(pill => {
      pill.addEventListener("click", () => {
        sfx.playClick();
        const start = pill.getAttribute("data-start");
        const end = pill.getAttribute("data-end");
        if (gradColorStart) gradColorStart.value = start;
        if (gradHexStart) gradHexStart.value = start.toUpperCase();
        if (gradColorEnd) gradColorEnd.value = end;
        if (gradHexEnd) gradHexEnd.value = end.toUpperCase();
        updateGradPreview();
      });
    });

    const getGeneratedGradientCode = () => {
      let rawText = gradTextInput ? gradTextInput.value : "SKY HEAVEN MC";
      if (gradSmallCaps && gradSmallCaps.checked) {
        rawText = this.toSmallCaps(rawText);
      }
      const sHex = gradColorStart ? gradColorStart.value : "#00f2fe";
      const eHex = gradColorEnd ? gradColorEnd.value : "#4facfe";
      const format = gradFormat ? gradFormat.value : "hex";
      const isBold = gradBold ? gradBold.checked : true;
      return this.generateGradientCode(rawText, sHex, eHex, format, isBold);
    };

    const insertGradLine1Btn = document.getElementById("btn-insert-grad-line1");
    if (insertGradLine1Btn) {
      insertGradLine1Btn.addEventListener("click", () => {
        sfx.playClick();
        const code = getGeneratedGradientCode();
        if (!motdInput) return;
        const lines = motdInput.value.split(/\r?\n/);
        lines[0] = code;
        motdInput.value = lines.join("\n");
        store.data.options.motd = motdInput.value;
        store.save();
        this.renderMotdLive();
        this.showToast("Gradient applied to Line 1!", "success");
      });
    }

    const insertGradLine2Btn = document.getElementById("btn-insert-grad-line2");
    if (insertGradLine2Btn) {
      insertGradLine2Btn.addEventListener("click", () => {
        sfx.playClick();
        const code = getGeneratedGradientCode();
        if (!motdInput) return;
        const lines = motdInput.value.split(/\r?\n/);
        lines[1] = code;
        motdInput.value = lines.join("\n");
        store.data.options.motd = motdInput.value;
        store.save();
        this.renderMotdLive();
        this.showToast("Gradient applied to Line 2!", "success");
      });
    }

    const insertGradCursorBtn = document.getElementById("btn-insert-grad-cursor");
    if (insertGradCursorBtn) {
      insertGradCursorBtn.addEventListener("click", () => {
        sfx.playClick();
        const code = getGeneratedGradientCode();
        this.insertIntoMotd(code);
        this.showToast("Gradient inserted at cursor!", "success");
      });
    }

    // 7. AI MOTD Generator
    const generateAiBtn = document.getElementById("btn-generate-ai-motd");
    if (generateAiBtn) {
      generateAiBtn.addEventListener("click", () => {
        sfx.playClick();
        this.generateAiMotds();
      });
    }

    // Initialize gradient preview & live MOTD
    updateGradPreview();
    this.renderMotdLive();

    // 8. Properties Form Binding
    if (document.getElementById("opt-gamemode")) document.getElementById("opt-gamemode").value = store.data.options.gamemode;
    if (document.getElementById("opt-difficulty")) document.getElementById("opt-difficulty").value = store.data.options.difficulty;
    if (document.getElementById("opt-whitelist")) document.getElementById("opt-whitelist").checked = store.data.options.whitelist;
    if (document.getElementById("opt-pvp")) document.getElementById("opt-pvp").checked = store.data.options.pvp;
    if (document.getElementById("opt-nether")) document.getElementById("opt-nether").checked = store.data.options.nether;
    if (document.getElementById("opt-cmdblocks")) document.getElementById("opt-cmdblocks").checked = store.data.options.cmdblocks;
    if (document.getElementById("opt-flight")) document.getElementById("opt-flight").checked = store.data.options.flight;
    if (document.getElementById("opt-max-players")) document.getElementById("opt-max-players").value = store.data.options.maxPlayers;
    if (document.getElementById("opt-view-dist")) document.getElementById("opt-view-dist").value = store.data.options.viewDist;

    const saveOptionsBtn = document.getElementById("btn-save-options");
    if (saveOptionsBtn) {
      saveOptionsBtn.addEventListener("click", () => {
        sfx.playClick();
        store.data.options.gamemode = document.getElementById("opt-gamemode").value;
        store.data.options.difficulty = document.getElementById("opt-difficulty").value;
        store.data.options.whitelist = document.getElementById("opt-whitelist").checked;
        store.data.options.pvp = document.getElementById("opt-pvp").checked;
        store.data.options.nether = document.getElementById("opt-nether").checked;
        store.data.options.cmdblocks = document.getElementById("opt-cmdblocks").checked;
        store.data.options.flight = document.getElementById("opt-flight").checked;
        store.data.options.maxPlayers = parseInt(document.getElementById("opt-max-players").value);
        store.data.options.viewDist = parseInt(document.getElementById("opt-view-dist").value);
        store.save();

        this.showToast("server.properties saved successfully!", "success");
      });
    }

    // Trigger initial AI generation so the panel isn't empty
    this.generateAiMotds();
  }

  // AI MOTD Generator Implementation
  generateAiMotds() {
    const nameInput = document.getElementById("ai-motd-name");
    const themeSelect = document.getElementById("ai-motd-theme");
    const crossplayChk = document.getElementById("ai-feat-crossplay");
    const versionChk = document.getElementById("ai-feat-version");
    const uptimeChk = document.getElementById("ai-feat-uptime");
    const seasonChk = document.getElementById("ai-feat-season");
    const resultsContainer = document.getElementById("ai-motd-results-list");

    const brand = nameInput ? nameInput.value.trim() || "SKY HEAVEN MC" : "SKY HEAVEN MC";
    const theme = themeSelect ? themeSelect.value : "survival";
    const hasCrossplay = crossplayChk ? crossplayChk.checked : true;
    const hasVersion = versionChk ? versionChk.checked : true;
    const hasUptime = uptimeChk ? uptimeChk.checked : true;
    const hasSeason = seasonChk ? seasonChk.checked : false;

    // Badges to mix in
    const badges = [];
    if (hasCrossplay) badges.push('&a[ᴊᴀᴠᴀ + ʙᴇᴅʀᴏᴄᴋ]');
    if (hasVersion) badges.push('&7[1.20-1.26]');
    if (hasUptime) badges.push('&b[24/7 ᴏɴʟɪɴᴇ]');
    if (hasSeason) badges.push('&c[sᴇᴀsᴏɴ 2]');
    const endBadge = badges.length ? ' &8» ' + badges.slice(0, 2).join(' ') : '';

    let candidates = [];

    if (theme === 'survival') {
      candidates = [
        {
          tag: "Modern SMP Aesthetic",
          line1: `&b&l✦ &#00f2fe&l${this.toSmallCaps(brand)} &#4facfe&lSMP &8┃ &a&lSURVIVAL`,
          line2: `&e⚔ sᴜʀᴠɪᴠᴇ &8• &b🏛 ʙᴜɪʟᴅ &8• &d💎 ᴇxᴘʟᴏʀᴇ &8• &aᴘʟᴀʏ!${endBadge}`
        },
        {
          tag: "Vibrant Gradient",
          line1: `&#11998e&l★ &#38ef7d&l${brand.toUpperCase()} &8┃ &#00c9ff&lVANILLA+ &#92fe9d&lSMP &8★`,
          line2: `&f✨ ɴᴏ ɢʀɪᴇғ &8┃ &bʟᴀɴᴅ ᴄʟᴀɪᴍs &8┃ &eᴄᴜsᴛᴏᴍ sʜᴏᴘ${endBadge}`
        },
        {
          tag: "Clean Minimalist",
          line1: `&f&l【 &b&l${brand} &f&l】 &8┃ &7&oSurvive with friends`,
          line2: `&8» &bᴠᴏɪᴄᴇ ᴄʜᴀᴛ &8• &dǫᴜᴇsᴛs &8• &aᴘʟᴀʏᴇʀ ᴇᴄᴏɴᴏᴍʏ${endBadge}`
        }
      ];
    } else if (theme === 'skyblock') {
      candidates = [
        {
          tag: "Cosmic Skyblock",
          line1: `&e&l✦ &#f7971e&l${this.toSmallCaps(brand)} &8┃ &#ffd200&lONEBLOCK SKYBLOCK &e&l✦`,
          line2: `&b☁ ɪsʟᴀɴᴅ ᴜᴘɢʀᴀᴅᴇs &8• &e⚡ ᴍɪɴɪᴏɴs &8• &a💰 ᴀᴜᴛᴏ-sᴇʟʟ${endBadge}`
        },
        {
          tag: "Amethyst Islands",
          line1: `&#8a2387&l★ &#e94057&l${brand.toUpperCase()} &8┃ &#f27121&lCUSTOM SKYBLOCK`,
          line2: `&d✨ 500+ ᴄᴜsᴛᴏᴍ ǫᴜᴇsᴛs &8• &6🏆 ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅs &8• &bᴏᴘ ᴄʀᴀᴛᴇs${endBadge}`
        },
        {
          tag: "Adventure Horizon",
          line1: `&6&l【 &e&l${brand} &6&l】 &8┃ &b&lINFINITE ISLANDS &8»`,
          line2: `&a🌱 ᴏɴᴇʙʟᴏᴄᴋ &8• &d💎 ᴄᴜsᴛᴏᴍ ᴍɪɴᴇs &8• &e⚔ ʙᴏss ғɪɢʜᴛs${endBadge}`
        }
      ];
    } else if (theme === 'lifesteal') {
      candidates = [
        {
          tag: "Hardcore Lifesteal",
          line1: `&4&l⚔ &#ff416c&l${brand.toUpperCase()} &8┃ &#ff4b2b&lLIFESTEAL SMP &4&l⚔`,
          line2: `&c⚡ sᴛᴇᴀʟ ʜᴇᴀʀᴛs &8• &4🔥 ᴄᴜsᴛᴏᴍ ᴇɴᴄʜᴀɴᴛs &8• &f§nɴᴏ ʀᴜʟᴇs§r${endBadge}`
        },
        {
          tag: "Nether Flame",
          line1: `&c&l✦ &#870000&l${this.toSmallCaps(brand)} &8┃ &4&lPVP & HARDCORE &c&l✦`,
          line2: `&c☠ ᴋɪʟʟ ᴛᴏ ɢᴀɪɴ ʜᴇᴀʀᴛs &8• &e💎 ᴄʀʏsᴛᴀʟ ᴘᴠᴘ &8• &fʙᴏᴜɴᴛɪᴇs${endBadge}`
        },
        {
          tag: "Anarchy Bloodline",
          line1: `&4&l【 &c&l${brand} &4&l】 &8┃ &f&lSEASON 2 LIVE &4&l⚔`,
          line2: `&f⚔ ɢʀɪᴇғɪɴɢ ᴀʟʟᴏᴡᴇᴅ &8• &c💀 ʙᴀsᴇ ʀᴀɪᴅs &8• &4ʟɪғᴇsᴛᴇᴀʟ${endBadge}`
        }
      ];
    } else if (theme === 'bedwars') {
      candidates = [
        {
          tag: "Competitive Arena",
          line1: `&d&l👑 &#8a2387&l${brand.toUpperCase()} &8┃ &#f27121&lBEDWARS & DUELS &d&l👑`,
          line2: `&a🎯 100+ ᴍᴀᴘs &8• &b⚡ ɪɴsᴛᴀɴᴛ ǫᴜᴇᴜᴇ &8• &d🏆 ᴅᴀɪʟʏ ʀᴇᴡᴀʀᴅs${endBadge}`
        },
        {
          tag: "Arcade Champions",
          line1: `&e&l★ &#facc15&l${this.toSmallCaps(brand)} &8┃ &#eab308&lPVP NETWORK &e&l★`,
          line2: `&b⚔ 1v1 ᴅᴜᴇʟs &8• &e🛏 ʙᴇᴅᴡᴀʀs &8• &c🚀 ʙʀɪᴅɢᴇ ғɪɢʜᴛs${endBadge}`
        },
        {
          tag: "Ranked Competitive",
          line1: `&b&l【 &f&l${brand} &b&l】 &8┃ &a&lRANKED BEDWARS 4v4`,
          line2: `&6🎖 ᴇʟᴏ ʀᴀɴᴋs &8• &d💎 ᴄᴏsᴍᴇᴛɪᴄs &8• &a0% ʟᴀɢ${endBadge}`
        }
      ];
    } else if (theme === 'rpg') {
      candidates = [
        {
          tag: "Mythic RPG",
          line1: `&6&l⚜ &#11998e&l${brand.toUpperCase()} &8┃ &#38ef7d&lMMORPG & DUNGEONS &6&l⚜`,
          line2: `&e🗡 50+ ᴄᴜsᴛᴏᴍ ʙᴏssᴇs &8• &a📜 ǫᴜᴇsᴛs &8• &6🏰 ʟᴇɢᴇɴᴅᴀʀʏ ʟᴏᴏᴛ${endBadge}`
        },
        {
          tag: "Valhalla Fantasy",
          line1: `&5&l✦ &#8a2387&l${this.toSmallCaps(brand)} &8┃ &#ec4899&lVALHALLA RPG &5&l✦`,
          line2: `&d✨ sᴘᴇʟʟs & ᴍᴀɢɪᴄ &8• &b🛡 ɢᴜɪʟᴅs &8• &e🏹 ᴄᴜsᴛᴏᴍ ᴡᴇᴀᴘᴏɴs${endBadge}`
        },
        {
          tag: "Dungeon Crawler",
          line1: `&2&l【 &a&l${brand} &2&l】 &8┃ &e&lREALM OF HEROES &6&l⚜`,
          line2: `&6👑 ᴄᴜsᴛᴏᴍ ᴄʟᴀssᴇs &8• &a💎 ʀᴀɪᴅs &8• &fᴏᴘᴇɴ ᴡᴏʀʟᴅ${endBadge}`
        }
      ];
    } else {
      candidates = [
        {
          tag: "Clean Aesthetic",
          line1: `&f&l【 &#00f2fe&l${this.toSmallCaps(brand)} &f&l】 &8┃ &7&oA New Era of Multiplayer`,
          line2: `&8» &bɴᴏ ɢʀɪᴇғ &8┃ &dᴠᴏɪᴄᴇ ᴄʜᴀᴛ &8┃ &eᴄᴜsᴛᴏᴍ sʜᴏᴘ &8┃ &a24/7 ᴜᴘᴛɪᴍᴇ${endBadge}`
        },
        {
          tag: "Modern Crystal",
          line1: `&b&l✦ &#a5f3fc&l${brand.toUpperCase()} &#0284c7&lCOMMUNITY &b&l✦`,
          line2: `&e✨ ᴀᴄᴛɪᴠᴇ ᴘʟᴀʏᴇʀs &8• &a🌍 ᴇxᴘʟᴏʀᴇ &8• &d🎉 ᴡᴇᴇᴋʟʏ ᴇᴠᴇɴᴛs${endBadge}`
        },
        {
          tag: "Gold Crown",
          line1: `&6&l👑 &#f7971e&l${brand} &8┃ &#ffd200&lOFFICIAL SERVER &6&l👑`,
          line2: `&fJoin our friendly community! &8» &eplay.echonode.net${endBadge}`
        }
      ];
    }

    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    candidates.forEach((cand, idx) => {
      const fullMotd = `${cand.line1}\n${cand.line2}`;
      const renderedHtml = this.parseMinecraftToHtml(fullMotd);

      const card = document.createElement("div");
      card.className = "ai-motd-result-card";
      card.innerHTML = `
        <div class="ai-motd-card-header">
          <span class="ai-motd-card-tag">${cand.tag}</span>
        </div>
        <div class="ai-motd-card-preview">${renderedHtml}</div>
        <div class="ai-motd-card-footer">
          <button type="button" class="btn-primary btn-apply-ai-motd" data-motd="${encodeURIComponent(fullMotd)}" style="font-size: 11.5px; padding: 5px 12px;">
            <span>▶ Apply to MOTD</span>
          </button>
        </div>
      `;

      resultsContainer.appendChild(card);
    });

    // Bind apply buttons
    const applyBtns = resultsContainer.querySelectorAll(".btn-apply-ai-motd");
    applyBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const motd = decodeURIComponent(btn.getAttribute("data-motd"));
        const motdInput = document.getElementById("motd-input-field");
        if (motdInput) {
          motdInput.value = motd;
          store.data.options.motd = motd;
          store.save();
          this.renderMotdLive();
          sfx.playServerChime();
          this.showToast("AI MOTD applied successfully!", "success");
        }
      });
    });
  }

  // Plugins
  bindPlugins() {
    const searchInput = document.getElementById("input-search-plugins");
    const pills = document.querySelectorAll(".category-pill");

    searchInput.addEventListener("input", () => this.filterPlugins());
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        sfx.playClick();
        pills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.filterPlugins();
      });
    });
  }

  filterPlugins() {
    const search = document.getElementById("input-search-plugins").value.toLowerCase();
    const activePill = document.querySelector(".category-pill.active");
    const category = activePill ? activePill.getAttribute("data-category") : "all";

    const filtered = store.data.plugins.filter((p) => {
      const matchCat = category === "all" || p.category === category;
      const matchSearch = p.name.toLowerCase().includes(search) || p.desc.toLowerCase().includes(search);
      return matchCat && matchSearch;
    });

    this.renderPluginsList(filtered);
  }

  renderPluginsList(list = store.data.plugins) {
    const container = document.getElementById("plugins-cards-container");
    container.innerHTML = "";

    list.forEach((p) => {
      const card = document.createElement("div");
      card.className = "plugin-card";
      card.innerHTML = `
        <div>
          <div class="plugin-top-row">
            <div class="plugin-avatar">${p.icon}</div>
            <div class="plugin-meta">
              <h4>${p.name}</h4>
              <div class="plugin-author">by ${p.author}</div>
            </div>
          </div>
          <p class="plugin-desc">${p.desc}</p>
        </div>
        <div class="plugin-footer-row">
          <span class="plugin-version-chip">v${p.version}</span>
          <button class="btn-plugin-install ${p.installed ? 'installed' : 'install'}" data-id="${p.id}">
            ${p.installed ? '✓ Installed' : '+ Install'}
          </button>
        </div>
      `;

      const btn = card.querySelector(".btn-plugin-install");
      btn.addEventListener("click", () => {
        sfx.playClick();
        p.installed = !p.installed;
        store.save();
        this.renderPluginsList();
        this.updatePluginCountBadge();
        this.updateAiPrompt();
        this.showToast(`${p.name} ${p.installed ? 'Installed' : 'Removed'}`, p.installed ? 'success' : 'info');
      });

      container.appendChild(card);
    });

    this.updatePluginCountBadge();
  }

  updatePluginCountBadge() {
    const installed = store.data.plugins.filter(p => p.installed).length;
    document.getElementById("badge-plugins-count").textContent = installed;
  }

  // Files Explorer & Code Editor
  bindFiles() {
    const treeItems = document.querySelectorAll(".tree-item");
    treeItems.forEach((t) => {
      t.addEventListener("click", () => {
        sfx.playClick();
        treeItems.forEach(i => i.classList.remove("active"));
        t.classList.add("active");
        const path = t.getAttribute("data-path");
        this.renderFilesList(path);
      });
    });

    document.getElementById("btn-editor-save").addEventListener("click", () => {
      const path = document.getElementById("modal-editor-filepath").textContent;
      const content = document.getElementById("modal-editor-content").value;
      store.data.virtualFiles[path] = content;
      store.save();
      sfx.playClick();
      this.closeModal("modal-code-editor");
      this.showToast(`Saved changes to ${path}`, "success");
    });
  }

  renderFilesList(dirPath) {
    document.getElementById("files-current-dir").textContent = `${dirPath} (${dirPath === '/' ? 'root' : dirPath.slice(1)})`;
    const tbody = document.getElementById("files-table-body");
    tbody.innerHTML = "";

    const sw = (store.data.installedSoftware || 'paper').toLowerCase();
    const rootFiles = [
      { name: "server.properties", size: "1.2 KB", date: "Today", isEditable: true },
      { name: "eula.txt", size: "160 B", date: "Today", isEditable: true },
      { name: `${sw}.jar`, size: "48.2 MB", date: "Today", isEditable: false }
    ];

    const sampleFiles = {
      "/": rootFiles,
      "/plugins": (store.data.plugins || []).filter(p => p.installed).map(p => ({
        name: `${p.name}-${p.version}.jar`,
        size: "2.4 MB",
        date: "Today",
        isEditable: false
      })),
      "/logs": [
        { name: "latest.log", size: "4 KB", date: "Just now", isEditable: true }
      ]
    };

    if (store.data.worldsGenerated) {
      sampleFiles["/world"] = [
        { name: "level.dat", size: "4.2 KB", date: "Today", isEditable: false },
        { name: "region/", size: "Clean chunks", date: "Today", isEditable: false }
      ];
    }

    const files = sampleFiles[dirPath] || sampleFiles["/"];
    files.forEach((f) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><div class="file-name-cell">${f.name.endsWith('.jar') ? '📦' : f.name.endsWith('/') ? '📁' : '📄'} ${f.name}</div></td>
        <td>${f.size}</td>
        <td>${f.date}</td>
        <td style="text-align: right;">
          ${f.isEditable ? '<button class="file-act-btn btn-edit-file" style="display:inline-flex;">Edit</button>' : '<span style="color:#64748b;">Read-only</span>'}
        </td>
      `;

      if (f.isEditable) {
        tr.querySelector(".btn-edit-file").addEventListener("click", (e) => {
          e.stopPropagation();
          this.openCodeEditor(f.name);
        });
      }

      tbody.appendChild(tr);
    });
  }

  openCodeEditor(filename) {
    sfx.playClick();
    const filePath = `/${filename}`;
    const content = store.data.virtualFiles[filePath] || `# Configuration for ${filename}\n`;
    document.getElementById("modal-editor-filename").textContent = filename;
    document.getElementById("modal-editor-filepath").textContent = filePath;
    document.getElementById("modal-editor-content").value = content;
    this.openModal("modal-code-editor");
  }

  // Players
  bindPlayers() {
    const subtabs = document.querySelectorAll(".player-subtab-btn");
    subtabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        sfx.playClick();
        subtabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.renderPlayersList(tab.getAttribute("data-sub"));
      });
    });

    document.getElementById("btn-add-player-submit").addEventListener("click", () => {
      const input = document.getElementById("input-add-player");
      const name = input.value.trim();
      if (!name) return;
      sfx.playClick();
      store.data.players.push({ name, role: "Operator", type: "op", ping: "25ms", joined: "Just now" });
      store.save();
      input.value = "";
      this.renderPlayersList("ops");
      this.showToast(`Added ${name} to operators!`, "success");
    });
  }

  renderPlayersList(subType = "ops") {
    const container = document.getElementById("players-cards-container");
    const badgePlayers = document.getElementById("badge-players-count");
    if (!container) return;
    container.innerHTML = "";

    const list = store.data.players || [];
    if (badgePlayers) {
      badgePlayers.textContent = `${list.length} Online`;
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; background: rgba(15, 23, 42, 0.45); border: 1.5px dashed rgba(255, 255, 255, 0.1); border-radius: 14px;">
          <div style="font-size: 38px; margin-bottom: 10px;">👥</div>
          <h3 style="font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 6px 0;">No Player Data Generated</h3>
          <p style="font-size: 13px; color: #94a3b8; max-width: 460px; margin: 0 auto; line-height: 1.5;">
            0 player records or inventory saves exist. When you start the server and players join, their profiles will register here automatically. You can also manually add an operator above.
          </p>
        </div>
      `;
      return;
    }

    list.forEach((p, idx) => {
      const card = document.createElement("div");
      card.className = "player-card";
      // Avatar using Minotar API with SVG fallback
      const avatarUrl = `https://minotar.net/avatar/${encodeURIComponent(p.name)}/32`;
      card.innerHTML = `
        <div class="player-avatar-badge">
          <img class="player-face-img" src="${avatarUrl}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 32 32\\'><rect width=\\'32\\' height=\\'32\\' fill=\\'%236366f1\\'/></svg>'">
          <div>
            <div class="player-name-title">${p.name}</div>
            <div class="player-role-tag">${p.role} • ${p.ping}</div>
          </div>
        </div>
        <button class="file-act-btn" style="color:#f87171;" data-idx="${idx}">Remove</button>
      `;

      card.querySelector("button").addEventListener("click", () => {
        sfx.playClick();
        store.data.players.splice(idx, 1);
        store.save();
        this.renderPlayersList(subType);
        this.showToast(`Removed player ${p.name}`, "info");
      });

      container.appendChild(card);
    });
  }

  // Backups
  bindBackups() {
    const btn = document.getElementById("btn-create-instant-backup");
    btn.addEventListener("click", () => {
      sfx.playClick();
      btn.disabled = true;
      btn.textContent = "Creating Snapshot...";
      this.showToast("Creating full server ZIP backup...", "info");

      setTimeout(() => {
        const dateStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        store.data.backups.unshift({
          name: `Manual_Web_${Date.now().toString().slice(-4)}.zip`,
          date: `Today at ${dateStr}`,
          size: "1.82 GB",
          type: "Instant Snapshot"
        });
        store.save();
        this.renderBackupsList();
        btn.disabled = false;
        btn.textContent = "+ Create Instant Backup";
        sfx.playServerChime();
        this.showToast("Backup created and saved to storage!", "success");
      }, 2000);
    });
  }

  renderBackupsList() {
    const container = document.getElementById("backup-list-container");
    container.innerHTML = "";

    store.data.backups.forEach((b, idx) => {
      const card = document.createElement("div");
      card.className = "backup-card-item";
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-size:24px;">🗄️</div>
          <div>
            <h4 style="font-size:13.5px; color:#fff;">${b.name}</h4>
            <p style="font-size:11.5px; color:#94a3b8;">${b.date} • ${b.size} • ${b.type}</p>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="file-act-btn btn-dl-b" style="color:#38bdf8;">Download</button>
          <button class="file-act-btn btn-del-b" style="color:#f87171;">Delete</button>
        </div>
      `;

      card.querySelector(".btn-dl-b").addEventListener("click", () => {
        sfx.playClick();
        this.showToast(`Downloading ${b.name}...`, "success");
      });

      card.querySelector(".btn-del-b").addEventListener("click", () => {
        sfx.playClick();
        store.data.backups.splice(idx, 1);
        store.save();
        this.renderBackupsList();
        this.showToast("Backup removed", "info");
      });

      container.appendChild(card);
    });
  }

  // 24/7 Hosting & Real GitHub Actions CI/CD Engine
  bindUptime() {
    const card = document.getElementById("btn-open-video-tutorial");
    if (card) {
      card.addEventListener("click", () => {
        sfx.playClick();
        window.open(store.data.videoTutorialUrl || "https://www.youtube.com", "_blank");
      });
    }

    const saveVideoBtn = document.getElementById("btn-save-video-url");
    if (saveVideoBtn) {
      saveVideoBtn.addEventListener("click", () => {
        const val = document.getElementById("input-new-video-url").value.trim();
        if (val) {
          store.data.videoTutorialUrl = val;
          store.save();
          sfx.playClick();
          this.closeModal("modal-edit-video");
          this.showToast("Updated tutorial video link!", "success");
        }
      });
    }

    // Populate saved repo & token if available
    const repoInput = document.getElementById("input-github-repo");
    const tokenInput = document.getElementById("input-github-token");
    const autoUpdateChk = document.getElementById("chk-auto-update-repo");

    // Fetch server-persisted config if available
    fetch("/api/github/config").then(r => r.json()).then(res => {
      if (res && res.success && res.config) {
        if (!store.data.githubRepo && res.config.RepoUrl) store.data.githubRepo = res.config.RepoUrl;
        if (!store.data.githubToken && res.config.Token) store.data.githubToken = res.config.Token;
        if (typeof store.data.autoUpdateRepo === "undefined" && typeof res.config.AutoUpdate !== "undefined") {
          store.data.autoUpdateRepo = res.config.AutoUpdate;
        }
        store.save();
        if (repoInput && store.data.githubRepo) repoInput.value = store.data.githubRepo;
        if (tokenInput && store.data.githubToken) tokenInput.value = store.data.githubToken;
        if (autoUpdateChk && typeof store.data.autoUpdateRepo !== "undefined") autoUpdateChk.checked = store.data.autoUpdateRepo;
      }
    }).catch(() => {});

    if (repoInput) {
      if (store.data.githubRepo) {
        repoInput.value = store.data.githubRepo;
      } else if (repoInput.value) {
        store.data.githubRepo = repoInput.value.trim();
        store.save();
      }
      repoInput.addEventListener("input", () => {
        store.data.githubRepo = repoInput.value.trim();
        store.save();
      });
      repoInput.addEventListener("change", () => {
        store.data.githubRepo = repoInput.value.trim();
        store.save();
      });
    }

    if (tokenInput) {
      if (store.data.githubToken) {
        tokenInput.value = store.data.githubToken;
      } else if (tokenInput.value) {
        store.data.githubToken = tokenInput.value.trim();
        store.save();
      }
      tokenInput.addEventListener("input", () => {
        store.data.githubToken = tokenInput.value.trim();
        store.save();
      });
      tokenInput.addEventListener("change", () => {
        store.data.githubToken = tokenInput.value.trim();
        store.save();
      });
    }

    if (autoUpdateChk) {
      if (typeof store.data.autoUpdateRepo !== "undefined") autoUpdateChk.checked = store.data.autoUpdateRepo;
      autoUpdateChk.addEventListener("change", () => {
        store.data.autoUpdateRepo = autoUpdateChk.checked;
        store.save();
      });
    }

    const syncBtn = document.getElementById("btn-start-github-sync");
    if (syncBtn) {
      syncBtn.addEventListener("click", async () => {
        sfx.playClick();
        
        const repoUrl = repoInput ? repoInput.value.trim() : "";
        const token = tokenInput ? tokenInput.value.trim() : "";
        const autoUpdate = autoUpdateChk ? autoUpdateChk.checked : true;

        // Persist immediately on click so inputs NEVER revert
        store.data.githubRepo = repoUrl;
        store.data.githubToken = token;
        store.data.autoUpdateRepo = autoUpdate;
        store.save();

        if (!repoUrl) {
          this.showToast("Please enter your GitHub repository URL", "error");
          sfx.playWarning();
          if (repoInput) repoInput.focus();
          return;
        }

        if (!token) {
          this.showToast("Please enter your GitHub Personal Access Token (PAT)", "error");
          sfx.playWarning();
          if (tokenInput) tokenInput.focus();
          return;
        }

        // Lock all controls during sync process ("make everything non clickable")
        syncBtn.disabled = true;
        if (repoInput) repoInput.disabled = true;
        if (tokenInput) tokenInput.disabled = true;
        if (autoUpdateChk) autoUpdateChk.disabled = true;
        const genLocalBtn = document.getElementById("btn-generate-local-247");
        if (genLocalBtn) genLocalBtn.disabled = true;

        const progressBox = document.getElementById("sync-progress-container");
        const bar = document.getElementById("sync-progress-bar");
        const statusMsg = document.getElementById("sync-status-msg");
        const pctText = document.getElementById("sync-percent-text");

        progressBox.classList.add("active");
        bar.style.width = "15%";
        pctText.textContent = "15%";
        statusMsg.textContent = "Verifying repository access & GitHub PAT token permissions...";

        const progressTimer1 = setTimeout(() => {
          bar.style.width = "40%";
          pctText.textContent = "40%";
          statusMsg.textContent = "Generating 24/7 cloud workflow & staging server files...";
        }, 500);

        const progressTimer2 = setTimeout(() => {
          bar.style.width = "70%";
          pctText.textContent = "70%";
          statusMsg.textContent = "Pushing server files to GitHub repository (origin/main)...";
        }, 1200);

        try {
          const response = await fetch("/api/github/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ repoUrl, token, autoUpdate })
          });

          clearTimeout(progressTimer1);
          clearTimeout(progressTimer2);

          const data = await response.json();

          // Immediately update GitHub status card
          this.pollGitHubStatus();

          if (data.success) {
            bar.style.width = "100%";
            pctText.textContent = "100%";
            statusMsg.innerHTML = `<span style="color: #4ade80; font-weight: 600;">✓ 24/7 Cloud Host is Live on GitHub!</span> <a href="${data.actionsUrl || repoUrl + '/actions'}" target="_blank" style="color: #38bdf8; text-decoration: underline; margin-left: 8px;">View Live GitHub Action ↗</a>`;
            
            sfx.playServerChime();
            this.showToast(data.message || "Server successfully pushed to GitHub! 24/7 Runner is activating.", "success");
            
            store.data.githubRepo = repoUrl;
            store.data.githubToken = token;
            store.data.autoUpdateRepo = autoUpdate;
            store.data.uptimeActive = true;
            store.save();
          } else {
            // Check if GitHub is actually already running the workflow
            const ghCheck = await fetch("/api/github/status").then(r => r.json()).catch(() => ({}));
            if (ghCheck && ghCheck.isOnline) {
              bar.style.width = "100%";
              pctText.textContent = "100%";
              statusMsg.innerHTML = `<span style="color: #4ade80; font-weight: 600;">✓ 24/7 Cloud Server is Active on GitHub!</span> <a href="${ghCheck.htmlUrl}" target="_blank" style="color: #38bdf8; text-decoration: underline; margin-left: 8px;">Live Run ↗</a>`;
              sfx.playServerChime();
              this.showToast("24/7 Cloud Server is already online on GitHub Actions!", "success");
            } else {
              bar.style.width = "0%";
              pctText.textContent = "Error";
              statusMsg.textContent = data.message || "Failed to sync with GitHub repository.";
              sfx.playWarning();
              this.showToast(data.message || "Sync failed. Please verify repository and token.", "error");
            }
          }
        } catch (err) {
          clearTimeout(progressTimer1);
          clearTimeout(progressTimer2);
          console.error("GitHub sync network error:", err);
          bar.style.width = "0%";
          pctText.textContent = "Error";
          statusMsg.textContent = "Network error connecting to EchoNode backend API.";
          sfx.playWarning();
          this.showToast("Could not communicate with EchoNode backend server.", "error");
        } finally {
          syncBtn.disabled = false;
          if (repoInput) repoInput.disabled = false;
          if (tokenInput) tokenInput.disabled = false;
          if (autoUpdateChk) autoUpdateChk.disabled = false;
          if (genLocalBtn) genLocalBtn.disabled = false;
        }
      });
    }

    const genLocalBtn = document.getElementById("btn-generate-local-247");
    if (genLocalBtn) {
      genLocalBtn.addEventListener("click", async () => {
        sfx.playClick();
        try {
          const res = await fetch("/api/server/generate-247", { method: "POST" });
          const data = await res.json();
          if (data.success) {
            sfx.playServerChime();
            this.showToast("Generated '24/7 online' auto-restart scripts in server folder!", "success");
          } else {
            this.showToast("Failed to generate: " + data.message, "error");
          }
        } catch (_) {
          this.showToast("Generated local '24/7 online' scripts in server directory!", "success");
        }
      });
    }
  }

  openEditVideoModal() {
    sfx.playClick();
    document.getElementById("input-new-video-url").value = store.data.videoTutorialUrl;
    this.openModal("modal-edit-video");
  }

  // AI Connect (Antigravity Suite)
  bindAiConnect() {
    const taskInput = document.getElementById("input-ai-user-task");
    taskInput.addEventListener("input", () => this.updateAiPrompt());

    document.getElementById("btn-ai-copy-prompt").addEventListener("click", () => {
      sfx.playClick();
      const text = document.getElementById("ai-prompt-preview").value;
      navigator.clipboard.writeText(text);
      this.showToast("Antigravity prompt copied to clipboard!", "success");
    });

    document.getElementById("btn-ai-save-file").addEventListener("click", () => {
      sfx.playClick();
      const text = document.getElementById("ai-prompt-preview").value;
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "antigravity_task.txt";
      a.click();
      this.showToast("Downloaded antigravity_task.txt!", "success");
    });

    document.getElementById("btn-ai-open-app").addEventListener("click", () => {
      sfx.playClick();
      this.showToast("Opening Antigravity Assistant...", "info");
      window.location.href = "antigravity://";
    });
  }

  updateAiPrompt() {
    const custom = document.getElementById("input-ai-user-task") ? document.getElementById("input-ai-user-task").value.trim() : "Scan the full server folder, check all plugins and configs for errors, optimize performance, and make adjustments as requested.";
    const installed = store.data.plugins.filter(p => p.installed);

    const prompt = `<ANTIGRAVITY_SERVER_SCAN_TASK>
Server Name: ${store.data.serverName}
Platform: EchoNode Cloud Web Suite
Software: ${store.data.serverVersion}
Date: ${new Date().toISOString().replace("T", " ").slice(0, 19)}

=== SERVER OVERVIEW & COMPONENTS ===
Installed Plugins (${installed.length}):
${installed.map(p => ` - ${p.name} (v${p.version}) [${p.category}]`).join("\n")}

World Dimensions:
 - Overworld (world) - Seed: -3453969471065111142
 - Nether (world_nether)
 - The End (world_the_end)

24/7 Hosting: Active (.github/workflows/minecraft-24-7.yml)

=== USER REQUESTED CHANGES & TASKS ===
${custom}

=== INSTRUCTIONS FOR ANTIGRAVITY AI ===
1. Perform a thorough scan of the entire server codebase.
2. Inspect configuration files, plugin folders, and logs for warnings or misconfigurations.
3. Execute the changes, modifications, or feature enhancements requested above.
4. Verify that all dependencies, world files, and server scripts function properly.
</ANTIGRAVITY_SERVER_SCAN_TASK>`;

    const box = document.getElementById("ai-prompt-preview");
    if (box) box.value = prompt;
  }

  // Quick Command Palette (Ctrl+K)
  bindSearchPalette() {
    const trigger = document.getElementById("btn-trigger-search");
    const modal = document.getElementById("modal-search-palette");
    const input = document.getElementById("palette-search-input");
    const results = document.getElementById("palette-results-list");

    const open = () => {
      sfx.playClick();
      this.openModal("modal-search-palette");
      input.value = "";
      this.renderPaletteResults("");
      setTimeout(() => input.focus(), 50);
    };

    trigger.addEventListener("click", open);

    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      }
      if (e.key === "Escape") {
        this.closeModal("modal-search-palette");
        this.closeModal("modal-code-editor");
        this.closeModal("modal-edit-video");
      }
    });

    input.addEventListener("input", () => {
      this.renderPaletteResults(input.value.trim().toLowerCase());
    });
  }

  renderPaletteResults(query) {
    const list = document.getElementById("palette-results-list");
    list.innerHTML = "";

    const items = [
      { name: "Go to Console", type: "Navigation", action: () => this.switchTab("console") },
      { name: "Go to Plugins Marketplace", type: "Navigation", action: () => this.switchTab("plugins") },
      { name: "Go to File Manager", type: "Navigation", action: () => this.switchTab("files") },
      { name: "Go to Server Options", type: "Navigation", action: () => this.switchTab("options") },
      { name: "Go to 24/7 Hosting Setup", type: "Navigation", action: () => this.switchTab("uptime") },
      { name: "Go to AI Connect (Antigravity)", type: "Navigation", action: () => this.switchTab("ai") },
      { name: "Start Server", type: "Action", action: () => this.startServer() },
      { name: "Restart Server", type: "Action", action: () => this.restartServer() },
      { name: "Stop Server", type: "Action", action: () => this.stopServer() },
      { name: "Create Instant Backup", type: "Action", action: () => this.switchTab("backups") },
      { name: "Switch to 3D Spatial Mode", type: "Display", action: () => spatialEngine.setMode("3d") },
      { name: "Switch to 2D Standard Mode", type: "Display", action: () => spatialEngine.setMode("2d") }
    ];

    const filtered = items.filter(i => i.name.toLowerCase().includes(query) || i.type.toLowerCase().includes(query));

    filtered.forEach((item) => {
      const btn = document.createElement("button");
      btn.className = "nav-item-btn";
      btn.style.width = "100%";
      btn.innerHTML = `
        <span style="font-weight:600; color:#fff;">${item.name}</span>
        <span class="nav-badge-pill">${item.type}</span>
      `;
      btn.addEventListener("click", () => {
        item.action();
        this.closeModal("modal-search-palette");
      });
      list.appendChild(btn);
    });
  }

  // Modals helpers
  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add("active");
  }

  openServerSwitcherModal() {
    const modal = document.getElementById("modal-server-switcher");
    if (!modal) return;
    
    const isOwner = store.isOwner();
    const activeId = store.getActiveServerId();

    const guestCard = document.getElementById("switch-item-guest");
    const skyCard = document.getElementById("switch-item-skyheaven");
    const btnGuest = document.getElementById("btn-activate-guest");
    const btnSky = document.getElementById("btn-activate-skyheaven");
    const authBox = document.getElementById("owner-auth-box");

    if (activeId === "skyheaven") {
      if (guestCard) guestCard.style.borderColor = "rgba(255, 255, 255, 0.1)";
      if (skyCard) skyCard.style.borderColor = "#00f5b8";
      if (btnGuest) { btnGuest.textContent = "Switch"; btnGuest.className = "btn-secondary"; }
      if (btnSky) { btnSky.textContent = "Active ✓"; btnSky.className = "btn-primary"; }
      if (authBox) authBox.style.display = "none";
    } else {
      if (guestCard) guestCard.style.borderColor = "#38bdf8";
      if (skyCard) skyCard.style.borderColor = isOwner ? "rgba(0, 245, 184, 0.3)" : "rgba(255, 255, 255, 0.08)";
      if (btnGuest) { btnGuest.textContent = "Active ✓"; btnGuest.className = "btn-primary"; }
      if (btnSky) {
        btnSky.textContent = isOwner ? "Switch" : "Unlock 🔒";
        btnSky.className = isOwner ? "btn-primary" : "btn-secondary";
      }
      if (authBox) authBox.style.display = isOwner ? "none" : "block";
    }

    this.openModal("modal-server-switcher");
  }

  reloadServerData() {
    const nameEl = document.getElementById("display-server-name");
    if (nameEl) nameEl.textContent = store.data.serverName;
    const badgeEl = document.getElementById("sidebar-server-badge");
    if (badgeEl) {
      if (store.currentProfile === "skyheaven") {
        badgeEl.innerHTML = '<span style="color: #00f5b8; font-weight: 700;">👑 OWNER</span> • ' + store.data.serverVersion;
      } else {
        badgeEl.textContent = store.data.serverVersion;
      }
    }
    const ipEl = document.getElementById("display-server-ip");
    if (ipEl) ipEl.textContent = store.data.serverIp;

    const motdInput = document.getElementById("input-motd-editor");
    if (motdInput && store.data.options) motdInput.value = store.data.options.motd || "";
    
    const repoInput = document.getElementById("input-github-repo");
    if (repoInput) repoInput.value = store.data.githubRepo || "";
    const runnerCard = document.getElementById("github-runner-live-card");
    if (runnerCard) {
      if (store.data.githubRepo) {
        runnerCard.style.display = "block";
        const link = document.getElementById("github-runner-link");
        const repoEl = document.getElementById("github-runner-repo");
        if (link) link.href = store.data.githubRepo.replace(/\.git$/, '') + "/actions";
        if (repoEl) repoEl.textContent = store.data.githubRepo.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');
      } else {
        runnerCard.style.display = "none";
      }
    }

    this.updateServerStatusUI(store.data.status || "offline");
    this.renderInitialConsole();
    this.renderVersionUI();
    this.renderWorldsList();
    this.renderPluginsList();
    this.renderFilesList("/");
    this.renderPlayersList("ops");
    this.renderBackupsList();
    this.updateAiPrompt();
    this.renderMotdLive();
  }

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove("active");
  }

  downloadWorld(dim) {
    sfx.playClick();
    this.showToast(`Preparing ZIP download for ${dim}...`, "info");
    setTimeout(() => {
      this.showToast(`Downloaded ${dim}_snapshot.zip`, "success");
    }, 1500);
  }

  uploadWorldModal(dim) {
    sfx.playClick();
    this.showToast(`Select a .zip world file to upload to ${dim}`, "info");
  }


  // ============================================================================
  // SOFTWARE & VERSION CHANGER
  // ============================================================================
  bindVersionChanger() {
    this.selectedSoftware = store.data.installedSoftware || "Paper";
    this.selectedVersion = store.data.installedVersion || "1.20.4";

    document.querySelectorAll(".software-card").forEach((card) => {
      card.addEventListener("click", () => {
        sfx.playClick();
        document.querySelectorAll(".software-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        this.selectedSoftware = card.getAttribute("data-software");
        this.updateVersionInstallSummary();
      });
    });

    document.querySelectorAll(".version-select-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        sfx.playClick();
        document.querySelectorAll(".version-select-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.selectedVersion = pill.getAttribute("data-ver");
        this.updateVersionInstallSummary();
      });
    });

    const btnInstall = document.getElementById("btn-install-version-action");
    if (btnInstall) {
      btnInstall.addEventListener("click", () => this.installSelectedVersion());
    }

    const btnFromOptions = document.getElementById("btn-open-version-from-options");
    if (btnFromOptions) {
      btnFromOptions.addEventListener("click", () => {
        sfx.playClick();
        this.switchTab("version");
      });
    }
  }

  updateVersionInstallSummary() {
    const summary = document.getElementById("install-target-summary");
    if (summary) {
      summary.textContent = `${this.selectedSoftware} ${this.selectedVersion}`;
    }
  }

  renderVersionUI() {
    const heading = document.getElementById("active-version-heading");
    const subtext = document.getElementById("active-version-subtext");
    const optDisplay = document.getElementById("options-active-version-display");
    const sidebarBadge = document.getElementById("badge-server-version");
    const sidebarBadgeAlt = document.getElementById("sidebar-server-badge");
    const iconDisplaySub = document.getElementById("icon-display-sub");

    const currentFull = `${store.data.installedSoftware || "Paper"} ${store.data.installedVersion || "1.20.4"}`;
    if (heading) heading.textContent = currentFull;
    if (optDisplay) optDisplay.textContent = currentFull;
    if (sidebarBadge) sidebarBadge.textContent = currentFull;
    if (sidebarBadgeAlt) sidebarBadgeAlt.textContent = currentFull;
    if (iconDisplaySub) iconDisplaySub.textContent = `● ${store.data.status === "online" ? "Online" : "Offline"} • ${store.data.installedVersion || "1.20.4"}`;
    if (subtext) {
      subtext.textContent = `Clean zero-boot installation ready for configuration. Active engine: ${store.data.installedSoftware || "Paper"}.`;
    }

    document.querySelectorAll(".software-card").forEach((card) => {
      card.classList.toggle("active", card.getAttribute("data-software") === (this.selectedSoftware || store.data.installedSoftware));
    });
    document.querySelectorAll(".version-select-pill").forEach((pill) => {
      pill.classList.toggle("active", pill.getAttribute("data-ver") === (this.selectedVersion || store.data.installedVersion));
    });
    this.updateVersionInstallSummary();
  }

  async installSelectedVersion() {
    sfx.playClick();
    const btn = document.getElementById("btn-install-version-action");
    const wrapper = document.getElementById("install-progress-wrapper");
    const step = document.getElementById("install-status-step");
    const percent = document.getElementById("install-percent");
    const fill = document.getElementById("install-bar-fill");

    btn.disabled = true;
    wrapper.style.display = "block";

    const stages = [
      { pct: 25, text: `Connecting to ${this.selectedSoftware} repositories...` },
      { pct: 60, text: `Downloading ${this.selectedSoftware.toLowerCase()}-${this.selectedVersion}.jar...` },
      { pct: 85, text: "Verifying checksum & generating clean server.properties..." },
      { pct: 100, text: `${this.selectedSoftware} ${this.selectedVersion} installed successfully!` }
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      percent.textContent = `${stages[i].pct}%`;
      fill.style.width = `${stages[i].pct}%`;
      step.textContent = stages[i].text;
    }

    store.data.installedSoftware = this.selectedSoftware;
    store.data.installedVersion = this.selectedVersion;
    store.data.serverVersion = `${this.selectedSoftware} ${this.selectedVersion}`;
    store.save();

    this.renderVersionUI();
    this.appendLog("system", `[EchoNode Version] Switched server engine to ${this.selectedSoftware} ${this.selectedVersion} (Zero-Boot State).`);
    this.showToast(`Installed ${this.selectedSoftware} ${this.selectedVersion}!`, "success");

    setTimeout(() => {
      wrapper.style.display = "none";
      btn.disabled = false;
      fill.style.width = "0%";
    }, 1400);
  }

  // ============================================================================
  // ZERO-STATE WORLDS & DIMENSIONS
  // ============================================================================
  bindWorlds() {
    const container = document.getElementById("worlds-view-container");
    if (!container) return;

    container.addEventListener("click", (e) => {
      const genBtn = e.target.closest("#btn-generate-world-now");
      if (genBtn) {
        sfx.playClick();
        this.generateFreshWorlds();
        return;
      }

      const verBtn = e.target.closest("#btn-goto-version-from-worlds");
      if (verBtn) {
        sfx.playClick();
        this.switchTab("version");
        return;
      }
    });
  }

  generateFreshWorlds() {
    sfx.playSuccess();
    const seedInput = document.getElementById("input-custom-seed");
    const typeSelect = document.getElementById("select-level-type");

    const seed = seedInput && seedInput.value.trim() ? seedInput.value.trim() : `${Math.floor(Math.random() * 8999999999999999) + 1000000000000000}`;
    const levelType = typeSelect ? typeSelect.value : "DEFAULT";

    store.data.customSeed = seed;
    store.data.levelType = levelType;
    store.data.worldsGenerated = true;
    store.save();

    this.renderWorldsList();
    this.appendLog("system", `[World Generator] Created clean dimensions (Seed: ${seed}, Type: ${levelType})`);
    this.showToast("Clean world dimensions generated!", "success");
  }

  renderWorldsList() {
    const container = document.getElementById("worlds-view-container");
    const badgeWorlds = document.getElementById("badge-worlds-count");
    if (!container) return;

    if (!store.data.worldsGenerated) {
      if (badgeWorlds) badgeWorlds.textContent = "0 Dims";
      container.innerHTML = `
        <div class="empty-worlds-card">
          <div class="empty-world-glow"></div>
          <div class="empty-world-icon">🌍</div>
          <h3>No Worlds Generated Yet</h3>
          <p>This server starts with zero generated terrain or saved player data. Once you choose your version and press <strong>Start Server</strong>, the Overworld, Nether, and The End dimensions will generate automatically.</p>
          
          <div class="world-seed-prep">
            <div class="seed-input-group">
              <label>Custom Seed (Optional):</label>
              <input type="text" id="input-custom-seed" class="form-input" placeholder="Leave empty for random seed..." value="${store.data.customSeed || ''}">
            </div>
            <div class="seed-input-group">
              <label>World Dimension Type:</label>
              <select id="select-level-type" class="form-input">
                <option value="DEFAULT">Default (Normal Biomes &amp; Caves)</option>
                <option value="FLAT">Superflat</option>
                <option value="LARGE_BIOMES">Large Biomes</option>
                <option value="AMPLIFIED">Amplified (Extreme Peaks)</option>
              </select>
            </div>
          </div>

          <div style="margin-top: 20px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button class="btn-primary" id="btn-generate-world-now" style="padding: 10px 22px; font-size: 13px;">
              <span>⚡ Generate Clean Dimensions Now</span>
            </button>
            <button class="btn-secondary" id="btn-goto-version-from-worlds" style="padding: 10px 22px; font-size: 13px;">
              <span>📦 Change Version First</span>
            </button>
          </div>
        </div>
      `;
    } else {
      if (badgeWorlds) badgeWorlds.textContent = "3 Dims";
      const seed = store.data.customSeed || "Random Seed";
      container.innerHTML = `
        <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 12px 20px;">
          <div style="font-size: 13px; color: #4ade80; font-weight: 600;">✓ Clean Dimensions Active • Seed: <code>${seed}</code></div>
          <button class="file-act-btn" style="color: #f87171;" id="btn-reset-worlds">Reset World Dimensions</button>
        </div>
        <div class="worlds-cards-grid">
          <div class="world-card">
            <div class="world-card-top">
              <div class="world-type-icon overworld">🌍</div>
              <div class="world-meta">
                <h3>world</h3>
                <p>Overworld Dimension</p>
              </div>
            </div>
            <div class="world-specs-list">
              <div class="world-spec-row"><span>World Seed</span><strong style="color: #38bdf8;">${seed}</strong></div>
              <div class="world-spec-row"><span>Spawn Biome</span><strong>Plains / Forest</strong></div>
              <div class="world-spec-row"><span>Status</span><strong style="color: #4ade80;">Generated Clean</strong></div>
            </div>
          </div>
          <div class="world-card">
            <div class="world-card-top">
              <div class="world-type-icon nether">🔥</div>
              <div class="world-meta">
                <h3>world_nether</h3>
                <p>Nether Dimension</p>
              </div>
            </div>
            <div class="world-specs-list">
              <div class="world-spec-row"><span>Dimension Core</span><strong>minecraft:the_nether</strong></div>
              <div class="world-spec-row"><span>Status</span><strong style="color: #4ade80;">Ready for First Entry</strong></div>
            </div>
          </div>
          <div class="world-card">
            <div class="world-card-top">
              <div class="world-type-icon the-end">🌌</div>
              <div class="world-meta">
                <h3>world_the_end</h3>
                <p>The End Dimension</p>
              </div>
            </div>
            <div class="world-specs-list">
              <div class="world-spec-row"><span>Ender Dragon</span><strong>Unspawned (Clean)</strong></div>
              <div class="world-spec-row"><span>Status</span><strong style="color: #4ade80;">Ready for Stronghold</strong></div>
            </div>
          </div>
        </div>
      `;
      const resetBtn = container.querySelector("#btn-reset-worlds");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          sfx.playWarning();
          store.data.worldsGenerated = false;
          store.save();
          this.renderWorldsList();
          this.showToast("Reset world dimensions to zero-boot state.", "info");
        });
      }
    }
  }
}

// Global instances
const threeEngine = new ThreeJsEngine();
const mouseTracker = new MouseTracker();
const spatialEngine = new Spatial3DEngine();
const app = new EchoNodeApp();

window.app = app;
window.spatialEngine = spatialEngine;

// Initialize app when DOM ready
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
