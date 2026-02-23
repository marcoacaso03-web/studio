
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  defaultDuration: number;
  setDefaultDuration: (duration: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultDuration: 90,
      setDefaultDuration: (duration) => set({ defaultDuration: duration }),
    }),
    {
      name: 'pitchman-settings',
    }
  )
);
