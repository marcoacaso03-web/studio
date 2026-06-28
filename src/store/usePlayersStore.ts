
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playerRepository } from '@/lib/repositories/player-repository';
import type { Player, Role, PlayerRole } from '@/lib/types';
import type { PlayerCreateData } from '@/lib/repositories/player-repository';
import { PlayerSchema } from '@/lib/schemas';
import { useStatsStore } from './useStatsStore';
import { useSeasonsStore } from './useSeasonsStore';
import { useAuthStore } from './useAuthStore';
import { mutate } from 'swr';
import { getErrorMessage } from '@/lib/error-utils';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

interface PlayerState {
    players: Player[];
    loading: boolean;
    error: string | null;
    fetchAll: (seasonId?: string) => Promise<void>;
    add: (data: Omit<PlayerCreateData, 'seasonId' | 'userId'>) => Promise<Player | undefined>;
    bulkAdd: (data: PlayerCreateData[]) => Promise<void>;
    update: (id: string, updates: Partial<Omit<Player, 'id' | 'userId' | 'seasonId' | 'teamId' | 'teamOwnerId'>>) => Promise<void>;
    remove: (id: string) => Promise<void>;
    removeAll: () => Promise<void>;
    subscribe: (userId: string, seasonId: string) => () => void;
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

          const repoData: PlayerCreateData[] = playersData.map(p => ({
            name: p.name,
            firstName: p.name.split(' ')[0] || p.name,
            lastName: p.name.split(' ').slice(1).join(' ') || '',
            roles: p.roles,
            role: p.role,
            seasonId: activeSeason.id,
            userId: user.id,
          }));
          await playerRepository.bulkAdd(repoData, user.id, activeSeason.id);
          
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
      subscribe: (userId: string, seasonId: string) => {
        const db = getFirestore();
        const playersRef = collection(db, 'teams', seasonId, 'players');
        const q = query(playersRef, where('teamOwnerId', '==', userId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const players = snapshot.docs.map(doc => {
            const pData = doc.data();
            if (!pData.firstName || !pData.lastName) {
              const parts = (pData.name || "").split(" ");
              pData.firstName = parts.shift() || "";
              pData.lastName = parts.join(" ") || pData.firstName;
            }
            const data = { ...pData, id: doc.id };
            const parsed = PlayerSchema.safeParse(data);
            if (!parsed.success) {
              console.error("Schema validation failed for Player:", parsed.error);
              return data as Player;
            }
            return parsed.data;
          });
          set({ players: players.sort((a, b) => a.lastName.localeCompare(b.lastName)), loading: false, error: null });
        }, (err) => {
          console.error("Players onSnapshot error:", err);
          set({ loading: false, error: getErrorMessage(err) });
        });
        return unsubscribe;
      },
    }),
    {
      name: 'pitchman-players',
    }
  )
);
