// Vercel Serverless Function: GET /api/server/network
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  return res.status(200).json({
    success: true,
    publicIp: 'vivo-carrier.tun.ply.gg',
    lanIp: '127.0.0.1',
    clientIp: clientIp,
    publicServerIp: 'vivo-carrier.tun.ply.gg:25565',
    port: 25565,
    bedrockPort: 19132,
    tunnelIp: 'vivo-carrier.tun.ply.gg',
    tunnelActive: true
  });
};
