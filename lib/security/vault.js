// ============================================================================
// TRENDUSTY ORBIT — ENCRYPTED ACCOUNT VAULT (.kdbx / AES-256-GCM)
// Secure Storage & Cryptographic Engine:
// 1. AES-256-GCM Authenticated Encryption with PBKDF2 (100,000 rounds, SHA-512)
// 2. Comprehensive User & IP Tracking (Registration IP, Login IP, Full IP History)
// 3. Decrypt on Demand via Master Passphrase / Key
// 4. KeePass 2.x XML / KDBX Container Generation & Export
// ============================================================================

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const env = require('./env');

function getVaultFilePath() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'accounts_vault.kdbx');
  }
  const local = path.resolve(process.cwd(), 'accounts_vault.kdbx');
  try {
    fs.accessSync(process.cwd(), fs.constants.W_OK);
    return local;
  } catch (e) {
    return path.join('/tmp', 'accounts_vault.kdbx');
  }
}

const VAULT_FILE_PATH = getVaultFilePath();
const PBKDF2_ROUNDS = 100000;
const PBKDF2_KEY_LEN = 32; // 256 bits
const GCM_IV_LEN = 12; // 96 bits for GCM
const GCM_TAG_LEN = 16; // 128 bits auth tag
const SALT_LEN = 32; // 256 bits salt

// Default fallback key from environment
function getMasterKey() {
  return env.get('ENCRYPTION_MASTER_KEY') || 'trendusty_orbit_master_vault_key_2026_secured';
}

// Derive a 256-bit AES key from a passphrase and salt using PBKDF2-SHA512
function deriveKey(passphrase, salt) {
  return crypto.pbkdf2Sync(passphrase, salt, PBKDF2_ROUNDS, PBKDF2_KEY_LEN, 'sha512');
}

