// Vercel Serverless Function: POST /api/server/restart
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    success: true,
    status: 'online',
    isOnline: true,
    source: 'vercel-cloud-switch',
    message: 'Server restarted via Vercel Cloud Controller.'
  });
};
