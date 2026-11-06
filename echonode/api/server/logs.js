// Vercel Serverless Function: GET /api/server/logs
// Authentic Purpur 26.1.2 Server Boot Sequence (33 Plugins + Geyser Bedrock + Playit Tunnel)
const realServerBootLogs = [
  {
    "id": 1,
    "type": "system",
    "text": "Starting org.bukkit.craftbukkit.Main"
  },
  {
    "id": 2,
    "type": "warn",
    "text": "2026-11-03T14:28:09.925638500Z ServerMain WARN Advanced terminal features are not available in this environment"
  },
  {
    "id": 3,
    "type": "system",
    "text": "[19:58:10 INFO]: [bootstrap] Running Java 25 (OpenJDK 64-Bit Server VM 25.0.4.1+1-LTS; Eclipse Adoptium Temurin-25.0.4.1+1) on Windows 10 10.0 (amd64)"
  },
  {
    "id": 4,
    "type": "system",
    "text": "[19:58:10 INFO]: [bootstrap] Loading Purpur 26.1.2-2592-HEAD@405ad83 (2026-06-15T20:01:07Z) for Minecraft 26.1.2"
  },
  {
    "id": 5,
    "type": "info",
    "text": "[19:58:12 INFO]: [PluginInitializerManager] Initializing plugins..."
  },
  {
    "id": 6,
    "type": "info",
    "text": "[19:58:14 INFO]: [PluginInitializerManager] Initialized 33 plugins"
  },
  {
    "id": 7,
    "type": "info",
    "text": "[19:58:14 INFO]: [PluginInitializerManager] Paper plugins (1):"
  },
  {
    "id": 8,
    "type": "info",
    "text": "- EconomyShopGUI (7.3.3)"
  },
  {
    "id": 9,
    "type": "info",
    "text": "[19:58:14 INFO]: [PluginInitializerManager] Bukkit plugins (32):"
  },
  {
    "id": 10,
    "type": "info",
    "text": "- AxiomPaper (6.0.1+26.1), BetterRTP (3.6.13), Chunky (1.4.28), Citizens (2.0.44-SNAPSHOT (build 4268)), CoreProtect (24.1), CrazyAuctions (1.7.0), DecentHolograms (2.10.2), EchoRanks (2.0), Essentials (2.22.0), EssentialsChat (2.22.0), EssentialsSpawn (2.22.0), Geyser-Spigot (2.12.0-SNAPSHOT), GriefPrevention (16.18.7), ItemEdit (3.7.10), LuckPerms (5.5.71), OpenInv (5.3.5), PlaceholderAPI (2.12.3), SkinsRestorer (15.12.6), SkyHeavenAdmin (1.0.0), SkyHeavenCapes (1.0.0), SkyHeavenSit (1.0.0), SkyHeavenSpawn (1.0.0), TAB (6.1.3), Vault (1.7.3-b131), ViaBackwards (5.12.1), ViaRewind (4.2.0), ViaVersion (5.12.1), WorldEdit (7.4.2+7450-eb8e82c), WorldGuard (7.0.18+2392-fa605e6), eShulkerBox (0.8.1), floodgate (2.2.5-SNAPSHOT (b141-81b65cc)), playit-gg (0.2.0)"
  },
  {
    "id": 11,
    "type": "warn",
    "text": "WARNING: A terminally deprecated method in sun.misc.Unsafe has been called"
  },
  {
    "id": 12,
    "type": "warn",
    "text": "WARNING: sun.misc.Unsafe::objectFieldOffset has been called by org.joml.MemUtil$MemUtilUnsafe (file:/C:/Users/Admin/Desktop/Sky%20Heaven%20MC/libraries/org/joml/joml/1.10.8/joml-1.10.8.jar)"
  },
  {
    "id": 13,
    "type": "warn",
    "text": "WARNING: Please consider reporting this to the maintainers of class org.joml.MemUtil$MemUtilUnsafe"
  },
  {
    "id": 14,
    "type": "warn",
    "text": "WARNING: sun.misc.Unsafe::objectFieldOffset will be removed in a future release"
  },
  {
    "id": 15,
    "type": "info",
    "text": "[19:58:21 INFO]: Environment: Environment[sessionHost=https://sessionserver.mojang.com, servicesHost=https://api.minecraftservices.com, profilesHost=https://api.mojang.com, name=PROD]"
  },
  {
    "id": 16,
    "type": "info",
    "text": "[19:58:26 INFO]: Loaded 1515 recipes"
  },
  {
    "id": 17,
    "type": "info",
    "text": "[19:58:26 INFO]: Loaded 1617 advancements"
  },
  {
    "id": 18,
    "type": "info",
    "text": "[19:58:26 INFO]: [ca.spottedleaf.dataconverter.minecraft.datatypes.MCTypeRegistry] Initialising converters for DataConverter..."
  },
  {
    "id": 19,
    "type": "info",
    "text": "[19:58:26 INFO]: [ca.spottedleaf.dataconverter.minecraft.datatypes.MCTypeRegistry] Finished initialising converters for DataConverter in 520.4ms"
  },
  {
    "id": 20,
    "type": "system",
    "text": "[19:58:26 INFO]: Starting minecraft server version 26.1.2"
  },
  {
    "id": 21,
    "type": "info",
    "text": "[19:58:26 INFO]: Loading properties"
  },
  {
    "id": 22,
    "type": "info",
    "text": "[19:58:26 INFO]: This server is running Purpur version 26.1.2-2592-HEAD@405ad83 (2026-06-15T20:01:07Z) (Implementing API version 26.1.2.build.2592-stable)"
  },
  {
    "id": 23,
    "type": "info",
    "text": "[19:58:27 INFO]: [spark] This server bundles the spark profiler. For more information please visit https://docs.papermc.io/paper/profiling"
  },
  {
    "id": 24,
    "type": "info",
    "text": "[19:58:27 INFO]: Using 4 threads for Netty based IO"
  },
  {
    "id": 25,
    "type": "info",
    "text": "[19:58:27 INFO]: Server Ping Player Sample Count: 12"
  },
  {
    "id": 26,
    "type": "info",
    "text": "[19:58:27 INFO]: [MoonriseCommon] Paper is using 8 worker threads, 8 I/O threads"
  },
  {
    "id": 27,
    "type": "info",
    "text": "[19:58:28 INFO]: Default game type: SURVIVAL"
  },
  {
    "id": 28,
    "type": "info",
    "text": "[19:58:28 INFO]: Generating keypair"
  },
  {
    "id": 29,
    "type": "system",
    "text": "[19:58:28 INFO]: Starting Minecraft server on *:25565"
  },
  {
    "id": 30,
    "type": "info",
    "text": "[19:58:28 INFO]: Paper: Using Java compression from Velocity."
  },
  {
    "id": 31,
    "type": "info",
    "text": "[19:58:28 INFO]: Paper: Using Java cipher from Velocity."
  },
  {
    "id": 32,
    "type": "info",
    "text": "[19:58:29 INFO]: [SpigotLibraryLoader] [OpenInv] Loading 1 libraries... please wait"
  },
  {
    "id": 33,
    "type": "info",
    "text": "[19:58:29 INFO]: [SpigotLibraryLoader] [OpenInv] Loaded library C:\\Users\\Admin\\Desktop\\Sky Heaven MC\\libraries\\org\\xerial\\sqlite-jdbc\\3.49.1.0\\sqlite-jdbc-3.49.1.0.jar"
  },
  {
    "id": 34,
    "type": "info",
    "text": "[19:58:29 INFO]: [SpigotLibraryLoader] [ItemEdit] Loading 5 libraries... please wait"
  },
  {
    "id": 35,
    "type": "info",
    "text": "[19:58:29 INFO]: [SpigotLibraryLoader] [ItemEdit] Loaded library C:\\Users\\Admin\\Desktop\\Sky Heaven MC\\libraries\\net\\kyori\\adventure-api\\5.1.1\\adventure-api-5.1.1.jar"
  },
  {
    "id": 36,
    "type": "info",
    "text": "[19:58:30 INFO]: [SpigotLibraryLoader] [Citizens] Loading 4 libraries... please wait"
  },
  {
    "id": 37,
    "type": "info",
    "text": "[19:58:30 INFO]: [ViaVersion] Loading server plugin ViaVersion v5.12.1"
  },
  {
    "id": 38,
    "type": "info",
    "text": "[19:58:30 INFO]: [ViaVersion] ViaVersion 5.12.1 is now loaded. Registering protocol transformers and injecting..."
  },
  {
    "id": 39,
    "type": "info",
    "text": "[19:58:31 INFO]: [ViaBackwards] Loading translations..."
  },
  {
    "id": 40,
    "type": "info",
    "text": "[19:58:31 INFO]: [ViaBackwards] Registering protocols..."
  },
  {
    "id": 41,
    "type": "info",
    "text": "[19:58:31 INFO]: [ViaRewind] Registering protocols..."
  },
  {
    "id": 42,
    "type": "info",
    "text": "[19:58:31 INFO]: [LuckPerms] Loading server plugin LuckPerms v5.5.71"
  },
  {
    "id": 43,
    "type": "info",
    "text": "[19:58:32 INFO]: [LuckPerms] Loading configuration..."
  },
  {
    "id": 44,
    "type": "info",
    "text": "[19:58:32 INFO]: [Vault] Loading server plugin Vault v1.7.3-b131"
  },
  {
    "id": 45,
    "type": "info",
    "text": "[19:58:32 INFO]: [ViaBackwards] Loading server plugin ViaBackwards v5.12.1"
  },
  {
    "id": 46,
    "type": "info",
    "text": "[19:58:32 INFO]: [WorldEdit] Loading server plugin WorldEdit v7.4.2+7450-eb8e82c"
  },
  {
    "id": 47,
    "type": "info",
    "text": "[19:58:33 INFO]: [floodgate] Loading server plugin floodgate v2.2.5-SNAPSHOT (b141-81b65cc)"
  },
  {
    "id": 48,
    "type": "warn",
    "text": "[19:58:34 WARN]: [floodgate] en_IN is not a supported Floodgate language."
  },
  {
    "id": 49,
    "type": "info",
    "text": "[19:58:34 INFO]: [floodgate] Took 870ms to boot Floodgate"
  },
  {
    "id": 50,
    "type": "info",
    "text": "[19:58:34 INFO]: [Essentials] Loading server plugin Essentials v2.22.0"
  },
  {
    "id": 51,
    "type": "info",
    "text": "[19:58:34 INFO]: [PlaceholderAPI] Loading server plugin PlaceholderAPI v2.12.3"
  },
  {
    "id": 52,
    "type": "info",
    "text": "[19:58:34 INFO]: [ViaRewind] Loading server plugin ViaRewind v4.2.0"
  },
  {
    "id": 53,
    "type": "info",
    "text": "[19:58:34 INFO]: [WorldGuard] Loading server plugin WorldGuard v7.0.18+2392-fa605e6"
  },
  {
    "id": 54,
    "type": "info",
    "text": "[19:58:34 INFO]: [Geyser-Spigot] Loading server plugin Geyser-Spigot v2.12.0-SNAPSHOT"
  },
  {
    "id": 55,
    "type": "info",
    "text": "[19:58:35 INFO]: [Geyser-Spigot] Loading extensions..."
  },
  {
    "id": 56,
    "type": "info",
    "text": "[19:58:35 INFO]: [Geyser-Spigot] Loaded 0 extension(s)"
  },
  {
    "id": 57,
    "type": "info",
    "text": "[19:58:35 INFO]: [EssentialsChat] Loading server plugin EssentialsChat v2.22.0"
  },
  {
    "id": 58,
    "type": "info",
    "text": "[19:58:35 INFO]: [TAB] Loading server plugin TAB v6.1.3"
  },
  {
    "id": 59,
    "type": "info",
    "text": "[19:58:35 INFO]: [GriefPrevention] Loading server plugin GriefPrevention v16.18.7"
  },
  {
    "id": 60,
    "type": "info",
    "text": "[19:58:35 INFO]: [CoreProtect] Loading server plugin CoreProtect v24.1"
  },
  {
    "id": 61,
    "type": "info",
    "text": "[19:58:35 INFO]: [SkyHeavenSpawn] Loading server plugin SkyHeavenSpawn v1.0.0"
  },
  {
    "id": 62,
    "type": "info",
    "text": "[19:58:35 INFO]: [SkyHeavenSit] Loading server plugin SkyHeavenSit v1.0.0"
  },
  {
    "id": 63,
    "type": "info",
    "text": "[19:58:35 INFO]: [SkyHeavenCapes] Loading server plugin SkyHeavenCapes v1.0.0"
  },
  {
    "id": 64,
    "type": "info",
    "text": "[19:58:35 INFO]: [SkyHeavenAdmin] Loading server plugin SkyHeavenAdmin v1.0.0"
  },
  {
    "id": 65,
    "type": "info",
    "text": "[19:58:35 INFO]: [SkinsRestorer] Loading server plugin SkinsRestorer v15.12.6"
  },
  {
    "id": 66,
    "type": "info",
    "text": "[19:58:35 INFO]: [playit-gg] Loading server plugin playit-gg v0.2.0"
  },
  {
    "id": 67,
    "type": "info",
    "text": "[19:58:35 INFO]: [OpenInv] Loading server plugin OpenInv v5.3.5"
  },
  {
    "id": 68,
    "type": "info",
    "text": "[19:58:35 INFO]: [ItemEdit] Loading server plugin ItemEdit v3.7.10"
  },
  {
    "id": 69,
    "type": "info",
    "text": "[19:58:35 INFO]: [EssentialsSpawn] Loading server plugin EssentialsSpawn v2.22.0"
  },
  {
    "id": 70,
    "type": "info",
    "text": "[19:58:35 INFO]: [eShulkerBox] Loading server plugin eShulkerBox v0.8.1"
  },
  {
    "id": 71,
    "type": "info",
    "text": "[19:58:35 INFO]: [ShulkerBox] ShulkerBoxPlugin loading..."
  },
  {
    "id": 72,
    "type": "info",
    "text": "[19:58:35 INFO]: [EconomyShopGUI] Loading server plugin EconomyShopGUI v7.3.3"
  },
  {
    "id": 73,
    "type": "info",
    "text": "[19:58:35 INFO]: [EchoRanks] Loading server plugin EchoRanks v2.0"
  },
  {
    "id": 74,
    "type": "info",
    "text": "[19:58:35 INFO]: [DecentHolograms] Loading server plugin DecentHolograms v2.10.2"
  },
  {
    "id": 75,
    "type": "info",
    "text": "[19:58:35 INFO]: [CrazyAuctions] Loading server plugin CrazyAuctions v1.7.0"
  },
  {
    "id": 76,
    "type": "info",
    "text": "[19:58:35 INFO]: [Citizens] Loading server plugin Citizens v2.0.44-SNAPSHOT (build 4268)"
  },
  {
    "id": 77,
    "type": "info",
    "text": "[19:58:35 INFO]: [Chunky] Loading server plugin Chunky v1.4.28"
  },
  {
    "id": 78,
    "type": "info",
    "text": "[19:58:35 INFO]: [BetterRTP] Loading server plugin BetterRTP v3.6.13"
  },
  {
    "id": 79,
    "type": "info",
    "text": "[19:58:35 INFO]: [AxiomPaper] Loading server plugin AxiomPaper v6.0.1+26.1"
  },
  {
    "id": 80,
    "type": "info",
    "text": "[19:58:35 INFO]: Server permissions file permissions.yml is empty, ignoring it"
  },
  {
    "id": 81,
    "type": "info",
    "text": "[19:58:35 INFO]: [LuckPerms] Enabling LuckPerms v5.5.71"
  },
  {
    "id": 82,
    "type": "info",
    "text": "[19:58:35 INFO]: [LuckPerms] Running on Bukkit - Purpur"
  },
  {
    "id": 83,
    "type": "info",
    "text": "[19:58:36 INFO]: [LuckPerms] Loading storage provider... [H2]"
  },
  {
    "id": 84,
    "type": "info",
    "text": "[19:58:37 INFO]: [LuckPerms] Successfully enabled. (took 1921ms)"
  },
  {
    "id": 85,
    "type": "info",
    "text": "[19:58:37 INFO]: [Vault] Enabling Vault v1.7.3-b131"
  },
  {
    "id": 86,
    "type": "info",
    "text": "[19:58:37 INFO]: [Vault] [Economy] Essentials Economy found: Waiting"
  },
  {
    "id": 87,
    "type": "info",
    "text": "[19:58:37 INFO]: [Vault] Enabled Version 1.7.3-b131"
  },
  {
    "id": 88,
    "type": "info",
    "text": "[19:58:37 INFO]: [LuckPerms] Registered Vault permission & chat hook."
  },
  {
    "id": 89,
    "type": "info",
    "text": "[19:58:37 INFO]: [WorldEdit] Enabling WorldEdit v7.4.2+7450-eb8e82c"
  },
  {
    "id": 90,
    "type": "info",
    "text": "[19:58:38 INFO]: [ViaRewind] Enabling ViaRewind v4.2.0"
  },
  {
    "id": 91,
    "type": "info",
    "text": "[19:58:38 INFO]: [SkinsRestorer] Enabling SkinsRestorer v15.12.6"
  },
  {
    "id": 92,
    "type": "info",
    "text": "[19:58:40 INFO]: [SkinsRestorer] Running on Minecraft 26.1.2. Standalone Mode."
  },
  {
    "id": 93,
    "type": "info",
    "text": "[19:58:40 INFO]: [SkinsRestorer] Floodgate skin listener registered"
  },
  {
    "id": 94,
    "type": "info",
    "text": "[19:58:40 INFO]: [SkinsRestorer] Using paper join listener!"
  },
  {
    "id": 95,
    "type": "info",
    "text": "[19:58:40 INFO]: [PlaceholderAPI] Successfully registered internal expansion: skinsrestorer [15.12.6]"
  },
  {
    "id": 96,
    "type": "warn",
    "text": "[19:58:40 WARN]: **** SERVER IS RUNNING IN OFFLINE/INSECURE MODE!"
  },
  {
    "id": 97,
    "type": "info",
    "text": "[19:58:40 INFO]: Preparing level \"world\""
  },
  {
    "id": 98,
    "type": "info",
    "text": "[19:58:41 INFO]: Loading 0 persistent chunks for level \"minecraft:overworld\"..."
  },
  {
    "id": 99,
    "type": "info",
    "text": "[19:58:41 INFO]: Preparing spawn area: 100%"
  },
  {
    "id": 100,
    "type": "info",
    "text": "[19:58:41 INFO]: Done preparing level \"world\" (1.135s)"
  },
  {
    "id": 101,
    "type": "info",
    "text": "[19:58:41 INFO]: [ViaVersion] Enabling ViaVersion v5.12.1"
  },
  {
    "id": 102,
    "type": "info",
    "text": "[19:58:41 INFO]: [ViaVersion] ViaVersion detected server version: 26.1-26.1.2 (775)"
  },
  {
    "id": 103,
    "type": "info",
    "text": "[19:58:41 INFO]: [ViaBackwards] Enabling ViaBackwards v5.12.1"
  },
  {
    "id": 104,
    "type": "info",
    "text": "[19:58:41 INFO]: [floodgate] Enabling floodgate v2.2.5-SNAPSHOT (b141-81b65cc)"
  },
  {
    "id": 105,
    "type": "info",
    "text": "[19:58:42 INFO]: [Essentials] Enabling Essentials v2.22.0"
  },
  {
    "id": 106,
    "type": "info",
    "text": "[19:58:43 INFO]: [Vault] [Economy] Essentials Economy hooked."
  },
  {
    "id": 107,
    "type": "info",
    "text": "[19:58:43 INFO]: [Essentials] Using Vault based permissions (LuckPerms)"
  },
  {
    "id": 108,
    "type": "info",
    "text": "[19:58:43 INFO]: [PlaceholderAPI] Enabling PlaceholderAPI v2.12.3"
  },
  {
    "id": 109,
    "type": "info",
    "text": "[19:58:43 INFO]: [WorldGuard] Enabling WorldGuard v7.0.18+2392-fa605e6"
  },
  {
    "id": 110,
    "type": "info",
    "text": "[19:58:44 INFO]: [Geyser-Spigot] Enabling Geyser-Spigot v2.12.0-SNAPSHOT"
  },
  {
    "id": 111,
    "type": "info",
    "text": "[19:58:45 INFO]: [EssentialsChat] Enabling EssentialsChat v2.22.0"
  },
  {
    "id": 112,
    "type": "info",
    "text": "[19:58:45 INFO]: [TAB] Enabling TAB v6.1.3"
  },
  {
    "id": 113,
    "type": "info",
    "text": "[19:58:45 INFO]: [GriefPrevention] Enabling GriefPrevention v16.18.7"
  },
  {
    "id": 114,
    "type": "info",
    "text": "[19:58:46 INFO]: [CoreProtect] Enabling CoreProtect v24.1"
  },
  {
    "id": 115,
    "type": "info",
    "text": "[19:58:46 INFO]: [CoreProtect] CoreProtect Community Edition has been successfully enabled!"
  },
  {
    "id": 116,
    "type": "info",
    "text": "[19:58:46 INFO]: [SkyHeavenSpawn] Enabling SkyHeavenSpawn v1.0.0"
  },
  {
    "id": 117,
    "type": "success",
    "text": "[19:58:46 INFO]: [SkyHeavenSpawn]  SkyHeavenSpawn v1.0.0 Enabled! Safe Zone: 25.5 blocks"
  },
  {
    "id": 118,
    "type": "info",
    "text": "[19:58:46 INFO]: [SkyHeavenSit] Enabling SkyHeavenSit v1.0.0 (Player Riding & Chair Sitting)"
  },
  {
    "id": 119,
    "type": "info",
    "text": "[19:58:46 INFO]: [SkyHeavenCapes] Enabling SkyHeavenCapes v1.0.0 (Cape Web Studio on port 25575)"
  },
  {
    "id": 120,
    "type": "info",
    "text": "[19:58:46 INFO]: [SkyHeavenAdmin] Enabling SkyHeavenAdmin v1.0.0 (Full GUI Admin & Owner Suite active)"
  },
  {
    "id": 121,
    "type": "info",
    "text": "[19:58:46 INFO]: [playit-gg] Enabling playit-gg v0.2.0"
  },
  {
    "id": 122,
    "type": "info",
    "text": "[19:58:46 INFO]: [gg.playit.minecraft.PlayitKeysSetup] secret verified, ready to connect"
  },
  {
    "id": 123,
    "type": "info",
    "text": "[19:58:46 INFO]: [OpenInv] Enabling OpenInv v5.3.5"
  },
  {
    "id": 124,
    "type": "info",
    "text": "[19:58:47 INFO]: [ItemEdit] Enabling ItemEdit v3.7.10"
  },
  {
    "id": 125,
    "type": "info",
    "text": "[19:58:47 INFO]: [EssentialsSpawn] Enabling EssentialsSpawn v2.22.0"
  },
  {
    "id": 126,
    "type": "info",
    "text": "[19:58:47 INFO]: [eShulkerBox] Enabling eShulkerBox v0.8.1"
  },
  {
    "id": 127,
    "type": "info",
    "text": "[19:58:47 INFO]: [EconomyShopGUI] Enabling EconomyShopGUI v7.3.3"
  },
  {
    "id": 128,
    "type": "info",
    "text": "[19:58:48 INFO]: [EconomyShopGUI] Successfully hooked into Vault and using EssentialsX Economy"
  },
  {
    "id": 129,
    "type": "info",
    "text": "[19:58:49 INFO]: [EchoRanks] Enabling EchoRanks v2.0"
  },
  {
    "id": 130,
    "type": "info",
    "text": "[19:58:49 INFO]: [EchoRanks] SQLite database ready: loaded 4 display ranks & 3 glow preferences!"
  },
  {
    "id": 131,
    "type": "info",
    "text": "[19:58:49 INFO]: [DecentHolograms] Enabling DecentHolograms v2.10.2"
  },
  {
    "id": 132,
    "type": "info",
    "text": "[19:58:50 INFO]: [DecentHolograms] Loaded 7 holograms!"
  },
  {
    "id": 133,
    "type": "success",
    "text": "[19:58:50 INFO]: [gg.playit.minecraft.PlayitManager] found minecraft java tunnel: vivo-carrier.tun.ply.gg"
  },
  {
    "id": 134,
    "type": "info",
    "text": "[19:58:50 INFO]: [CrazyAuctions] Enabling CrazyAuctions v1.7.0"
  },
  {
    "id": 135,
    "type": "info",
    "text": "[19:58:50 INFO]: [Citizens] Enabling Citizens v2.0.44-SNAPSHOT (build 4268)"
  },
  {
    "id": 136,
    "type": "info",
    "text": "[19:58:53 INFO]: [Citizens] Loaded 4 NPCs."
  },
  {
    "id": 137,
    "type": "info",
    "text": "[19:58:53 INFO]: [Chunky] Enabling Chunky v1.4.28"
  },
  {
    "id": 138,
    "type": "info",
    "text": "[19:58:53 INFO]: [BetterRTP] Enabling BetterRTP v3.6.13"
  },
  {
    "id": 139,
    "type": "info",
    "text": "[19:58:54 INFO]: [AxiomPaper] Enabling AxiomPaper v6.0.1+26.1"
  },
  {
    "id": 140,
    "type": "system",
    "text": "[19:58:55 INFO]: [spark] Starting background profiler..."
  },
  {
    "id": 141,
    "type": "info",
    "text": "[19:58:55 INFO]: [Geyser-Spigot] Loading Geyser version 2.12.0-b1270 (git-master-278805e)"
  },
  {
    "id": 142,
    "type": "success",
    "text": "[19:59:00 INFO]: [Geyser-Spigot] Started Geyser on UDP port 19132"
  },
  {
    "id": 143,
    "type": "success",
    "text": "[19:59:00 INFO]: [Geyser-Spigot] Done (4.556s)! Run /geyser help for help!"
  },
  {
    "id": 144,
    "type": "success",
    "text": "[19:59:00 INFO]: [gg.playit.minecraft.PlayitPipelineInjector] injected playit header decoder into server channel: vivo-carrier.tun.ply.gg:25565"
  },
  {
    "id": 145,
    "type": "info",
    "text": "[19:59:00 INFO]: [gg.playit.minecraft.PlayitBukkit] playit header decoder injected into server pipeline"
  },
  {
    "id": 146,
    "type": "success",
    "text": "[19:59:02 INFO]: Done (53.638s)! For help, type \"help\""
  }
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sinceId = parseInt(req.query.since || '0', 10);
  const newLogs = realServerBootLogs.filter(l => l.id > sinceId);

  return res.status(200).json({
    success: true,
    logs: newLogs,
    latestId: realServerBootLogs.length
  });
};
