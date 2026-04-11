"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { exerciseRepository } from '@/lib/repositories/exercise-repository';
import type { Exercise } from '@/lib/types';
import { useAuthStore } from './useAuthStore';
import { getErrorMessage } from '@/lib/error-utils';

interface ExerciseState {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  addExercise: (exercise: Omit<Exercise, 'id' | 'userId' | 'ownerName' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      exercises: [],
      loading: false,
      error: null,

      fetchAll: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        if (get().exercises.length === 0) set({ loading: true, error: null });
        try {
          const exercises = await exerciseRepository.getAll(user.id);
          set({ 
            exercises: exercises.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), 
            loading: false,
            error: null
          });
        } catch (e) {
          console.error("Fetch all exercises error:", e);
          set({ loading: false, error: getErrorMessage(e) });
        }
      },

      addExercise: async (exercise) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ loading: true, error: null });
        try {
          const newEx = await exerciseRepository.create(user.id, user.username || 'Coach', exercise);
          set(state => ({ 
            exercises: [newEx, ...state.exercises],
            loading: false,
            error: null
          }));
        } catch (e) {
          console.error("Add exercise error:", e);
          set({ loading: false, error: getErrorMessage(e) });
        }
      },

      updateExercise: async (id, updates) => {
        set({ loading: true, error: null });
        try {
          await exerciseRepository.update(id, updates);
          set(state => ({
            exercises: state.exercises.map(ex => ex.id === id ? { ...ex, ...updates, updatedAt: new Date().toISOString() } : ex),
            loading: false,
            error: null
          }));
        } catch (e) {
          console.error("Update exercise error:", e);
          set({ loading: false, error: getErrorMessage(e) });
        }
      },

      deleteExercise: async (id) => {
        set({ loading: true, error: null });
        try {
          await exerciseRepository.delete(id);
          set(state => ({
            exercises: state.exercises.filter(ex => ex.id !== id),
            loading: false,
            error: null
          }));
        } catch (e) {
          console.error("Delete exercise error:", e);
          set({ loading: false, error: getErrorMessage(e) });
        }
      }
    }),
    {
      name: 'pitchman-exercises',
    }
  )
);
