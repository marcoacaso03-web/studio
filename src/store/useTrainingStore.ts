
"use client";

import { create } from 'zustand';
import { trainingRepository } from '@/lib/repositories/training-repository';
import type { TrainingSession, TrainingAttendance, TrainingStatus } from '@/lib/types';
import { useAuthStore } from './useAuthStore';
import { useSeasonsStore } from './useSeasonsStore';
import { startOfWeek, addDays, isBefore, isSameDay, endOfWeek } from 'date-fns';

interface TrainingState {
  sessions: TrainingSession[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  generateSessions: (startDate: Date, endDate: Date, sessionsPerWeek: number) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  deleteSessions: (ids: string[]) => Promise<void>;
  clearAllSessions: () => Promise<void>;
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
  sessions: [],
  loading: false,

  fetchAll: async () => {
    const user = useAuthStore.getState().user;
    const seasonId = useSeasonsStore.getState().activeSeason?.id;
    if (!user || !seasonId) return;

    set({ loading: true });
    try {
      const sessions = await trainingRepository.getAll(user.id, seasonId);
      set({ sessions: sessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  },

  generateSessions: async (startDate, endDate, sessionsPerWeek) => {
    const user = useAuthStore.getState().user;
    const seasonId = useSeasonsStore.getState().activeSeason?.id;
    if (!user || !seasonId) return;

    set({ loading: true });
    const newSessions: Omit<TrainingSession, 'id'>[] = [];
    
    // Identifichiamo il lunedì della settimana di inizio
    let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 1 });
    let sessionCount = get().sessions.length;

    // Definiamo i giorni preferenziali per 1, 2, 3, 4 o 5 sessioni
    const dayOffsetsMap: Record<number, number[]> = {
      1: [2], // Mercoledì
      2: [1, 3], // Martedì, Giovedì
      3: [0, 2, 4], // Lunedì, Mercoledì, Venerdì
      4: [0, 1, 3, 4], // Lun, Mar, Gio, Ven
      5: [0, 1, 2, 3, 4] // Lun-Ven
    };

    const offsets = dayOffsetsMap[sessionsPerWeek] || dayOffsetsMap[3];

    while (currentWeekStart <= endDate) {
      for (const offset of offsets) {
        const sessionDate = addDays(currentWeekStart, offset);
        
        sessionCount++;
        newSessions.push({
          userId: user.id,
          seasonId,
          date: sessionDate.toISOString(),
          index: sessionCount,
          notes: ""
        });
      }
      currentWeekStart = addDays(currentWeekStart, 7);
    }

    try {
      await trainingRepository.bulkAdd(newSessions, user.id);
      await get().fetchAll();
    } catch (e) {
      console.error("Errore generazione:", e);
    } finally {
      set({ loading: false });
    }
  },

  deleteSession: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      await trainingRepository.delete(user.id, id);
      set(state => ({ sessions: state.sessions.filter(s => s.id !== id) }));
    } catch (e) {
      console.error(e);
    }
  },

  deleteSessions: async (ids) => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    try {
      await trainingRepository.deleteMany(user.id, ids);
      set(state => ({ sessions: state.sessions.filter(s => !ids.includes(s.id)) }));
    } catch (e) {
      console.error(e);
    }
  },

  clearAllSessions: async () => {
    const user = useAuthStore.getState().user;
    const seasonId = useSeasonsStore.getState().activeSeason?.id;
    if (!user || !seasonId) return;
    
    set({ loading: true });
    try {
      const ids = get().sessions.map(s => s.id);
      await trainingRepository.deleteMany(user.id, ids);
      set({ sessions: [], loading: false });
    } catch (e) {
      console.error(e);
      set({ loading: false });
    }
  }
}));
