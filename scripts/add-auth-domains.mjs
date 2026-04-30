import crypto from 'crypto';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env.local to get service account
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Extract FIREBASE_SERVICE_ACCOUNT
const match = envContent.match(/FIREBASE_SERVICE_ACCOUNT='(.+)'/s);
if (!match) {
  console.error('Could not find FIREBASE_SERVICE_ACCOUNT in .env.local');
  process.exit(1);
}

const serviceAccount = JSON.parse(match[1]);
const projectId = serviceAccount.project_id;

console.log(`Project ID: ${projectId}`);

// Create JWT for service account authentication
function createJWT(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsigned = `${b64(header)}.${b64(payload)}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsigned);
  const signature = sign.sign(sa.private_key, 'base64url');

  return `${unsigned}.${signature}`;
}

// HTTP request helper
function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Step 1: Get access token
console.log('Getting access token...');
const jwt = createJWT(serviceAccount);
const tokenBody = new URLSearchParams({
  grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
  assertion: jwt,
}).toString();

const tokenRes = await request(
  {
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  },
  tokenBody
);

if (!tokenRes.data.access_token) {
  console.error('Failed to get access token:', tokenRes.data);
  process.exit(1);
}

const accessToken = tokenRes.data.access_token;
console.log('Access token obtained.');

// Step 2: Get current config
console.log('Getting current Identity Toolkit config...');
const getRes = await request({
  hostname: 'identitytoolkit.googleapis.com',
  path: `/admin/v2/projects/${projectId}/config`,
  method: 'GET',
  headers: { Authorization: `Bearer ${accessToken}` },
});

if (getRes.status !== 200) {
  console.error('Failed to get config:', getRes.status, getRes.data);
  process.exit(1);
}

const currentDomains = getRes.data.authorizedDomains || [];
console.log('Current authorized domains:', currentDomains);

// Step 3: Add missing domains
const domainsToAdd = ['localhost', 'pitchman.vercel.app'];
const updatedDomains = [...new Set([...currentDomains, ...domainsToAdd])];

console.log('Updated domains list:', updatedDomains);

const patchBody = JSON.stringify({ authorizedDomains: updatedDomains });
const patchRes = await request(
  {
    hostname: 'identitytoolkit.googleapis.com',
    path: `/admin/v2/projects/${projectId}/config?updateMask=authorizedDomains`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  },
  patchBody
);

if (patchRes.status === 200) {
  console.log('✅ Authorized domains updated successfully!');
  console.log('Final domains:', patchRes.data.authorizedDomains);
} else {
  console.error('Failed to update domains:', patchRes.status, patchRes.data);
}