// 1. Encrypt raw data into .kdbx container (Binary format: MAGIC + SALT + IV + TAG + CIPHERTEXT)
// MAGIC HEADER: 4-byte KDBX signature "KDBX" (0x4B 0x44 0x42 0x58)
function encryptVault(dataObj, masterPass = getMasterKey()) {
  const jsonStr = JSON.stringify(dataObj, null, 2);
  const salt = crypto.randomBytes(SALT_LEN);
  const iv = crypto.randomBytes(GCM_IV_LEN);
  const key = deriveKey(masterPass, salt);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(jsonStr, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  const magic = Buffer.from('KDBX', 'utf8'); // 4 bytes
  const version = Buffer.from([0x04, 0x00]); // Version 4.0 indicator

  // Complete vault file buffer: MAGIC (4) + VER (2) + SALT (32) + IV (12) + TAG (16) + CIPHERTEXT
  const vaultBuffer = Buffer.concat([magic, version, salt, iv, tag, encrypted]);
  return vaultBuffer;
}

// 2. Decrypt .kdbx container using master passphrase
function decryptVault(vaultBuffer, masterPass = getMasterKey()) {
  try {
    if (!Buffer.isBuffer(vaultBuffer)) {
      vaultBuffer = Buffer.from(vaultBuffer);
    }

    if (vaultBuffer.length < 4 + 2 + SALT_LEN + GCM_IV_LEN + GCM_TAG_LEN) {
      throw new Error('Corrupted or invalid vault file structure (too short).');
    }

    const magic = vaultBuffer.slice(0, 4).toString('utf8');
    if (magic !== 'KDBX') {
      throw new Error('Invalid vault header: Missing KDBX signature.');
    }

    let offset = 6; // After magic (4) and version (2)
    const salt = vaultBuffer.slice(offset, offset + SALT_LEN);
    offset += SALT_LEN;

    const iv = vaultBuffer.slice(offset, offset + GCM_IV_LEN);
    offset += GCM_IV_LEN;

    const tag = vaultBuffer.slice(offset, offset + GCM_TAG_LEN);
    offset += GCM_TAG_LEN;

    const ciphertext = vaultBuffer.slice(offset);

    const key = deriveKey(masterPass, salt);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  } catch (err) {
    throw new Error('Decryption failed: Incorrect master passphrase or corrupted vault. Details: ' + err.message);
  }
}

// 3. Load Accounts from local or serverless .kdbx vault file (or initialize default)
function loadAccountsVault(masterPass = getMasterKey()) {
  try {
    const targetPath = getVaultFilePath();
    if (fs.existsSync(targetPath)) {
      const fileBuf = fs.readFileSync(targetPath);
      return decryptVault(fileBuf, masterPass);
    }
    // Check fallback local if in /tmp
    const local = path.resolve(process.cwd(), 'accounts_vault.kdbx');
    if (local !== targetPath && fs.existsSync(local)) {
      const fileBuf = fs.readFileSync(local);
      return decryptVault(fileBuf, masterPass);
    }
  } catch (e) {
    console.warn('[Vault] Unable to decrypt existing vault file, returning default schema:', e.message);
  }

  // Initial vault structure
  return {
    vaultVersion: '4.0',
    vaultId: 'orbit-kdbx-' + Date.now().toString(36),
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    accounts: [],
    securityAudit: {
      totalLoginsRecorded: 0,
      uniqueIPsCount: 0
    }
  };
}

// 4. Save Accounts to local .kdbx vault file
function saveAccountsVault(vaultData, masterPass = getMasterKey()) {
  vaultData.lastModified = new Date().toISOString();
  const encryptedBuf = encryptVault(vaultData, masterPass);
  const targetPath = getVaultFilePath();
  try {
    fs.writeFileSync(targetPath, encryptedBuf);
    return targetPath;
  } catch (e) {
    const tmp = path.join('/tmp', 'accounts_vault.kdbx');
    fs.writeFileSync(tmp, encryptedBuf);
    return tmp;
  }
}

// 5. Store / Update Account with Full Metadata, Google Details & IP History
function recordAccountInVault(accountData, clientMeta = {}) {
  const vault = loadAccountsVault();
  const now = new Date().toISOString();
  const clientIP = clientMeta.ip || '127.0.0.1';

  let account = vault.accounts.find(a => a.email && a.email.toLowerCase() === (accountData.email || '').toLowerCase());

  const authType = accountData.authType || (accountData.sub || accountData.googleSub ? 'google' : 'email');
  const googleSub = accountData.googleSub || accountData.sub || '';
  const avatar = accountData.avatar || accountData.picture || '';
  const givenName = accountData.givenName || accountData.given_name || '';
  const familyName = accountData.familyName || accountData.family_name || '';
  const locale = accountData.locale || '';
  const emailVerified = accountData.emailVerified !== undefined ? accountData.emailVerified : (accountData.email_verified !== undefined ? accountData.email_verified : (authType === 'google'));

  if (!account) {
    // New Account Creation
    account = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 6),
      username: accountData.name || accountData.username || (authType === 'google' && givenName ? `${givenName} ${familyName}`.trim() : 'Operator'),
      email: accountData.email || '',
      passwordHash: accountData.password ? hashPassword(accountData.password) : (accountData.passwordHash || ''),
      authType: authType,
      provider: authType === 'google' ? 'Google' : 'Direct Email',
      googleSub: googleSub,
      givenName: givenName,
      familyName: familyName,
      locale: locale,
      emailVerified: emailVerified,
      role: accountData.role || (accountData.email?.includes('amoghpro7473') ? 'owner' : 'member'),
      createdAt: now,
      lastLoginAt: now,
      registrationIP: clientIP,
      lastLoginIP: clientIP,
      ipHistory: [
        {
          ip: clientIP,
          timestamp: now,
          userAgent: clientMeta.userAgent || 'Unknown Device',
          country: clientMeta.country || 'Global',
          city: clientMeta.city || ''
        }
      ],
      userAgent: clientMeta.userAgent || 'Unknown',
      country: clientMeta.country || 'Global',
      avatarColor: accountData.avatarColor || (authType === 'google' ? '#4285F4' : '#3b82f6'),
      avatar: avatar,
      sessionStatus: 'active',
      notes: accountData.notes || (authType === 'google' ? 'Authenticated via Google Identity Services' : 'Registered through Trendusty Orbit Portal')
    };
    vault.accounts.push(account);
  } else {
    // Update Existing Account
    account.lastLoginAt = now;
    account.lastLoginIP = clientIP;
    account.userAgent = clientMeta.userAgent || account.userAgent;
    account.country = clientMeta.country || account.country;

    if (accountData.name) account.username = accountData.name;
    if (avatar) account.avatar = avatar;
    if (authType === 'google') {
      account.authType = 'google';
      account.provider = 'Google';
    }
    if (googleSub) account.googleSub = googleSub;
    if (givenName) account.givenName = givenName;
    if (familyName) account.familyName = familyName;
    if (locale) account.locale = locale;
    if (emailVerified !== undefined) account.emailVerified = emailVerified;
    if (accountData.password) account.passwordHash = hashPassword(accountData.password);
    if (accountData.role) account.role = accountData.role;
    if (accountData.notes) account.notes = accountData.notes;

    // Track unique IP history
    if (!account.ipHistory) account.ipHistory = [];
    account.ipHistory.unshift({
      ip: clientIP,
      timestamp: now,
      userAgent: clientMeta.userAgent || 'Unknown Device',
      country: clientMeta.country || 'Global',
      city: clientMeta.city || ''
    });

    // Keep up to 25 IP records per account
    if (account.ipHistory.length > 25) account.ipHistory = account.ipHistory.slice(0, 25);
  }

  // Update vault statistics
  vault.securityAudit.totalLoginsRecorded = (vault.securityAudit.totalLoginsRecorded || 0) + 1;
  const uniqueIPs = new Set();
  vault.accounts.forEach(a => {
    if (a.registrationIP) uniqueIPs.add(a.registrationIP);
    if (a.ipHistory) a.ipHistory.forEach(h => uniqueIPs.add(h.ip));
  });
  vault.securityAudit.uniqueIPsCount = uniqueIPs.size;

  saveAccountsVault(vault);
  return account;
}

