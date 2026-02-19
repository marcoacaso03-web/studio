
"use client";

import { create } from 'zustand';
import { matchRepository } from '@/lib/repositories/match-repository';
import { playerRepository } from '@/lib/repositories/player-repository';
import { aggregationRepository } from '@/lib/repositories/aggregation-repository';
import { lineupRepository } from '@/lib/repositories/lineup-repository';
import { eventRepository } from '@/lib/repositories/event-repository';
import { statsRepository } from '@/lib/repositories/stats-repository';
import { useStatsStore } from './useStatsStore';
import type { Match, Player, MatchLineup, MatchEvent, PlayerMatchStats } from '@/lib/types';

interface MatchDetailState {
    matchId: string | null;
    match: Match | null;
    allPlayers: Player[];
    events: MatchEvent[];
    lineup: MatchLineup | null;
    stats: PlayerMatchStats[];
    loading: boolean;
    
    load: (matchId: string) => Promise<void>;
    updateMatch: (data: Partial<Omit<Match, 'id'>>) => Promise<void>;
    saveLineup: (lineup: MatchLineup) => Promise<void>;
    saveAllStats: (stats: PlayerMatchStats[]) => Promise<void>;
    addEvent: (event: Omit<MatchEvent, 'id'>) => Promise<void>;
    addEvents: (events: Omit<MatchEvent, 'id'>[]) => Promise<void>;
    deleteEvent: (eventId: string) => Promise<void>;
}

export const useMatchDetailStore = create<MatchDetailState>((set, get) => ({
    matchId: null,
    match: null,
    allPlayers: [],
    events: [],
    lineup: null,
    stats: [],
    loading: true,

    load: async (matchId) => {
        set({ loading: true, matchId, match: null, events: [], lineup: null, stats: [] });
        
        const match = await matchRepository.getById(matchId);
        if (!match) {
            set({ loading: false });
            return;
        }

        const allPlayers = await playerRepository.getAll();
        const matchEvents = await eventRepository.getForMatch(matchId);
        const matchLineup = await lineupRepository.getForMatch(matchId);
        const matchStats = await statsRepository.getForMatch(matchId);

        // Se non ci sono stats ma c'è una formazione, inizializzale per i presenti
        let finalStats = matchStats;
        if (matchStats.length === 0 && matchLineup) {
            const participants = new Set([...matchLineup.starters, ...matchLineup.substitutes].filter(id => id !== ""));
            finalStats = Array.from(participants).map(playerId => ({
                matchId,
                playerId,
                minutesPlayed: matchLineup.starters.includes(playerId) ? 90 : 0,
                goals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0
            }));
        }

        set({ 
            match, 
            allPlayers,
            events: matchEvents,
            lineup: matchLineup || null,
            stats: finalStats,
            loading: false 
        });
    },

    addEvent: async (eventData) => {
        const matchId = get().matchId;
        if (!matchId) return;

        await eventRepository.add({ ...eventData, matchId });
        const updatedEvents = await eventRepository.getForMatch(matchId);
        
        const homeGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'home').length;
        const awayGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'away').length;
        
        const updatedMatch = await matchRepository.update(matchId, {
            result: { home: homeGoals, away: awayGoals }
        });

        await aggregationRepository.syncAllPlayersStats();
        useStatsStore.getState().loadStats();

        set({ events: updatedEvents, match: updatedMatch || get().match });
    },

    addEvents: async (eventsData) => {
        const matchId = get().matchId;
        if (!matchId) return;

        for (const data of eventsData) {
            await eventRepository.add({ ...data, matchId });
        }
        
        const updatedEvents = await eventRepository.getForMatch(matchId);
        
        const homeGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'home').length;
        const awayGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'away').length;
        
        const updatedMatch = await matchRepository.update(matchId, {
            result: { home: homeGoals, away: awayGoals }
        });

        await aggregationRepository.syncAllPlayersStats();
        useStatsStore.getState().loadStats();

        set({ events: updatedEvents, match: updatedMatch || get().match });
    },

    deleteEvent: async (eventId) => {
        const matchId = get().matchId;
        if (!matchId) return;

        await eventRepository.delete(eventId);
        const updatedEvents = await eventRepository.getForMatch(matchId);

        const homeGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'home').length;
        const awayGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'away').length;
        
        const updatedMatch = await matchRepository.update(matchId, {
            result: { home: homeGoals, away: awayGoals }
        });

        await aggregationRepository.syncAllPlayersStats();
        useStatsStore.getState().loadStats();

        set({ events: updatedEvents, match: updatedMatch || get().match });
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
        
        // Sincronizza anche la lista delle statistiche individuali per chi è in formazione
        const participants = new Set([...lineup.starters, ...lineup.substitutes].filter(id => id !== ""));
        const currentStats = get().stats;
        const newStats = Array.from(participants).map(playerId => {
            const existing = currentStats.find(s => s.playerId === playerId);
            return existing || {
                matchId,
                playerId,
                minutesPlayed: lineup.starters.includes(playerId) ? 90 : 0,
                goals: 0,
                assists: 0,
                yellowCards: 0,
                redCards: 0
            };
        });

        set({ lineup, stats: newStats });
    },

    saveAllStats: async (stats) => {
        const matchId = get().matchId;
        if (!matchId) return;
        
        for (const stat of stats) {
            await statsRepository.upsert(matchId, stat.playerId, {
                minutesPlayed: stat.minutesPlayed,
                goals: stat.goals,
                assists: stat.assists,
                yellowCards: stat.yellowCards,
                redCards: stat.redCards
            });
        }
        
        await aggregationRepository.syncAllPlayersStats();
        useStatsStore.getState().loadStats();
        set({ stats });
    }
}));
