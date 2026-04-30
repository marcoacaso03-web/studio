"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { settingsRepository, UserSettings } from '@/lib/repositories/settings-repository';

const DEFAULT_SETTINGS: UserSettings = {
  defaultDuration: 90,
  sessionsPerWeek: 3,
  trainingDays: [1, 3, 5],
  autoSetPresenceOnGenerate: false,
  teamName: '',
  matchNotificationEnabled: false,
  matchNotificationTime: '20:00',
  trainingNotificationEnabled: false,
  trainingNotificationTime: '20:00',
};

interface SettingsState extends UserSettings {
  setDefaultDuration: (duration: number) => void;
  setSessionsPerWeek: (count: number) => void;
  setTrainingDays: (days: number[]) => void;
  setAutoSetPresenceOnGenerate: (val: boolean) => void;
  setTeamName: (name: string) => void;
  setMatchNotificationEnabled: (val: boolean) => void;
  setMatchNotificationTime: (time: string) => void;
  setTrainingNotificationEnabled: (val: boolean) => void;
  setTrainingNotificationTime: (time: string) => void;
  fetchSettings: (userId: string) => Promise<void>;
  saveSettings: (userId: string, settings: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      setDefaultDuration: (duration) => set({ defaultDuration: duration }),
      setSessionsPerWeek: (count) => set({ sessionsPerWeek: count }),
      setTrainingDays: (days) => set({ trainingDays: days }),
      setAutoSetPresenceOnGenerate: (val) => set({ autoSetPresenceOnGenerate: val }),
      setTeamName: (name) => set({ teamName: name }),
      setMatchNotificationEnabled: (val) => set({ matchNotificationEnabled: val }),
      setMatchNotificationTime: (time) => set({ matchNotificationTime: time }),
      setTrainingNotificationEnabled: (val) => set({ trainingNotificationEnabled: val }),
      setTrainingNotificationTime: (time) => set({ trainingNotificationTime: time }),
      resetSettings: () => set({ ...DEFAULT_SETTINGS }),
      fetchSettings: async (userId: string) => {
        if (!userId) return;
        try {
          const settings = await settingsRepository.getSettings(userId);
          if (settings) {
            set({ ...settings });
          } else {
            // New user with no saved settings — reset to defaults
            // to avoid leaking previous user's data from localStorage
            set({ ...DEFAULT_SETTINGS });
          }
        } catch (error) {
          console.error("Error fetching settings:", error);
        }
      },
      saveSettings: async (userId: string, newSettings: Partial<UserSettings>) => {
        if (!userId) return;
        try {
          set({ ...newSettings });
          const currentSettings = get();
          await settingsRepository.saveSettings(userId, {
            defaultDuration: currentSettings.defaultDuration,
            sessionsPerWeek: currentSettings.sessionsPerWeek,
            trainingDays: currentSettings.trainingDays,
            autoSetPresenceOnGenerate: currentSettings.autoSetPresenceOnGenerate,
            teamName: currentSettings.teamName,
            matchNotificationEnabled: currentSettings.matchNotificationEnabled,
            matchNotificationTime: currentSettings.matchNotificationTime,
            trainingNotificationEnabled: currentSettings.trainingNotificationEnabled,
            trainingNotificationTime: currentSettings.trainingNotificationTime,
          });
        } catch (error) {
          console.error("Error saving settings:", error);
        }
      }
    }),
    {
      name: 'pitchman-settings',
    }
  )
);
