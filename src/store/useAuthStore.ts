"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updateProfile,
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
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setAuth: (user: FirebaseUser | null) => void;
}

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
          const email = username.includes('@') ? username : `${username.toLowerCase()}@pitchman.app`;
          const auth = getAuth();
          await signInWithEmailAndPassword(auth, email, password);
          return { success: true };
        } catch (error: any) {
          console.error("Login error:", error);
          let message = "Credenziali non valide.";
          if (error.code === 'auth/user-not-found') message = "Utente non trovato. Prova a inizializzare l'account.";
          return { success: false, error: message };
        }
      },
      signUp: async (username, password) => {
        try {
          const email = `${username.toLowerCase()}@pitchman.app`;
          const auth = getAuth();
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName: username });
          return { success: true };
        } catch (error: any) {
          console.error("SignUp error:", error);
          let message = "Errore durante l'inizializzazione.";
          if (error.code === 'auth/email-already-in-use') message = "L'account esiste già. Usa il login.";
          return { success: false, error: message };
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
      name: 'pitchman-auth-cloud-v3',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }),
    }
  )
);

if (typeof window !== 'undefined') {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setAuth(user);
  });
}
