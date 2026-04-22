
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const envPath = path.join(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));
const rawServiceAccount = envConfig['FIREBASE_SERVICE_ACCOUNT'];

if (rawServiceAccount) {
  const cleanServiceAccount = rawServiceAccount.trim().replace(/^['"]|['"]$/g, '');
  try {
    const serviceAccount = JSON.parse(cleanServiceAccount);
    console.log('JSON Parse successful');
    console.log('Project ID:', serviceAccount.project_id);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized successfully');
  } catch (e: any) {
    console.error('Error:', e.message);
  }
} else {
  console.log('FIREBASE_SERVICE_ACCOUNT not found');
}