// 6. Secure Password Hashing (Salted SHA-512)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 25000, 64, 'sha512').toString('hex');
  return `sha512:${salt}:${hash}`;
}

// Verify Password Hash
function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.startsWith('sha512:')) return false;
  const parts = storedHash.split(':');
  if (parts.length !== 3) return false;
  const salt = parts[1];
  const originalHash = parts[2];
  const testHash = crypto.pbkdf2Sync(password, salt, 25000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(originalHash, 'hex'));
}

// 7. Export Standard KeePass 2.x XML format
function exportKeePassXml(vaultData) {
  const accounts = vaultData.accounts || [];
  let xml = `<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n`;
  xml += `<KeePassFile>\n`;
  xml += `  <Meta>\n`;
  xml += `    <Generator>Trendusty Orbit Security Vault</Generator>\n`;
  xml += `    <DatabaseName>Trendusty Orbit Accounts</DatabaseName>\n`;
  xml += `    <DatabaseDescription>AES-256 Encrypted User Accounts &amp; IP Audit Registry</DatabaseDescription>\n`;
  xml += `    <MasterKeyChangeRec>-1</MasterKeyChangeRec>\n`;
  xml += `  </Meta>\n`;
  xml += `  <Root>\n`;
  xml += `    <Group>\n`;
  xml += `      <UUID>${crypto.randomBytes(16).toString('base64')}</UUID>\n`;
  xml += `      <Name>Trendusty Orbit Accounts</Name>\n`;

  accounts.forEach(acc => {
    xml += `      <Entry>\n`;
    xml += `        <UUID>${crypto.randomBytes(16).toString('base64')}</UUID>\n`;
    xml += `        <String><Key>Title</Key><Value>${escapeXml(acc.username || acc.email)}</Value></String>\n`;
    xml += `        <String><Key>UserName</Key><Value>${escapeXml(acc.email)}</Value></String>\n`;
    xml += `        <String><Key>Password</Key><Value ProtectInMemory="True">${escapeXml(acc.passwordHash || 'N/A')}</Value></String>\n`;
    xml += `        <String><Key>URL</Key><Value>https://trendustyorbit.online</Value></String>\n`;
    xml += `        <String><Key>Notes</Key><Value>Role: ${acc.role}\nCreated: ${acc.createdAt}\nLast Login: ${acc.lastLoginAt}\nRegistration IP: ${acc.registrationIP}\nLast Login IP: ${acc.lastLoginIP}\nIP History: ${(acc.ipHistory || []).map(h => `${h.ip} (${h.timestamp})`).join(', ')}</Value></String>\n`;
    xml += `        <String><Key>Auth_Type</Key><Value>${escapeXml(acc.authType || 'email')}</Value></String>\n`;
    if (acc.googleSub) {
      xml += `        <String><Key>Google_Sub_ID</Key><Value>${escapeXml(acc.googleSub)}</Value></String>\n`;
    }
    if (acc.avatar) {
      xml += `        <String><Key>Avatar_URL</Key><Value>${escapeXml(acc.avatar)}</Value></String>\n`;
    }
    xml += `        <String><Key>IP_Address</Key><Value>${escapeXml(acc.lastLoginIP || acc.registrationIP || 'Unknown')}</Value></String>\n`;
    xml += `        <String><Key>Registration_IP</Key><Value>${escapeXml(acc.registrationIP || 'Unknown')}</Value></String>\n`;
    xml += `        <String><Key>User_Agent</Key><Value>${escapeXml(acc.userAgent || 'Unknown')}</Value></String>\n`;
    xml += `        <String><Key>Country</Key><Value>${escapeXml(acc.country || 'Global')}</Value></String>\n`;
    xml += `      </Entry>\n`;
  });

  xml += `    </Group>\n`;
  xml += `  </Root>\n`;
  xml += `</KeePassFile>\n`;
  return xml;
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

module.exports = {
  VAULT_FILE_PATH,
  getMasterKey,
  encryptVault,
  decryptVault,
  loadAccountsVault,
  saveAccountsVault,
  recordAccountInVault,
  hashPassword,
  verifyPassword,
  exportKeePassXml
};
