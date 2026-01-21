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

export const useMatchesStore = create<MatchState>((set) => ({
    matches: [],
    loading: true,
    fetchAll: async () => {
        set({ loading: true });
        const matches = await matchRepository.getAll();
        set({ matches, loading: false });
    },
    add: async (data) => {
        const newMatch = await matchRepository.add(data);
        set(state => ({ 
            matches: [...state.matches, newMatch].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) 
        }));
        return newMatch;
    },
    update: async (id, updates) => {
        const updatedMatch = await matchRepository.update(id, updates);
        if (updatedMatch) {
            set(state => ({
                matches: state.matches.map(m => m.id === id ? updatedMatch : m)
                                     .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            }));
        }
    },
    remove: async (id) => {
        await matchRepository.delete(id);
        set(state => ({ matches: state.matches.filter(m => m.id !== id) }));
    },
}));
