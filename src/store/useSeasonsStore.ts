
"use client";

import { create } from 'zustand';
import { seasonRepository } from '@/lib/repositories/season-repository';
import type { Season } from '@/lib/types';
import { useAuthStore } from './useAuthStore';
import { getErrorMessage } from '@/lib/error-utils';

interface SeasonsState {
    seasons: Season[];
    activeSeason: Season | null;
    loading: boolean;
    error: string | null;
    fetchAll: () => Promise<void>;
    addSeason: (name: string) => Promise<Season>;
    setActiveSeason: (id: string) => Promise<void>;
    removeSeason: (id: string) => Promise<void>;
    renameSeason: (id: string, name: string) => Promise<void>;
    joinSeason: (id: string) => Promise<void>;
}

export const useSeasonsStore = create<SeasonsState>((set, get) => ({
    seasons: [],
    activeSeason: null,
    loading: true,
    error: null,

    fetchAll: async () => {
        const user = useAuthStore.getState().user;
        if (!user) {
            set({ loading: false, seasons: [], activeSeason: null, error: null });
            return;
        }

        if (get().seasons.length === 0) set({ loading: true, error: null });
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
                loading: false,
                error: null,
            });
        } catch (error) {
            console.error("Error fetching seasons:", error);
            set({ loading: false, error: getErrorMessage(error) });
        }
    },

    addSeason: async (name) => {
        const user = useAuthStore.getState().user;
        if (!user) return undefined as unknown as Season;
        // Prevent duplicates: check if a season with this name already exists
        const existing = get().seasons.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (existing) {
            await get().setActiveSeason(existing.id);
            return existing;
        }
        const newSeason = await seasonRepository.add(name, user.id);
        await get().fetchAll();
        return newSeason;
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
        const wasActive = get().activeSeason?.id === id;
        await seasonRepository.delete(id);
        await get().fetchAll();
        // If the deleted season was active, set a new active season
        if (wasActive) {
            const remaining = get().seasons;
            if (remaining.length > 0) {
                await get().setActiveSeason(remaining[0].id);
            } else {
                await seasonRepository.ensureDefaultSeason(user.id);
                await get().fetchAll();
            }
        }
    },

    renameSeason: async (id, name) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        await seasonRepository.rename(id, name);
        await get().fetchAll();
    },

    joinSeason: async (id) => {
        const user = useAuthStore.getState().user;
        if (!user) return;
        await seasonRepository.joinSeason(id, user.id);
        await get().fetchAll();
    }
}));
