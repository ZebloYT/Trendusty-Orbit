// Safe Environment & Secrets Resolver
// Loads environment variables from process.env (Vercel) or local .env file securely
const fs = require('fs');
const path = require('path');

let envLoaded = false;

function loadEnv() {
  if (envLoaded) return;
  envLoaded = true;
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)$/);
        if (match) {
          const key = match[1];
          let val = match[2] || '';
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
      });
    }
  } catch (e) {}
}

loadEnv();

module.exports = {
  get: (key, fallback = '') => {
    loadEnv();
    return process.env[key] || fallback;
  },
  loadEnv
};
