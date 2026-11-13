// ============================================================================
// TRENDUSTY ORBIT — SECURITY GUARDIAN & IP INTELLIGENCE ENGINE
// Comprehensive Defense:
// 1. Precise Client IP Detection (Proxy/Cloudflare/Vercel compliant)
// 2. IP Rate-Limiting & Anti-Brute-Force
// 3. Malicious Payload Scanner (XSS, SQLi, Path Traversal)
// 4. Manual IP Ban & Abuse Report Generator (Admin controlled)
// 5. Security Audit Logging
// ============================================================================

const fs = require('fs');
const path = require('path');
const env = require('./env');

// In-memory rate limiting cache: { ip: [timestamp, timestamp, ...] }
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_AUTH_REQUESTS_PER_MIN = 12;
const MAX_API_REQUESTS_PER_MIN = 80;

function getBannedIPsFilePath() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join('/tmp', 'banned_ips.json');
  }
  const local = path.resolve(process.cwd(), 'banned_ips.json');
  try {
    fs.accessSync(process.cwd(), fs.constants.W_OK);
    return local;
  } catch (e) {
    return path.join('/tmp', 'banned_ips.json');
  }
}

// Path to persistent banned IPs list
const BANNED_IPS_FILE = getBannedIPsFilePath();

// Security Audit Log buffer (kept in memory & flushed)
const auditLogs = [];
const MAX_AUDIT_LOGS = 200;

