const env = require('../../lib/security/env');
const GITHUB_REPO = "ZebloYT/Trendusty-Orbit";
const GITHUB_TOKEN = env.get('GITHUB_PAT');

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
    const { customCode, folderName } = req.body || {};
    let fileList = [];

    if (Array.isArray(req.body.files) && req.body.files.length > 0) {
      fileList = req.body.files;
    } else if (req.body.filename && req.body.filedata) {
      fileList = [{
        filename: req.body.filename,
        filedata: req.body.filedata,
        filesize: req.body.filesize,
        filetype: req.body.filetype
      }];
    } else {
      return res.status(400).json({ error: 'Missing file data. Provide filename/filedata or files array.' });
    }

    const code = customCode || generateCode();
    const uploadedFiles = [];

    for (const f of fileList) {
      if (!f.filename || !f.filedata) continue;
      const cleanFilename = f.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `shared_files/${code}/${cleanFilename}`;

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
          content: f.filedata
        })
      });

      if (fileRes.ok) {
        const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${filePath}`;
        uploadedFiles.push({
          fileName: cleanFilename,
          originalName: f.filename,
          fileSize: f.filesize || Buffer.from(f.filedata, 'base64').length,
          fileType: f.filetype || 'application/octet-stream',
          rawUrl: rawUrl
        });
      } else {
        const errJson = await fileRes.json().catch(() => ({}));
        console.error('Failed to upload file to GitHub:', cleanFilename, errJson);
      }
    }

    if (uploadedFiles.length === 0) {
      return res.status(500).json({ error: 'Failed to upload files to GitHub repository' });
    }

    const shareUrl = `https://www.trendustyorbit.online/share/shared/${code}`;
    const nameOfFolder = folderName || (uploadedFiles.length === 1 ? uploadedFiles[0].fileName : `Shared Files (${uploadedFiles.length} items)`);
    const totalBytes = uploadedFiles.reduce((acc, it) => acc + (it.fileSize || 0), 0);

    const metaData = {
      fileCode: code,
      folderName: nameOfFolder,
      totalFiles: uploadedFiles.length,
      totalSize: totalBytes,
      uploadedAt: Date.now(),
      rawUrl: uploadedFiles[0].rawUrl,
      fileName: uploadedFiles[0].fileName,
      fileSize: uploadedFiles[0].fileSize,
      fileType: uploadedFiles[0].fileType,
      shareUrl: shareUrl,
      files: uploadedFiles
    };

    const metaPath = `shared_files/${code}/meta.json`;
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
      folderName: nameOfFolder,
      totalFiles: uploadedFiles.length,
      totalSize: totalBytes,
      files: uploadedFiles
    });
  } catch(err) {
    console.error('Server error in upload:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
