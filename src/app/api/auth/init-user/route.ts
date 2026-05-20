import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { UserProfile, AccountRole } from '@/lib/types';

export async function POST(request: Request) {
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: 'Firebase Admin not configured' }, { status: 500 });
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email || '';

    // Controlliamo se ha già un ruolo impostato nei claims
    let role = decodedToken.role as AccountRole | undefined;

    if (!role) {
      // Impostazione del ruolo di default
      role = 'coach';
      await adminAuth.setCustomUserClaims(uid, { ...decodedToken, role });
    }

    // Controlliamo se esiste il profilo Firestore
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      // Creiamo il profilo Firestore
      const newUserProfile: UserProfile = {
        uid,
        email,
        displayName: decodedToken.name || '',
        role: role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await userDocRef.set(newUserProfile);
    } else {
      // Assicuriamoci che il campo role sia allineato
      await userDocRef.update({ role, updatedAt: new Date().toISOString() });
    }

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('[init-user] Error initializing user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
