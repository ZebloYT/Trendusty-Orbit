#!/usr/bin/env node
// ============================================================================
// TRENDUSTY ORBIT — CLI ACCOUNT & SECURITY VAULT MANAGER
// Command-line tool to inspect, decrypt, manage accounts & ban/report hacker IPs
// Usage:
//   node manage-accounts.js --list
//   node manage-accounts.js --decrypt
//   node manage-accounts.js --ips
//   node manage-accounts.js --ban <ip> [reason]
//   node manage-accounts.js --unban <ip>
//   node manage-accounts.js --report <ip>
//   node manage-accounts.js --export-xml
// ============================================================================

const fs = require('fs');
const path = require('path');
const vault = require('./api/security/vault');
const guardian = require('./api/security/guardian');
const env = require('./api/security/env');

const args = process.argv.slice(2);
const command = args[0] || '--help';

console.log('================================================================================');
console.log('🛡️  TRENDUSTY ORBIT — SECURITY VAULT & ACCOUNT MANAGER (KDBX / AES-256-GCM)');
console.log('================================================================================\n');

try {
  const currentVault = vault.loadAccountsVault();
  const accounts = currentVault.accounts || [];

  if (command === '--list' || command === '-l') {
    console.log(`📂 Vault ID: ${currentVault.vaultId} | Version: ${currentVault.vaultVersion}`);
    console.log(`👥 Total Accounts: ${accounts.length}\n`);

    if (accounts.length === 0) {
      console.log('No accounts stored in vault yet. Accounts will automatically sync when users sign in.');
    } else {
      console.log('ID               | USERNAME       | EMAIL                     | ROLE     | LAST IP         | LAST LOGIN');
      console.log('-----------------|----------------|---------------------------|----------|-----------------|---------------------');
      accounts.forEach(a => {
        const id = (a.id || '').padEnd(16).slice(0, 16);
        const name = (a.username || '').padEnd(14).slice(0, 14);
        const email = (a.email || '').padEnd(25).slice(0, 25);
        const role = (a.role || 'member').padEnd(8).slice(0, 8);
        const ip = (a.lastLoginIP || a.registrationIP || '127.0.0.1').padEnd(15).slice(0, 15);
        const date = (a.lastLoginAt ? a.lastLoginAt.slice(0, 19).replace('T', ' ') : 'N/A');
        console.log(`${id} | ${name} | ${email} | ${role} | ${ip} | ${date}`);
      });
    }

  } else if (command === '--decrypt' || command === '-d') {
    console.log('🔓 DECRYPTED RAW VAULT DATA (.kdbx contents):\n');
    console.log(JSON.stringify(currentVault, null, 2));

  } else if (command === '--ips') {
    console.log('🌐 REGISTERED & ACTIVE CLIENT IP ADDRESSES:\n');
    const ipMap = new Map();

    accounts.forEach(a => {
      const regIp = a.registrationIP || 'Unknown';
      if (!ipMap.has(regIp)) ipMap.set(regIp, { accounts: new Set(), lastSeen: a.createdAt });
      ipMap.get(regIp).accounts.add(a.email);

      (a.ipHistory || []).forEach(h => {
        if (!ipMap.has(h.ip)) ipMap.set(h.ip, { accounts: new Set(), lastSeen: h.timestamp });
        ipMap.get(h.ip).accounts.add(a.email);
      });
    });

    const bannedList = guardian.getBannedIPs();
    const bannedSet = new Set(bannedList.map(b => b.ip));

    console.log('IP ADDRESS       | STATUS    | ASSOCIATED ACCOUNTS                 | LAST SEEN');
    console.log('-----------------|-----------|-------------------------------------|---------------------');
    for (const [ip, info] of ipMap.entries()) {
      const isBanned = bannedSet.has(ip);
      const status = isBanned ? '🚫 BANNED ' : '✅ CLEAN  ';
      const ipPad = ip.padEnd(15).slice(0, 15);
      const accList = Array.from(info.accounts).join(', ').padEnd(35).slice(0, 35);
      const date = info.lastSeen ? info.lastSeen.slice(0, 19).replace('T', ' ') : 'N/A';
      console.log(`${ipPad} | ${status} | ${accList} | ${date}`);
    }

  } else if (command === '--ban') {
    const targetIP = args[1];
    const reason = args.slice(2).join(' ') || 'Banned via CLI Security Manager';
    if (!targetIP) {
      console.error('Error: Provide an IP address to ban. Example: node manage-accounts.js --ban 192.168.1.50');
      process.exit(1);
    }
    const banRecord = guardian.banIP(targetIP, reason);
    console.log(`🚫 Successfully banned IP: ${targetIP}`);
    console.log(`Reason: ${reason}`);
    console.log(`Expires: ${banRecord.expiresAt ? new Date(banRecord.expiresAt).toISOString() : 'Permanent'}`);

  } else if (command === '--unban') {
    const targetIP = args[1];
    if (!targetIP) {
      console.error('Error: Provide an IP address to unban. Example: node manage-accounts.js --unban 192.168.1.50');
      process.exit(1);
    }
    guardian.unbanIP(targetIP);
    console.log(`✅ Successfully unbanned IP: ${targetIP}`);

  } else if (command === '--report') {
    const targetIP = args[1];
    if (!targetIP) {
      console.error('Error: Provide an IP address to generate abuse report for. Example: node manage-accounts.js --report 192.168.1.50');
      process.exit(1);
    }
    const reportText = guardian.generateAbuseReport(targetIP);
    console.log(reportText);

  } else if (command === '--export-xml') {
    const xml = vault.exportKeePassXml(currentVault);
    const outPath = path.resolve(process.cwd(), 'orbit_accounts_keepass.xml');
    fs.writeFileSync(outPath, xml, 'utf8');
    console.log(`💾 Exported KeePass 2 XML database to: ${outPath}`);

  } else {
    console.log('Available Commands:');
    console.log('  node manage-accounts.js --list            List all vaulted accounts & last known IPs');
    console.log('  node manage-accounts.js --decrypt         Decrypt and print raw vault contents (JSON)');
    console.log('  node manage-accounts.js --ips             Display all tracked IP addresses and status');
    console.log('  node manage-accounts.js --ban <ip> [msg]  Ban a hacker IP address');
    console.log('  node manage-accounts.js --unban <ip>      Unban an IP address');
    console.log('  node manage-accounts.js --report <ip>     Generate formal ISP abuse incident report');
    console.log('  node manage-accounts.js --export-xml      Export to standard KeePass 2.x XML file');
  }

} catch (err) {
  console.error('Error executing security vault manager:', err.message);
  process.exit(1);
}
