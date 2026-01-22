"use client";

import { create } from 'zustand';
import { matchRepository } from '@/lib/repositories/match-repository';
import type { Match } from '@/lib/types';
import type { MatchCreateData } from '@/lib/repositories/match-repository';

interface MatchState {
    matches: Match[];
    loading: boolean;
    fetchAll: () => Promise<void>;
    add: (data: MatchCreateData) => Promise<Match | undefined>;
    update: (id: string, updates: Partial<Omit<Match, 'id'>>) => Promise<void>;
    remove: (id: string) => Promise<void>;
}

export const useMatchesStore = create<MatchState>((set, get) => ({
    matches: [],
    loading: true,
    fetchAll: async () => {
        set({ loading: true });
        const matches = await matchRepository.getAll();
        set({ matches, loading: false });
    },
    add: async (data) => {
        const newMatch = await matchRepository.add(data);
        await get().fetchAll(); // Refetch the entire list to ensure consistency
        return newMatch;
    },
    update: async (id, updates) => {
        await matchRepository.update(id, updates);
        await get().fetchAll(); // Refetch the entire list
    },
    remove: async (id) => {
        await matchRepository.delete(id);
        await get().fetchAll(); // Refetch the entire list
    },
}));
