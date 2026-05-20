import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { AccountRole } from '@/lib/types';

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

    // Solo un developer può impostare i ruoli
    if (decodedToken.role !== 'developer') {
      return NextResponse.json({ error: 'Forbidden. Solo i developer possono modificare i ruoli.' }, { status: 403 });
    }

    const body = await request.json();
    const targetUid = body.uid;
    const newRole = body.role as AccountRole;

    if (!targetUid || !newRole) {
      return NextResponse.json({ error: 'Missing uid or role' }, { status: 400 });
    }

    // 1. Aggiorna Custom Claim
    // Recupera i claim esistenti per non sovrascrivere altri claim eventuali
    const userRecord = await adminAuth.getUser(targetUid);
    const currentClaims = userRecord.customClaims || {};
    await adminAuth.setCustomUserClaims(targetUid, { ...currentClaims, role: newRole });

    // 2. Aggiorna Firestore
    const userDocRef = adminDb.collection('users').doc(targetUid);
    const userDoc = await userDocRef.get();
    if (userDoc.exists) {
      await userDocRef.update({ role: newRole, updatedAt: new Date().toISOString() });
    }

    return NextResponse.json({ success: true, message: `Ruolo aggiornato a ${newRole} per l'utente ${targetUid}` });
  } catch (error) {
    console.error('[set-role] Error setting role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
