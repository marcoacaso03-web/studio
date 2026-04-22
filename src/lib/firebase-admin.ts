import * as admin from 'firebase-admin';

// Flag che indica se l'inizializzazione è avvenuta con credenziali reali
let _initializedWithCredentials = false;

// Inizializzazione Singleton per Firebase Admin
function getAdminApp(): admin.app.App | null {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!rawServiceAccount) {
    console.warn('[Firebase Admin] FIREBASE_SERVICE_ACCOUNT non definita. Admin SDK non disponibile.');
    return null;
  }

  try {
    // Rimuove eventuali apici singoli o doppi che circondano l'intero JSON (comune in alcuni .env)
    const cleanServiceAccount = rawServiceAccount.trim().replace(/^['"]|['"]$/g, '');
    const serviceAccount = JSON.parse(cleanServiceAccount);

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    _initializedWithCredentials = true;
    console.log('[Firebase Admin] Inizializzato con successo per il progetto:', serviceAccount.project_id);
    return app;
  } catch (error) {
    console.error('[Firebase Admin] ERRORE CRITICO durante l\'inizializzazione:', error);
    return null;
  }
}

const adminApp = getAdminApp();

// Esporta auth e db SOLO se l'app è stata inizializzata con credenziali reali.
// Altrimenti esporta null per evitare errori "Could not load the default credentials".
export const adminAuth = adminApp && _initializedWithCredentials ? admin.auth() : null;
export const adminDb = adminApp && _initializedWithCredentials ? admin.firestore() : null;
export const isAdminReady = _initializedWithCredentials;
