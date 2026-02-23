
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User as FirebaseUser 
} from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isInitialized: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setAuth: (user: FirebaseUser | null) => void;
}

// Inizializza Firebase prima di usare Auth
if (typeof window !== 'undefined') {
  initializeFirebase();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      isInitialized: false,
      login: async (username, password) => {
        try {
          // Firebase richiede un'email. Trasformiamo lo username in una pseudo-email
          // per mantenere l'esperienza utente richiesta.
          const email = username.includes('@') ? username : `${username.toLowerCase()}@pitchman.app`;
          const auth = getAuth();
          await signInWithEmailAndPassword(auth, email, password);
          return true;
        } catch (error) {
          console.error("Login error:", error);
          return false;
        }
      },
      logout: async () => {
        try {
          const auth = getAuth();
          await signOut(auth);
          set({ isAuthenticated: false, user: null });
        } catch (error) {
          console.error("Logout error:", error);
        }
      },
      setAuth: (firebaseUser) => {
        if (firebaseUser) {
          const username = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utente';
          set({ 
            isAuthenticated: true, 
            isInitialized: true,
            user: { 
              id: firebaseUser.uid, 
              username,
              email: firebaseUser.email || ''
            } 
          });
        } else {
          set({ isAuthenticated: false, isInitialized: true, user: null });
        }
      }
    }),
    {
      name: 'pitchman-auth-cloud-v2',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }),
    }
  )
);

// Listener globale per lo stato di autenticazione
if (typeof window !== 'undefined') {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setAuth(user);
  });
}
