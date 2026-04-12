
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playerRepository } from '@/lib/repositories/player-repository';
import type { Player, Role } from '@/lib/types';
import type { PlayerCreateData } from '@/lib/repositories/player-repository';
import { useStatsStore } from './useStatsStore';
import { useSeasonsStore } from './useSeasonsStore';
import { useAuthStore } from './useAuthStore';
import { mutate } from 'swr';
import { getErrorMessage } from '@/lib/error-utils';

interface PlayerState {
    players: Player[];
    loading: boolean;
    error: string | null;
    fetchAll: (seasonId?: string) => Promise<void>;
    add: (data: Omit<PlayerCreateData, 'seasonId' | 'userId'>) => Promise<Player | undefined>;
    bulkAdd: (data: { name: string, role: Role }[]) => Promise<void>;
    update: (id: string, updates: Partial<Omit<Player, 'id' | 'userId' | 'seasonId' | 'teamId' | 'teamOwnerId'>>) => Promise<void>;
    remove: (id: string) => Promise<void>;
    removeAll: () => Promise<void>;
}

export const getPlayersSWRKey = (userId?: string, seasonId?: string) => 
    userId && seasonId ? ['players', userId, seasonId] : null;

export const usePlayersStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      players: [],
      loading: true,
      error: null,
      fetchAll: async (seasonId) => {
          const user = useAuthStore.getState().user;
          if (!user) return;

          if (get().players.length === 0) set({ loading: true, error: null });
          const targetSeasonId = seasonId || useSeasonsStore.getState().activeSeason?.id;
          
          if (!targetSeasonId) {
              set({ players: [], loading: false, error: null });
              return;
          }

          try {
            const players = await playerRepository.getAll(user.id, targetSeasonId);
            set({ players, loading: false, error: null });
            mutate(getPlayersSWRKey(user.id, targetSeasonId), players, false);
          } catch (e) {
            console.error("Fetch players error:", e);
            set({ loading: false, error: getErrorMessage(e) });
          }
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
          
          await mutate(getPlayersSWRKey(user.id, activeSeason.id));
          await get().fetchAll(activeSeason.id);
          useStatsStore.getState().loadSummaryStats();
          return newPlayer;
      },
      bulkAdd: async (playersData) => {
          const user = useAuthStore.getState().user;
          const activeSeason = useSeasonsStore.getState().activeSeason;
          if (!activeSeason || !user) return;

          await playerRepository.bulkAdd(playersData, user.id, activeSeason.id);
          
          await mutate(getPlayersSWRKey(user.id, activeSeason.id));
          await get().fetchAll(activeSeason.id);
          useStatsStore.getState().loadSummaryStats();
      },
      update: async (id, updates) => {
          const user = useAuthStore.getState().user;
          const activeSeason = useSeasonsStore.getState().activeSeason;
          if (!activeSeason || !user) return;

          const updatedPlayer = await playerRepository.update(id, activeSeason.id, updates);
          if (updatedPlayer) {
              await mutate(getPlayersSWRKey(user.id, activeSeason.id));
              await get().fetchAll(activeSeason.id);
              useStatsStore.getState().loadSummaryStats();
          }
      },
      remove: async (id) => {
          const user = useAuthStore.getState().user;
          const activeSeason = useSeasonsStore.getState().activeSeason;
          if (!activeSeason || !user) return;
          
          await playerRepository.delete(id, activeSeason.id);
          await mutate(getPlayersSWRKey(user.id, activeSeason.id));
          await get().fetchAll(activeSeason.id);
          useStatsStore.getState().loadSummaryStats();
      },
      removeAll: async () => {
          const user = useAuthStore.getState().user;
          const activeSeason = useSeasonsStore.getState().activeSeason;
          if (!activeSeason || !user) return;
          
          await playerRepository.deleteAll(user.id, activeSeason.id);
          await mutate(getPlayersSWRKey(user.id, activeSeason.id));
          await get().fetchAll(activeSeason.id);
          useStatsStore.getState().loadSummaryStats();
      },
    }),
    {
      name: 'pitchman-players',
    }
  )
);
