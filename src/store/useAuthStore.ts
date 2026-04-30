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
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
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
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
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
      login: async (usernameOrEmail, password) => {
        try {
          const email = usernameOrEmail.includes('@') ? usernameOrEmail : `${usernameOrEmail.toLowerCase()}@pitchman.app`;
          const auth = getAuth();
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          if (!userCredential.user.emailVerified && !email.endsWith('@pitchman.app')) {
            await signOut(auth);
            return { success: false, error: "Per favore, conferma la tua email prima di effettuare l'accesso." };
          }
          
          return { success: true };
        } catch (error: any) {
          console.error("Login error:", error);
          let message = "Credenziali non valide.";
          if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
             message = "Utente non trovato o password errata.";
          }
          return { success: false, error: message };
        }
      },
      signUp: async (email, password, username) => {
        try {
          const finalEmail = email.includes('@') ? email : `${email.toLowerCase()}@pitchman.app`;
          const auth = getAuth();
          const userCredential = await createUserWithEmailAndPassword(auth, finalEmail, password);
          if (username) {
            await updateProfile(userCredential.user, { displayName: username });
          }
          await sendEmailVerification(userCredential.user);
          await signOut(auth);
          return { success: true };
        } catch (error: any) {
          console.error("SignUp error:", error);
          let message = "Errore durante la registrazione.";
          if (error.code === 'auth/email-already-in-use') message = "Email o nome utente già registrato. Ti consigliamo di usare il Login.";
          if (error.code === 'auth/weak-password') message = "La password è troppo debole.";
          return { success: false, error: message };
        }
      },
      loginWithGoogle: async () => {
        try {
          const auth = getAuth();
          const provider = new GoogleAuthProvider();
          // Adding custom parameters can help with some popup issues
          provider.setCustomParameters({ prompt: 'select_account' });
          
          const result = await signInWithPopup(auth, provider);
          
          // Force immediate state update to prevent race conditions during navigation
          useAuthStore.getState().setAuth(result.user);
          
          return { success: true };
        } catch (error: any) {
          console.error("Google Login error:", error);
          let message = "Errore durante l'accesso con Google.";
          if (error.code === 'auth/popup-closed-by-user') message = "Finestra di accesso chiusa prima del completamento.";
          if (error.code === 'auth/popup-blocked') message = "Popup bloccato dal browser. Abilita i popup per questo sito.";
          if (error.code === 'auth/unauthorized-domain') message = "Dominio non autorizzato. Verifica la configurazione Firebase.";
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
