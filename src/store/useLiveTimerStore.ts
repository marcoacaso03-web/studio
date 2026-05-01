"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LiveTimerState {
  matchId: string | null;
  isRunning: boolean;
  baseTime: number; // In milliseconds
  startTime: number | null; // Date.now() when last started
  period: '1T' | '2T' | '1TS' | '2TS';
  isTrackerOpen: boolean;
  
  startTimer: (matchId: string) => void;
  pauseTimer: () => void;
  resetTimer: (matchId: string) => void;
  setPeriod: (period: '1T' | '2T' | '1TS' | '2TS') => void;
  setMatchId: (matchId: string | null) => void;
  setIsTrackerOpen: (isOpen: boolean) => void;
  clearSession: () => void;
  
  // Helper to get current elapsed time in milliseconds
  getElapsedTime: () => number;
}

export const useLiveTimerStore = create<LiveTimerState>()(
  persist(
    (set, get) => ({
      matchId: null,
      isRunning: false,
      baseTime: 0,
      startTime: null,
      period: '1T',
      isTrackerOpen: false,

      startTimer: (matchId: string) => {
        const state = get();
        // If it's a different match, reset first
        if (state.matchId !== matchId) {
          set({
            matchId,
            isRunning: true,
            baseTime: 0,
            startTime: Date.now(),
            period: '1T'
          });
        } else if (!state.isRunning) {
          set({
            isRunning: true,
            startTime: Date.now()
          });
        }
      },

      pauseTimer: () => {
        const state = get();
        if (state.isRunning && state.startTime) {
          const sessionDuration = Date.now() - state.startTime;
          set({
            isRunning: false,
            baseTime: state.baseTime + sessionDuration,
            startTime: null
          });
        }
      },

      resetTimer: (matchId: string) => {
        set({
          matchId,
          isRunning: false,
          baseTime: 0,
          startTime: null,
        });
      },

      setPeriod: (period) => set({ period }),
      
      setMatchId: (matchId) => set({ matchId }),

      setIsTrackerOpen: (isOpen) => set({ isTrackerOpen: isOpen }),
      
      clearSession: () => set({
        matchId: null,
        isRunning: false,
        baseTime: 0,
        startTime: null,
        period: '1T',
        isTrackerOpen: false
      }),

      getElapsedTime: () => {
        const state = get();
        if (!state.isRunning || !state.startTime) {
          return state.baseTime;
        }
        return state.baseTime + (Date.now() - state.startTime);
      }
    }),
    {
      name: 'pitchman-live-timer',
    }
  )
);
