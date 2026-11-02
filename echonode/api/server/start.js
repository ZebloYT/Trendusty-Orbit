// Vercel Serverless Function: POST /api/server/start
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const serverIp = 'vivo-carrier.tun.ply.gg:25565';
  const bedrockPort = 19132;

  return res.status(200).json({
    success: true,
    status: 'online',
    isOnline: true,
    source: 'vercel-cloud-switch',
    message: 'Server turned ON via Vercel Cloud Controller!',
    serverIp: serverIp,
    tunnelIp: 'vivo-carrier.tun.ply.gg',
    bedrockPort: bedrockPort,
    connectionNotice: 'Players can now connect via vivo-carrier.tun.ply.gg (Java) or port 19132 (Bedrock).',
    network: {
      publicIp: 'vivo-carrier.tun.ply.gg',
      lanIp: '127.0.0.1',
      publicServerIp: serverIp,
      bedrockPort: bedrockPort
    }
  });
};
