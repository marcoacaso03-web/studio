
"use client";

import { create } from 'zustand';
import { playerRepository } from '@/lib/repositories/player-repository';
import type { Player, Role } from '@/lib/types';
import type { PlayerCreateData } from '@/lib/repositories/player-repository';
import { useStatsStore } from './useStatsStore';
import { useSeasonsStore } from './useSeasonsStore';
import { useAuthStore } from './useAuthStore';

interface PlayerState {
    players: Player[];
    loading: boolean;
    fetchAll: (seasonId?: string) => Promise<void>;
    add: (data: Omit<PlayerCreateData, 'seasonId' | 'userId'>) => Promise<Player | undefined>;
    bulkAdd: (data: { name: string, role: Role }[]) => Promise<void>;
    update: (id: string, updates: Partial<Omit<PlayerCreateData, 'seasonId' | 'userId'>>) => Promise<void>;
    remove: (id: string) => Promise<void>;
}

export const usePlayersStore = create<PlayerState>((set, get) => ({
    players: [],
    loading: true,
    fetchAll: async (seasonId) => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ loading: true });
        const targetSeasonId = seasonId || useSeasonsStore.getState().activeSeason?.id;
        
        if (!targetSeasonId) {
            set({ players: [], loading: false });
            return;
        }

        const players = await playerRepository.getAll(user.id, targetSeasonId);
        set({ players, loading: false });
    },
    add: async (data) => {
        const user = useAuthStore.getState().user;
        const activeSeason = useSeasonsStore.getState().activeSeason;
        if (!activeSeason || !user) {
             return undefined;
        }

        const newPlayer = await playerRepository.add({ 
            ...data, 
            userId: user.id,
            seasonId: activeSeason.id 
        });
        
        await get().fetchAll(activeSeason.id);
        useStatsStore.getState().loadStats();
        return newPlayer;
    },
    bulkAdd: async (playersData) => {
        const user = useAuthStore.getState().user;
        const activeSeason = useSeasonsStore.getState().activeSeason;
        if (!activeSeason || !user) return;

        await playerRepository.bulkAdd(playersData, user.id, activeSeason.id);
        
        await get().fetchAll(activeSeason.id);
        useStatsStore.getState().loadStats();
    },
    update: async (id, updates) => {
        const activeSeason = useSeasonsStore.getState().activeSeason;
        if (!activeSeason) return;

        const updatedPlayer = await playerRepository.update(id, activeSeason.id, updates);
        if (updatedPlayer) {
            await get().fetchAll(activeSeason.id);
            useStatsStore.getState().loadStats();
        }
    },
    remove: async (id) => {
        const activeSeason = useSeasonsStore.getState().activeSeason;
        if (!activeSeason) return;
        
        await playerRepository.delete(id, activeSeason.id);
        await get().fetchAll(activeSeason.id);
        useStatsStore.getState().loadStats();
    },
}));
