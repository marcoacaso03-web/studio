
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  defaultDuration: number;
  sessionsPerWeek: number;
  trainingDays: number[];
  autoSetPresenceOnGenerate: boolean;
  setDefaultDuration: (duration: number) => void;
  setSessionsPerWeek: (count: number) => void;
  setTrainingDays: (days: number[]) => void;
  setAutoSetPresenceOnGenerate: (val: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      defaultDuration: 90,
      sessionsPerWeek: 3,
      trainingDays: [1, 3, 5],
      autoSetPresenceOnGenerate: false,
      setDefaultDuration: (duration) => set({ defaultDuration: duration }),
      setSessionsPerWeek: (count) => set({ sessionsPerWeek: count }),
      setTrainingDays: (days) => set({ trainingDays: days }),
      setAutoSetPresenceOnGenerate: (val) => set({ autoSetPresenceOnGenerate: val }),
    }),
    {
      name: 'pitchman-settings',
    }
  )
);
