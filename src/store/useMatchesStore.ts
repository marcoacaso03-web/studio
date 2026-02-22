
"use client";

import { create } from 'zustand';
import { matchRepository } from '@/lib/repositories/match-repository';
import type { Match } from '@/lib/types';
import type { MatchCreateData } from '@/lib/repositories/match-repository';
import { useSeasonsStore } from './useSeasonsStore';
import { useAuthStore } from './useAuthStore';

interface MatchState {
    matches: Match[];
    loading: boolean;
    fetchAll: (seasonId?: string) => Promise<void>;
    add: (data: Omit<MatchCreateData, 'seasonId' | 'userId'>) => Promise<Match | undefined>;
    update: (id: string, updates: Partial<Omit<Match, 'id' | 'userId'>>) => Promise<void>;
    remove: (id: string) => Promise<void>;
}

export const useMatchesStore = create<MatchState>((set, get) => ({
    matches: [],
    loading: true,
    fetchAll: async (seasonId) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ loading: true });
        const targetSeasonId = seasonId || useSeasonsStore.getState().activeSeason?.id;
        
        if (!targetSeasonId) {
            set({ matches: [], loading: false });
            return;
        }

        const matches = await matchRepository.getAll(user.id, targetSeasonId);
        set({ matches, loading: false });
    },
    add: async (data) => {
        const user = useAuthStore.getState().user;
        const activeSeason = useSeasonsStore.getState().activeSeason;
        if (!activeSeason || !user) {
            return undefined;
        }

        const newMatch = await matchRepository.add({ 
            ...data, 
            userId: user.id,
            seasonId: activeSeason.id 
        } as MatchCreateData);
        
        await get().fetchAll(activeSeason.id);
        return newMatch;
    },
    update: async (id, updates) => {
        const match = await matchRepository.getById(id);
        const updatedMatch = await matchRepository.update(id, updates);
        if (updatedMatch) {
            await get().fetchAll(match?.seasonId);
        }
    },
    remove: async (id) => {
        const match = await matchRepository.getById(id);
        const seasonId = match?.seasonId;
        await matchRepository.delete(id);
        await get().fetchAll(seasonId);
    },
}));
