"use client";

import { create } from 'zustand';
import { matchRepository } from '@/lib/repositories/match-repository';
import type { Match } from '@/lib/types';
import type { MatchCreateData } from '@/lib/repositories/match-repository';
import { useSeasonsStore } from './useSeasonsStore';

interface MatchState {
    matches: Match[];
    loading: boolean;
    fetchAll: () => Promise<void>;
    add: (data: Omit<MatchCreateData, 'seasonId'>) => Promise<Match | undefined>;
    update: (id: string, updates: Partial<Omit<Match, 'id'>>) => Promise<void>;
    remove: (id: string) => Promise<void>;
}

export const useMatchesStore = create<MatchState>((set, get) => ({
    matches: [],
    loading: true,
    fetchAll: async () => {
        set({ loading: true });
        const activeSeason = useSeasonsStore.getState().activeSeason;
        const matches = await matchRepository.getAll(activeSeason?.id);
        set({ matches, loading: false });
    },
    add: async (data) => {
        const activeSeason = useSeasonsStore.getState().activeSeason;
        if (!activeSeason) return undefined;

        const newMatch = await matchRepository.add({ 
            ...data, 
            seasonId: activeSeason.id 
        });
        await get().fetchAll();
        return newMatch;
    },
    update: async (id, updates) => {
        await matchRepository.update(id, updates);
        await get().fetchAll();
    },
    remove: async (id) => {
        await matchRepository.delete(id);
        await get().fetchAll();
    },
}));
