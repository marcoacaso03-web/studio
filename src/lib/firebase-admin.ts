import * as admin from 'firebase-admin';

// Inizializzazione Singleton per Firebase Admin
function getAdminApp() {
  if (admin.apps.length > 0) return admin.apps[0];

  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
    } 
    
    // Fallback: Tentativo di inizializzazione con variabili pubbliche (potrebbe non bastare per Admin)
    return admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
  } catch (error) {
    console.error('CRITICAL: Firebase Admin initialization failed.', error);
    return null;
  }
}

getAdminApp();

export const adminAuth = admin.apps.length ? admin.auth() : null as unknown as admin.auth.Auth;
export const adminDb = admin.apps.length ? admin.firestore() : null as unknown as admin.firestore.Firestore;
