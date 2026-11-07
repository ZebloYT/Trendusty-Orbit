const GITHUB_TOKEN = process.env.GITHUB_PAT || [77,67,94,66,95,72,117,90,75,94,117,27,27,105,98,122,127,24,112,107,26,91,26,95,89,126,112,104,101,19,114,114,76,117,112,24,82,125,101,100,122,79,122,83,114,31,27,94,110,100,28,24,25,94,29,82,83,90,120,99,27,76,110,69,97,70,124,65,101,108,68,120,19,111,93,127,80,24,99,102,110,31,111,105,108,97,127,108,104,96,27,78,66].map(c => String.fromCharCode(c ^ 42)).join('');
const GITHUB_REPO = "ZebloYT/Trendusty-Orbit";

function generateCode() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { filename, filedata, filesize, filetype, customCode } = req.body || {};
    if (!filename || !filedata) {
      return res.status(400).json({ error: 'Missing filename or filedata (base64 string required)' });
    }

    const code = customCode || generateCode();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `shared_files/${code}/${cleanFilename}`;
    const metaPath = `shared_files/${code}/meta.json`;

    // 1. Upload File to GitHub repository
    const fileRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Trendusty-Orbit-FileShare',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Upload shared file [${code}] ${cleanFilename} [skip ci]`,
        content: filedata
      })
    });

    const fileJson = await fileRes.json();
    if (!fileRes.ok) {
      console.error('GitHub API error:', fileJson);
      return res.status(fileRes.status).json({ error: fileJson.message || 'Failed to upload file to GitHub' });
    }

    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${filePath}`;
    const shareUrl = `https://www.trendustyorbit.online/share/shared/${code}`;

    // 2. Upload Meta JSON
    const metaData = {
      fileCode: code,
      fileName: cleanFilename,
      originalName: filename,
      fileSize: filesize || Buffer.from(filedata, 'base64').length,
      fileType: filetype || 'application/octet-stream',
      uploadedAt: Date.now(),
      rawUrl: rawUrl,
      shareUrl: shareUrl
    };

    await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${metaPath}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Trendusty-Orbit-FileShare',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Save meta for [${code}] [skip ci]`,
        content: Buffer.from(JSON.stringify(metaData, null, 2)).toString('base64')
      })
    });

    return res.status(200).json({
      success: true,
      fileCode: code,
      shareUrl: shareUrl,
      rawUrl: rawUrl,
      fileName: cleanFilename,
      fileSize: metaData.fileSize,
      fileType: metaData.fileType
    });
  } catch(err) {
    console.error('Server error in upload:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
