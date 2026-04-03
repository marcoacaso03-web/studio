
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
    removeSeason: (id: string) => Promise<void>;
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
        
        if (get().seasons.length === 0) set({ loading: true });
        try {
            const active = await seasonRepository.ensureDefaultSeason(user.id);
            const all = await seasonRepository.getAll(user.id);
            
            // Ordiniamo le stagioni per data di creazione (dalla più recente alla meno recente)
            const sortedSeasons = all.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            set({ 
                seasons: sortedSeasons, 
                activeSeason: active || (sortedSeasons.length > 0 ? sortedSeasons[0] : null), 
                loading: false 
            });
        } catch (error) {
            console.error("Error fetching seasons:", error);
            set({ loading: false });
        }
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
    },

    removeSeason: async (id) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        await seasonRepository.delete(id);
        await get().fetchAll();
    }
}));
