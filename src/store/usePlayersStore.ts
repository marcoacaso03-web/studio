
"use client";

import { create } from 'zustand';
import { playerRepository } from '@/lib/repositories/player-repository';
import type { Player, Role } from '@/lib/types';
import type { PlayerCreateData } from '@/lib/repositories/player-repository';
import { useStatsStore } from './useStatsStore';
import { useSeasonsStore } from './useSeasonsStore';
import { useAuthStore } from './useAuthStore';
import { db } from '@/lib/db';

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
             console.error("Dati mancanti per aggiungere il giocatore.");
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

        const newPlayers: Player[] = playersData.map(p => ({
            id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            userId: user.id,
            seasonId: activeSeason.id,
            name: p.name,
            role: p.role,
            avatarUrl: `https://picsum.photos/seed/p${Date.now()}${Math.random()}/200/200`,
            imageHint: 'player portrait',
            stats: { appearances: 0, goals: 0, assists: 0, avgMinutes: 0 },
        }));

        await db.players.bulkAdd(newPlayers);
        await get().fetchAll(activeSeason.id);
        useStatsStore.getState().loadStats();
    },
    update: async (id, updates) => {
        const player = await playerRepository.getById(id);
        const updatedPlayer = await playerRepository.update(id, updates);
        if (updatedPlayer) {
            await get().fetchAll(player?.seasonId);
            useStatsStore.getState().loadStats();
        }
    },
    remove: async (id) => {
        const player = await playerRepository.getById(id);
        const seasonId = player?.seasonId;
        await playerRepository.delete(id);
        await get().fetchAll(seasonId);
        useStatsStore.getState().loadStats();
    },
}));
