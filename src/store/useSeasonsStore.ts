
"use client";

import { create } from 'zustand';
import { seasonRepository } from '@/lib/repositories/season-repository';
import type { Season } from '@/lib/types';
import { useAuthStore } from './useAuthStore';

interface SeasonsState {
    seasons: Season[];
    activeSeason: Season | null;
    loading: boolean;
    fetchAll: () => Promise<void>;
    addSeason: (name: string) => Promise<void>;
    setActiveSeason: (id: string) => Promise<void>;
}

export const useSeasonsStore = create<SeasonsState>((set, get) => ({
    seasons: [],
    activeSeason: null,
    loading: true,

    fetchAll: async () => {
        const user = useAuthStore.getState().user;
        if (!user) {
          set({ loading: false, seasons: [], activeSeason: null });
          return;
        }
        
        set({ loading: true });
        const active = await seasonRepository.ensureDefaultSeason(user.id);
        const all = await seasonRepository.getAll(user.id);
        set({ seasons: all, activeSeason: active || null, loading: false });
    },

    addSeason: async (name) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        await seasonRepository.add(name, user.id);
        await get().fetchAll();
    },

    setActiveSeason: async (id) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        await seasonRepository.setActive(id, user.id);
        await get().fetchAll();
    }
}));
