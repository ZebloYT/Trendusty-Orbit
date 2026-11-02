// Vercel Serverless Function: GET /api/server/status
const net = require('net');

let cloudState = {
  status: 'offline',
  lastAction: Date.now(),
  serverIp: 'vivo-carrier.tun.ply.gg',
  serverPort: 25565,
  bedrockPort: 19132
};

function pingMinecraft(host, port = 25565, timeout = 2500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const start = Date.now();
    let settled = false;

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      try {
        const hostBuf = Buffer.from(host, 'utf8');
        const portBuf = Buffer.alloc(2);
        portBuf.writeUInt16BE(port);

        // Handshake packet (protocol 765 = 1.20.4, next state 1 = status)
        const data = Buffer.concat([
          Buffer.from([0x00, 0xfd, 0x05]),
          Buffer.from([hostBuf.length]),
          hostBuf,
          portBuf,
          Buffer.from([0x01])
        ]);
        const handshake = Buffer.concat([Buffer.from([data.length]), data]);
        const statusReq = Buffer.from([0x01, 0x00]);

        socket.write(Buffer.concat([handshake, statusReq]));
      } catch (err) {
        if (!settled) { settled = true; socket.destroy(); resolve({ online: false }); }
      }
    });

    let buffer = Buffer.alloc(0);
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      const str = buffer.toString('utf8');
      const jsonStart = str.indexOf('{');
      const jsonEnd = str.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        try {
          const parsed = JSON.parse(str.substring(jsonStart, jsonEnd + 1));
          if (!settled) {
            settled = true;
            socket.destroy();
            resolve({
              online: true,
              latency: Math.max(12, Date.now() - start),
              data: parsed
            });
          }
        } catch (e) {}
      }
    });

    socket.on('timeout', () => {
      if (!settled) { settled = true; socket.destroy(); resolve({ online: false }); }
    });
    socket.on('error', () => {
      if (!settled) { settled = true; socket.destroy(); resolve({ online: false }); }
    });
    socket.on('close', () => {
      if (!settled) { settled = true; resolve({ online: false }); }
    });

    try {
      socket.connect(port, host);
    } catch (e) {
      if (!settled) { settled = true; socket.destroy(); resolve({ online: false }); }
    }
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const powerQuery = (req.query && req.query.power) ? req.query.power : null;
  if (powerQuery === 'online') {
    cloudState.status = 'online';
  } else if (powerQuery === 'offline') {
    cloudState.status = 'offline';
  }

  const queryIp = (req.query && req.query.ip) ? req.query.ip : cloudState.serverIp;
  const parts = queryIp.split(':');
  const host = parts[0];
  const port = parts[1] ? parseInt(parts[1], 10) : 25565;

  // Ping real server
  const pingResult = await pingMinecraft(host, port, 1500);

  const isReallyOnline = pingResult.online || cloudState.status === 'online';

  let playersOnline = 0;
  let maxPlayers = 50;
  let playerList = [];
  let motdText = "✦ SKY HEAVEN MC • 24/7 Survival SMP • Join Now!";
  let version = "Purpur 1.20.4 - 26.1.2";

  if (pingResult.online && pingResult.data) {
    if (pingResult.data.players) {
      playersOnline = pingResult.data.players.online || 0;
      maxPlayers = pingResult.data.players.max || 50;
      if (pingResult.data.players.sample) {
        playerList = pingResult.data.players.sample.map(p => p.name);
      }
    }
    if (pingResult.data.version && pingResult.data.version.name) {
      version = pingResult.data.version.name;
    }
  }

  const ramVal = isReallyOnline ? 3.4 : 0.0;
  const cpuVal = isReallyOnline ? 14 : 0;
  const tpsVal = isReallyOnline ? 20.0 : 0.0;
  const pingVal = isReallyOnline ? (pingResult.latency || 18) : null;

  const payload = {
    success: true,
    status: isReallyOnline ? 'online' : (cloudState.status === 'starting' ? 'starting' : 'offline'),
    isOnline: isReallyOnline,
    source: 'vercel-edge',
    ram: ramVal,
    ramMax: 8.0,
    cpu: cpuVal,
    players: playersOnline,
    playerList: playerList,
    tps: tpsVal,
    ping: pingVal,
    serverIp: `${host}:${port}`,
    tunnelIp: host,
    bedrockPort: 19132,
    version: version,
    motd: motdText,
    metrics: {
      ramUsage: ramVal,
      ramTotal: 8.0,
      cpu: cpuVal
    }
  };

  return res.status(200).json(payload);
};
