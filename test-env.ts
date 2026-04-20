import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
    console.log('No FIREBASE_SERVICE_ACCOUNT');
    process.exit(1);
}

console.log('RAW starts with:', raw.substring(0, 10));

const clean = raw.trim().replace(/^['"]|['"]$/g, '');
console.log('CLEAN starts with:', clean.substring(0, 10));

try {
    const parsed = JSON.parse(clean);
    console.log('SUCCESS! Project:', parsed.project_id);
} catch (e: any) {
    console.error('PARSE ERROR:', e.message);
}
