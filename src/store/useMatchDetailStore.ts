"use client";

import { create } from 'zustand';
import { matchRepository } from '@/lib/repositories/match-repository';
import { playerRepository } from '@/lib/repositories/player-repository';
import { aggregationRepository } from '@/lib/repositories/aggregation-repository';
import { lineupRepository } from '@/lib/repositories/lineup-repository';
import { eventRepository } from '@/lib/repositories/event-repository';
import { useStatsStore } from './useStatsStore';
import type { Match, Player, MatchLineup, MatchEvent } from '@/lib/types';

interface MatchDetailState {
    matchId: string | null;
    match: Match | null;
    allPlayers: Player[];
    events: MatchEvent[];
    lineup: MatchLineup | null;
    loading: boolean;
    
    load: (matchId: string) => Promise<void>;
    updateResult: (home: number, away: number) => Promise<void>;
    updateMatch: (data: Partial<Omit<Match, 'id'>>) => Promise<void>;
    saveLineup: (lineup: MatchLineup) => Promise<void>;
    addEvent: (event: Omit<MatchEvent, 'id'>) => Promise<void>;
    deleteEvent: (eventId: string) => Promise<void>;
}

export const useMatchDetailStore = create<MatchDetailState>((set, get) => ({
    matchId: null,
    match: null,
    allPlayers: [],
    events: [],
    lineup: null,
    loading: true,

    load: async (matchId) => {
        set({ loading: true, matchId, match: null, events: [], lineup: null });
        
        const match = await matchRepository.getById(matchId);
        if (!match) {
            set({ loading: false });
            return;
        }

        const allPlayers = await playerRepository.getAll();
        const matchEvents = await eventRepository.getForMatch(matchId);
        const matchLineup = await lineupRepository.getForMatch(matchId);

        set({ 
            match, 
            allPlayers,
            events: matchEvents,
            lineup: matchLineup || null,
            loading: false 
        });
    },

    addEvent: async (eventData) => {
        const matchId = get().matchId;
        if (!matchId) return;

        await eventRepository.add({ ...eventData, matchId });
        const updatedEvents = await eventRepository.getForMatch(matchId);
        
        // Sincronizza statistiche globali
        await aggregationRepository.syncAllPlayersStats();
        useStatsStore.getState().loadStats();

        set({ events: updatedEvents });
    },

    deleteEvent: async (eventId) => {
        const matchId = get().matchId;
        if (!matchId) return;

        await eventRepository.delete(eventId);
        const updatedEvents = await eventRepository.getForMatch(matchId);

        await aggregationRepository.syncAllPlayersStats();
        useStatsStore.getState().loadStats();

        set({ events: updatedEvents });
    },
    
    updateResult: async (home, away) => {
        const { matchId, match } = get();
        if (!matchId || !match) return;

        const updatedData = {
            result: { home, away },
            status: 'completed' as const
        };
        
        const updatedMatch = await matchRepository.update(matchId, updatedData);

        if (updatedMatch) {
            await aggregationRepository.syncAllPlayersStats();
            useStatsStore.getState().loadStats();
            set({ match: updatedMatch });
        }
    },

    updateMatch: async (data) => {
        const { matchId } = get();
        if (!matchId) return;

        const updatedMatch = await matchRepository.update(matchId, data);
        if (updatedMatch) {
            await aggregationRepository.syncAllPlayersStats();
            useStatsStore.getState().loadStats();
            set({ match: updatedMatch });
        }
    },

    saveLineup: async (lineup) => {
        const matchId = get().matchId;
        if (!matchId) return;
        await lineupRepository.save({ ...lineup, matchId });
        set({ lineup });
    }
}));
