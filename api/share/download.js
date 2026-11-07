const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { code, file } = req.query || {};
  if (!code || !file) {
    return res.status(400).send('Missing file code or filename parameter');
  }

  const cleanFile = file.replace(/[^a-zA-Z0-9._-]/g, '_');
  const cdnUrl = `https://cdn.jsdelivr.net/gh/ZebloYT/Trendusty-Orbit@main/shared_files/${code}/${cleanFile}`;
  const rawUrl = `https://raw.githubusercontent.com/ZebloYT/Trendusty-Orbit/main/shared_files/${code}/${cleanFile}`;

  function streamFrom(targetUrl, fallbackUrl) {
    https.get(targetUrl, (upstream) => {
      // If CDN returns 404/error, fallback to raw GitHub
      if (upstream.statusCode !== 200 && fallbackUrl) {
        return streamFrom(fallbackUrl, null);
      }
      if (upstream.statusCode !== 200) {
        return res.status(upstream.statusCode).send('File not found in storage');
      }

      const headers = {
        'Content-Disposition': `attachment; filename="${cleanFile}"`,
        'Content-Type': upstream.headers['content-type'] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable'
      };

      if (upstream.headers['content-length']) {
        headers['Content-Length'] = upstream.headers['content-length'];
      }

      res.writeHead(200, headers);
      upstream.pipe(res);
    }).on('error', (err) => {
      if (fallbackUrl) return streamFrom(fallbackUrl, null);
      res.status(500).send('Download stream failed: ' + err.message);
    });
  }

  streamFrom(cdnUrl, rawUrl);
};
