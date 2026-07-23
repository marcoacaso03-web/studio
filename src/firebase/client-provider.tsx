'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    // Wrapped in try/catch so that static prerendering at build time
    // (where NEXT_PUBLIC_FIREBASE_* env vars may be missing/invalid) does
    // not crash with `auth/invalid-api-key`. When init fails we provide
    // null services; FirebaseProvider already handles this via
    // `areServicesAvailable` and the real client re-initializes at runtime.
    try {
      return initializeFirebase();
    } catch (err) {
      if (typeof window !== 'undefined') {
        // Only surface the error in the browser; during SSR/prerender we
        // intentionally degrade to null services.
        console.error('[Firebase] Initialization failed:', err);
      }
      return { firebaseApp: null, auth: null, firestore: null };
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
