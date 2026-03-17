
"use client";

import { create } from 'zustand';
import { trainingRepository } from '@/lib/repositories/training-repository';
import type { TrainingSession, TrainingAttendance, TrainingStatus } from '@/lib/types';
import { useAuthStore } from './useAuthStore';
import { useSeasonsStore } from './useSeasonsStore';

interface TrainingState {
  sessions: TrainingSession[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  generateSessions: (startDate: Date, endDate: Date, sessionsPerWeek: number) => Promise<void>;
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
    let current = new Date(startDate);
    let sessionCount = get().sessions.length;

    // Distribuiamo le sessioni nei giorni lavorativi (Lun-Ven)
    const availableDays = [1, 2, 3, 4, 5]; // Lun-Ven
    
    while (current <= endDate) {
      const weekEnd = new Date(current);
      weekEnd.setDate(current.getDate() + 6);
      
      for (let i = 0; i < sessionsPerWeek; i++) {
        const sessionDate = new Date(current);
        // Distribuzione semplice: se vogliamo 3 sessioni, le mettiamo Lun, Mer, Ven
        const dayOffset = Math.floor(i * (5 / sessionsPerWeek));
        sessionDate.setDate(current.getDate() + dayOffset);
        
        if (sessionDate > endDate) break;

        sessionCount++;
        newSessions.push({
          userId: user.id,
          seasonId,
          date: sessionDate.toISOString(),
          index: sessionCount,
          notes: ""
        });
      }
      current.setDate(current.getDate() + 7);
    }

    await trainingRepository.bulkAdd(newSessions, user.id);
    await get().fetchAll();
  }
}));
