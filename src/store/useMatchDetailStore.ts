
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
    addEvent: (event: Omit<MatchEvent, 'id'>) => Promise<void>;
    addEvents: (events: Omit<MatchEvent, 'id'>[]) => Promise<void>;
    deleteEvent: (eventId: string) => Promise<void>;
    syncAndPersistMinutes: () => Promise<void>;
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

        set({ 
            match, 
            allPlayers,
            events: matchEvents,
            lineup: matchLineup || null,
            stats: matchStats,
            loading: false 
        });

        // Sincronizza i minuti al caricamento per sicurezza
        await get().syncAndPersistMinutes();
    },

    syncAndPersistMinutes: async () => {
        const { match, lineup, events, stats, matchId } = get();
        if (!match || !lineup || !matchId) return;

        const duration = match.duration || 90;
        const participants = new Set([...lineup.starters, ...lineup.substitutes].filter(id => id !== ""));
        
        const newStats: PlayerMatchStats[] = Array.from(participants).map(playerId => {
            const existingStat = stats.find(s => s.playerId === playerId);
            
            let minutesPlayed = 0;
            const isStarter = lineup.starters.includes(playerId);

            if (isStarter) {
                const subOutEvent = events.find(e => e.type === 'substitution' && e.subOutPlayerId === playerId && e.team === 'home');
                minutesPlayed = subOutEvent ? subOutEvent.minute : duration;
            } else {
                const subInEvent = events.find(e => e.type === 'substitution' && e.playerId === playerId && e.team === 'home');
                if (subInEvent) {
                    const subOutEventLater = events.find(e => e.type === 'substitution' && e.subOutPlayerId === playerId && e.team === 'home' && (e.minute > subInEvent.minute || e.period !== subInEvent.period));
                    const endMin = subOutEventLater ? subOutEventLater.minute : duration;
                    minutesPlayed = Math.max(0, endMin - subInEvent.minute);
                }
            }

            return {
                matchId: match.id,
                playerId,
                minutesPlayed,
                goals: existingStat?.goals || 0,
                assists: existingStat?.assists || 0,
                yellowCards: existingStat?.yellowCards || 0,
                redCards: existingStat?.redCards || 0
            };
        });

        // Salva nel database
        for (const stat of newStats) {
            await statsRepository.upsert(matchId, stat.playerId, stat);
        }

        set({ stats: newStats });
        
        // Sincronizza le statistiche globali dei giocatori
        await aggregationRepository.syncAllPlayersStats();
        useStatsStore.getState().loadStats();
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

        set({ events: updatedEvents, match: updatedMatch || get().match });
        
        await get().syncAndPersistMinutes();
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

        set({ events: updatedEvents, match: updatedMatch || get().match });

        await get().syncAndPersistMinutes();
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

        set({ events: updatedEvents, match: updatedMatch || get().match });

        await get().syncAndPersistMinutes();
    },
    
    updateMatch: async (data) => {
        const { matchId } = get();
        if (!matchId) return;

        const updatedMatch = await matchRepository.update(matchId, data);
        if (updatedMatch) {
            set({ match: updatedMatch });
            await get().syncAndPersistMinutes();
        }
    },

    saveLineup: async (lineupData) => {
        const matchId = get().matchId;
        if (!matchId) return;
        await lineupRepository.save({ ...lineupData, matchId });
        
        set({ lineup: { ...lineupData, matchId } });
        await get().syncAndPersistMinutes();
    }
}));
