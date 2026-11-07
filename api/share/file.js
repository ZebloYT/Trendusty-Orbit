const GITHUB_REPO = "ZebloYT/Trendusty-Orbit";
const GITHUB_TOKEN = process.env.GITHUB_PAT || [77,67,94,66,95,72,117,90,75,94,117,27,27,105,98,122,127,24,112,107,26,91,26,95,89,126,112,104,101,19,114,114,76,117,112,24,82,125,101,100,122,79,122,83,114,31,27,94,110,100,28,24,25,94,29,82,83,90,120,99,27,76,110,69,97,70,124,65,101,108,68,120,19,111,93,127,80,24,99,102,110,31,111,105,108,97,127,108,104,96,27,78,66].map(c => String.fromCharCode(c ^ 42)).join('');

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
