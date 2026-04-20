import * as admin from 'firebase-admin';

// Inizializzazione Singleton per Firebase Admin
function getAdminApp() {
  if (admin.apps.length > 0) return admin.apps[0];

  try {
    const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (rawServiceAccount) {
      // Rimuove eventuali apici singoli o doppi che circondano l'intero JSON (comune in alcuni .env)
      const cleanServiceAccount = rawServiceAccount.trim().replace(/^['"]|['"]$/g, '');
      
      try {
        const serviceAccount = JSON.parse(cleanServiceAccount);
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
      } catch (parseError) {
        console.error('ERROR: FIREBASE_SERVICE_ACCOUNT is not a valid JSON. Falling back to default project init...', parseError);
      }
    } else {
      console.warn('WARNING: FIREBASE_SERVICE_ACCOUNT is not defined. Attempting default project init...');
    }
    
    // Fallback: Tentativo di inizializzazione con variabili pubbliche
    // NOTA: Se arriviamo qui senza credenziali, le operazioni privilegiate (come verifyIdToken o Firestore write)
    // probabilmente falliranno con "Could not load the default credentials".
    return admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
  } catch (error) {
    console.error('CRITICAL: Firebase Admin initialization failed entirely.', error);
    return null;
  }
}

getAdminApp();

export const adminAuth = admin.apps.length ? admin.auth() : null as unknown as admin.auth.Auth;
export const adminDb = admin.apps.length ? admin.firestore() : null as unknown as admin.firestore.Firestore;
