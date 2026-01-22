"use client";

import { create } from 'zustand';
import { playerRepository } from '@/lib/repositories/player-repository';
import type { Player } from '@/lib/types';
import type { PlayerCreateData } from '@/lib/repositories/player-repository';
import { useStatsStore } from './useStatsStore';


interface PlayerState {
    players: Player[];
    loading: boolean;
    fetchAll: () => Promise<void>;
    add: (data: PlayerCreateData) => Promise<Player | undefined>;
    update: (id: string, updates: Partial<PlayerCreateData>) => Promise<void>;
    remove: (id: string) => Promise<void>;
}

export const usePlayersStore = create<PlayerState>((set) => ({
    players: [],
    loading: true,
    fetchAll: async () => {
        set({ loading: true });
        const players = await playerRepository.getAll();
        set({ players, loading: false });
    },
    add: async (data) => {
        const newPlayer = await playerRepository.add(data);
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
