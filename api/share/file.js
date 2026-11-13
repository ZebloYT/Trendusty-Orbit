const env = require('../../lib/security/env');
const GITHUB_REPO = "ZebloYT/Trendusty-Orbit";
const GITHUB_TOKEN = env.get('GITHUB_PAT');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { code } = req.query || {};
  if (!code) {
    return res.status(400).json({ error: 'Missing file code parameter' });
  }

  try {
    // 1. Try reading meta.json directly from raw GitHub
    const rawMetaUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/shared_files/${code}/meta.json?t=${Date.now()}`;
    const rawRes = await fetch(rawMetaUrl);

    if (rawRes.ok) {
      const meta = await rawRes.json();
      if (!meta.files) {
        meta.files = [{
          fileName: meta.fileName,
          originalName: meta.originalName || meta.fileName,
          fileSize: meta.fileSize,
          fileType: meta.fileType || 'application/octet-stream',
          rawUrl: meta.rawUrl
        }];
      }
      return res.status(200).json({ success: true, ...meta });
    }

    // 2. Fallback to GitHub contents API if raw cache hasn't invalidated
    const apiRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/shared_files/${code}`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Trendusty-Orbit-FileShare'
      }
    });

    if (!apiRes.ok) {
      return res.status(404).json({ error: 'Shared files not found or expired' });
    }

    const items = await apiRes.json();
    if (!Array.isArray(items)) {
      return res.status(404).json({ error: 'Invalid shared directory' });
    }

    const validFiles = items.filter(i => i.name !== 'meta.json');
    if (validFiles.length === 0) {
      return res.status(404).json({ error: 'File data not found in share directory' });
    }

    const files = validFiles.map(i => ({
      fileName: i.name,
      fileSize: i.size,
      rawUrl: i.download_url,
      fileType: 'application/octet-stream'
    }));

    return res.status(200).json({
      success: true,
      fileCode: code,
      folderName: `Shared Folder (${files.length} items)`,
      totalFiles: files.length,
      totalSize: files.reduce((acc, f) => acc + (f.fileSize || 0), 0),
      rawUrl: files[0].rawUrl,
      fileName: files[0].fileName,
      fileSize: files[0].fileSize,
      fileType: files[0].fileType,
      files: files,
      shareUrl: `https://www.trendustyorbit.online/share/shared/${code}`
    });
  } catch(err) {
    console.error('Error fetching file info:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
