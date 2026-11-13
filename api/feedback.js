// ============================================================================
// TRENDUSTY ORBIT — ECOSYSTEM APPS FEEDBACK & PROBLEM RESOLUTION API
// Vercel Serverless Function: /api/feedback
// ============================================================================

let feedbacks = [
  {
    id: 'FB-JARVIS-INIT',
    appName: 'JARVIS',
    userName: 'Commander',
    rating: 5,
    category: 'feature',
    message: 'Active development phase: Voice commands and mobile controller pairing look promising.',
    timestamp: new Date().toISOString()
  },
  {
    id: 'FB-GESTUBE-INIT',
    appName: 'GESTUBE',
    userName: 'Amogh',
    rating: 5,
    category: 'general',
    message: 'Instant ad-skip and shorts auto-scroll work flawlessly across Chrome and Windows.',
    timestamp: new Date().toISOString()
  }
];

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const app = req.query.app;
    let list = feedbacks;
    if (app) {
      list = feedbacks.filter(f => f.appName.toLowerCase() === app.toLowerCase());
    }
    // Compute average rating
    const total = list.reduce((acc, f) => acc + (Number(f.rating) || 5), 0);
    const avg = list.length ? (total / list.length).toFixed(1) : '5.0';

    return res.status(200).json({
      success: true,
      count: list.length,
      averageRating: avg,
      feedbacks: list.slice(-30).reverse()
    });
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const { appName, userName, userEmail, rating, category, message } = body;

      if (!appName || !message) {
        return res.status(400).json({
          success: false,
          error: 'App name and message description are required.'
        });
      }

      const numRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
      const ticketId = 'FB-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 1000);

      const entry = {
        id: ticketId,
        appName: String(appName).trim(),
        userName: userName && String(userName).trim() ? String(userName).trim() : 'Anonymous Operative',
        userEmail: userEmail ? String(userEmail).trim() : '',
        rating: numRating,
        category: category || 'general',
        message: String(message).trim().slice(0, 3000),
        timestamp: new Date().toISOString(),
        clientIP: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1'
      };

      feedbacks.push(entry);
      if (feedbacks.length > 200) feedbacks.shift();

      return res.status(200).json({
        success: true,
        ticketId: ticketId,
        message: `Thank you ${entry.userName}! Your feedback and rating for ${entry.appName} have been received and logged for engineering review.`,
        entry: {
          id: entry.id,
          appName: entry.appName,
          userName: entry.userName,
          rating: entry.rating,
          timestamp: entry.timestamp
        }
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: 'Failed to process feedback: ' + err.message
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
