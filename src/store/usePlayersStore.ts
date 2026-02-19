"use client";

import { create } from 'zustand';
import { playerRepository } from '@/lib/repositories/player-repository';
import type { Player } from '@/lib/types';
import type { PlayerCreateData } from '@/lib/repositories/player-repository';
import { useStatsStore } from './useStatsStore';
import { useSeasonsStore } from './useSeasonsStore';


interface PlayerState {
    players: Player[];
    loading: boolean;
    fetchAll: () => Promise<void>;
    add: (data: Omit<PlayerCreateData, 'seasonId'>) => Promise<Player | undefined>;
    update: (id: string, updates: Partial<Omit<PlayerCreateData, 'seasonId'>>) => Promise<void>;
    remove: (id: string) => Promise<void>;
}

export const usePlayersStore = create<PlayerState>((set, get) => ({
    players: [],
    loading: true,
    fetchAll: async () => {
        set({ loading: true });
        const activeSeason = useSeasonsStore.getState().activeSeason;
        const players = await playerRepository.getAll(activeSeason?.id);
        set({ players, loading: false });
    },
    add: async (data) => {
        const activeSeason = useSeasonsStore.getState().activeSeason;
        if (!activeSeason) return undefined;

        const newPlayer = await playerRepository.add({ ...data, seasonId: activeSeason.id });
        set(state => ({ players: [...state.players, newPlayer].sort((a,b) => a.name.localeCompare(b.name)) }));
        useStatsStore.getState().loadStats();
        return newPlayer;
    },
    update: async (id, updates) => {
        const updatedPlayer = await playerRepository.update(id, updates);
        if (updatedPlayer) {
            set(state => ({
                players: state.players.map(p => p.id === id ? updatedPlayer : p)
            }));
            useStatsStore.getState().loadStats();
        }
    },
    remove: async (id) => {
        await playerRepository.delete(id);
        set(state => ({ players: state.players.filter(p => p.id !== id) }));
        useStatsStore.getState().loadStats();
    },
}));
