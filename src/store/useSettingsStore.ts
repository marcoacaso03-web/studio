
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  defaultDuration: number;
  sessionsPerWeek: number;
  setDefaultDuration: (duration: number) => void;
  setSessionsPerWeek: (count: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultDuration: 90,
      sessionsPerWeek: 3,
      setDefaultDuration: (duration) => set({ defaultDuration: duration }),
      setSessionsPerWeek: (count) => set({ sessionsPerWeek: count }),
    }),
    {
      name: 'pitchman-settings',
    }
  )
);
