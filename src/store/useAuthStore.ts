
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const VALID_USERS = [
  { id: 'admin', username: 'admin', password: 'admin' },
  { id: 'loiacono', username: 'loiacono', password: 'loiacono' }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (username, password) => {
        const foundUser = VALID_USERS.find(u => u.username === username && u.password === password);
        if (foundUser) {
          set({ 
            isAuthenticated: true, 
            user: { id: foundUser.id, username: foundUser.username } 
          });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'pitchman-auth',
    }
  )
);
