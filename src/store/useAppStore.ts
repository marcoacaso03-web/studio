
import { create } from 'zustand';

interface AppState {
  hasInitialized: boolean;
  setHasInitialized: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  hasInitialized: false,
  setHasInitialized: (value: boolean) => set({ hasInitialized: value }),
}));
