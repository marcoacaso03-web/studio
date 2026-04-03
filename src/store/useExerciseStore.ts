"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { exerciseRepository } from '@/lib/repositories/exercise-repository';
import type { Exercise } from '@/lib/types';
import { useAuthStore } from './useAuthStore';

interface ExerciseState {
  exercises: Exercise[];
  loading: boolean;
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

      fetchAll: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        if (get().exercises.length === 0) set({ loading: true });
        try {
          const exercises = await exerciseRepository.getAll(user.id);
          set({ 
            exercises: exercises.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), 
            loading: false 
          });
        } catch (e) {
          console.error("Fetch all exercises error:", e);
          set({ loading: false });
        }
      },

      addExercise: async (exercise) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ loading: true });
        try {
          const newEx = await exerciseRepository.create(user.id, user.username || 'Coach', exercise);
          set(state => ({ 
            exercises: [newEx, ...state.exercises],
            loading: false 
          }));
        } catch (e) {
          console.error("Add exercise error:", e);
          set({ loading: false });
        }
      },

      updateExercise: async (id, updates) => {
        set({ loading: true });
        try {
          await exerciseRepository.update(id, updates);
          set(state => ({
            exercises: state.exercises.map(ex => ex.id === id ? { ...ex, ...updates, updatedAt: new Date().toISOString() } : ex),
            loading: false
          }));
        } catch (e) {
          console.error("Update exercise error:", e);
          set({ loading: false });
        }
      },

      deleteExercise: async (id) => {
        set({ loading: true });
        try {
          await exerciseRepository.delete(id);
          set(state => ({
            exercises: state.exercises.filter(ex => ex.id !== id),
            loading: false
          }));
        } catch (e) {
          console.error("Delete exercise error:", e);
          set({ loading: false });
        }
      }
    }),
    {
      name: 'pitchman-exercises',
    }
  )
);
