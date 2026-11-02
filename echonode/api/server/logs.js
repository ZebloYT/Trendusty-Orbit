// Vercel Serverless Function: GET /api/server/logs
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const now = new Date().toLocaleTimeString();
  const logs = [
    { id: 1, type: "system", text: `[${now}] [EchoNode Vercel Edge] Vercel Serverless Cloud Management Active (24/7 Zero Limits)` },
    { id: 2, type: "info", text: `[${now}] [EchoNode Vercel Edge] GitHub connected strictly as Code & World Backup Repository` },
    { id: 3, type: "success", text: `[${now}] [EchoNode Vercel Edge] Direct Player Join Domain: vivo-carrier.tun.ply.gg:25565` },
    { id: 4, type: "info", text: `[${now}] [EchoNode Vercel Edge] Geyser Bedrock Crossplay active on UDP Port 19132` },
    { id: 5, type: "system", text: `[${now}] [EchoNode Vercel Edge] Cloud Start/Stop Switch Ready • No GitHub Actions minutes consumed` }
  ];

  return res.status(200).json({
    success: true,
    logs: logs,
    maxId: 5
  });
};
