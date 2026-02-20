"use client";

import { create } from 'zustand';
import { seasonRepository } from '@/lib/repositories/season-repository';
import type { Season } from '@/lib/types';

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
        set({ loading: true });
        const active = await seasonRepository.ensureDefaultSeason();
        const all = await seasonRepository.getAll();
        set({ seasons: all, activeSeason: active || null, loading: false });
    },

    addSeason: async (name) => {
        await seasonRepository.add(name);
        await get().fetchAll();
    },

    setActiveSeason: async (id) => {
        await seasonRepository.setActive(id);
        await get().fetchAll();
    }
}));