// Load banned IPs from disk
function getBannedIPs() {
  try {
    const target = getBannedIPsFilePath();
    if (fs.existsSync(target)) {
      const data = fs.readFileSync(target, 'utf8');
      return JSON.parse(data);
    }
    const local = path.resolve(process.cwd(), 'banned_ips.json');
    if (local !== target && fs.existsSync(local)) {
      const data = fs.readFileSync(local, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {}
  return [];
}

// Save banned IPs to disk
function saveBannedIPs(bannedList) {
  try {
    const target = getBannedIPsFilePath();
    fs.writeFileSync(target, JSON.stringify(bannedList, null, 2), 'utf8');
    return true;
  } catch (e) {
    try {
      fs.writeFileSync(path.join('/tmp', 'banned_ips.json'), JSON.stringify(bannedList, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error('[SecurityGuardian] Failed to write banned_ips.json:', err);
      return false;
    }
  }
}

// 1. Precise Client IP Detection
function getClientIP(req) {
  if (!req) return '127.0.0.1';
  
  // Standard reverse proxy headers in priority order
  const cfConnectingIP = req.headers['cf-connecting-ip'];
  if (cfConnectingIP) return cfConnectingIP.trim();

  const xRealIP = req.headers['x-real-ip'];
  if (xRealIP) return xRealIP.trim();

  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    const list = xForwardedFor.split(',');
    if (list.length > 0 && list[0].trim()) {
      return list[0].trim();
    }
  }

  const vercelForwardedFor = req.headers['x-vercel-forwarded-for'];
  if (vercelForwardedFor) return vercelForwardedFor.split(',')[0].trim();

  return (req.connection && req.connection.remoteAddress) ||
         (req.socket && req.socket.remoteAddress) ||
         '127.0.0.1';
}

// 2. Client Device & Location Metadata
function getClientMeta(req) {
  return {
    ip: getClientIP(req),
    userAgent: req.headers['user-agent'] || 'Unknown Device',
    country: req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || 'Global',
    city: req.headers['x-vercel-ip-city'] || '',
    referer: req.headers['referer'] || req.headers['origin'] || ''
  };
}

// 3. IP Ban Check
function isIPBanned(ip) {
  const banned = getBannedIPs();
  return banned.some(b => b.ip === ip && (!b.expiresAt || b.expiresAt > Date.now()));
}

// 4. Rate Limiting Check
function checkRateLimit(ip, isAuthEndpoint = false) {
  const now = Date.now();
  const maxAllowed = isAuthEndpoint ? MAX_AUTH_REQUESTS_PER_MIN : MAX_API_REQUESTS_PER_MIN;

  let timestamps = rateLimitCache.get(ip) || [];
  timestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  rateLimitCache.set(ip, timestamps);

  if (timestamps.length > maxAllowed) {
    logSecurityEvent('RATE_LIMIT_EXCEEDED', { ip, count: timestamps.length, limit: maxAllowed });
    return false; // Rate limit violated
  }
  return true;
}

// 5. Malicious Request Payload Inspector
function inspectPayload(data) {
  if (!data) return { clean: true };
  const str = typeof data === 'string' ? data : JSON.stringify(data);

  // Signatures for common exploits
  const patterns = [
    { type: 'PATH_TRAVERSAL', regex: /(\.\.[\/\\]|\.\.%2f|\.\.%5c)/i },
    { type: 'XSS_ATTACK', regex: /(<script[\s\S]*?>|javascript:|onload\s*=|onerror\s*=)/i },
    { type: 'SQL_INJECTION', regex: /(UNION\s+ALL\s+SELECT|UNION\s+SELECT|OR\s+['"]?1['"]?\s*=\s*['"]?1|--\s*$|\/\*[\s\S]*?\*\/)/i },
    { type: 'COMMAND_INJECTION', regex: /(;\s*(cat|ls|rm|curl|wget|sh|bash|powershell)|`[^`]+`|\$\([^)]+\))/i }
  ];

  for (const p of patterns) {
    if (p.regex.test(str)) {
      return { clean: false, threat: p.type };
    }
  }
  return { clean: true };
}

// 6. Security Event Logging
function logSecurityEvent(eventType, details = {}) {
  const entry = {
    id: 'sec_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
    epoch: Date.now(),
    eventType,
    ...details
  };

  auditLogs.unshift(entry);
  if (auditLogs.length > MAX_AUDIT_LOGS) auditLogs.pop();
  return entry;
}

function getAuditLogs() {
  return auditLogs;
}

// 7. Manual IP Ban Action (Admin invoked)
function banIP(ip, reason = 'Unauthorized suspicious activity', durationHours = 72) {
  const banned = getBannedIPs();
  const existingIdx = banned.findIndex(b => b.ip === ip);
  const banRecord = {
    ip,
    reason,
    bannedAt: new Date().toISOString(),
    expiresAt: durationHours ? (Date.now() + durationHours * 3600 * 1000) : null
  };

  if (existingIdx >= 0) {
    banned[existingIdx] = banRecord;
  } else {
    banned.push(banRecord);
  }

  saveBannedIPs(banned);
  logSecurityEvent('MANUAL_IP_BANNED', { ip, reason, durationHours });
  return banRecord;
}

// 8. Manual IP Unban Action (Admin invoked)
function unbanIP(ip) {
  let banned = getBannedIPs();
  banned = banned.filter(b => b.ip !== ip);
  saveBannedIPs(banned);
  if (rateLimitCache.has(ip)) rateLimitCache.delete(ip);
  logSecurityEvent('MANUAL_IP_UNBANNED', { ip });
  return true;
}

// Global Unblock All Action
function clearAllBans() {
  saveBannedIPs([]);
  rateLimitCache.clear();
  logSecurityEvent('ALL_IPS_UNBLOCKED', { note: 'Global unblock executed' });
  return true;
}

// 9. Generate Abuse Report Document for an IP
function generateAbuseReport(ip, targetAccount = null) {
  const logsForIP = auditLogs.filter(l => l.ip === ip);
  const now = new Date().toISOString();

  let report = `================================================================================\n`;
  report += `OFFICIAL ABUSE & INCIDENT REPORT — TRENDUSTY ORBIT CYBERSECURITY\n`;
  report += `================================================================================\n`;
  report += `Generated At:       ${now}\n`;
  report += `Target Hacker IP:   ${ip}\n`;
  report += `Affected Service:   Trendusty Orbit COP & EchoNode Cloud\n`;
  report += `Associated Account: ${targetAccount || 'Multiple/Brute-force Target'}\n\n`;

  report += `INCIDENT SUMMARY:\n`;
  report += `The IP address ${ip} was detected conducting unauthorized access attempts, security\n`;
  report += `probe activities, or brute-force requests against the sovereign infrastructure.\n\n`;

  report += `EVIDENCE LOG ENTRIES (Last ${logsForIP.length} events):\n`;
  if (logsForIP.length === 0) {
    report += `  - [${now}] IP recorded in secure vault with suspicious access patterns.\n`;
  } else {
    logsForIP.forEach((l, idx) => {
      report += `  ${idx + 1}. [${l.timestamp}] Event: ${l.eventType} | Details: ${JSON.stringify(l)}\n`;
    });
  }

  report += `\nRECOMMENDED ACTIONS FOR ISP / HOSTING PROVIDER:\n`;
  report += `1. Investigate customer assigned to IP: ${ip}\n`;
  report += `2. Check for compromised machine / botnet / proxy node activity.\n`;
  report += `3. Enforce Abuse / Acceptable Use Policy (AUP) violation measures.\n\n`;
  report += `Reported by: Security Administrator, Trendusty Orbit (https://trendustyorbit.online)\n`;
  report += `================================================================================\n`;

  return report;
}

module.exports = {
  getClientIP,
  getClientMeta,
  isIPBanned,
  checkRateLimit,
  inspectPayload,
  logSecurityEvent,
  getAuditLogs,
  getBannedIPs,
  banIP,
  unbanIP,
  clearAllBans,
  generateAbuseReport
};
