
"use client";

import { create } from 'zustand';
import { matchRepository } from '@/lib/repositories/match-repository';
import { playerRepository } from '@/lib/repositories/player-repository';
import { aggregationRepository } from '@/lib/repositories/aggregation-repository';
import { lineupRepository } from '@/lib/repositories/lineup-repository';
import { eventRepository } from '@/lib/repositories/event-repository';
import { statsRepository } from '@/lib/repositories/stats-repository';
import { useStatsStore } from './useStatsStore';
import { useSeasonsStore } from './useSeasonsStore';
import { useAuthStore } from './useAuthStore';
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
        
        const attemptLoading = async () => {
            const authState = useAuthStore.getState();
            const seasonsState = useSeasonsStore.getState();
            
            // Aspetta che l'auth sia inizializzata
            if (!authState.isInitialized) return false;
            
            const user = authState.user;
            if (!user) return false;

            // Assicuriamoci che la stagione attiva sia caricata
            let seasonId = seasonsState.activeSeason?.id;
            if (!seasonId) {
                await seasonsState.fetchAll();
                seasonId = useSeasonsStore.getState().activeSeason?.id;
            }

            if (seasonId) {
                try {
                    const match = await matchRepository.getById(matchId, seasonId);
                    if (match) {
                        const [allPlayers, matchEvents, matchLineup, matchStats] = await Promise.all([
                            playerRepository.getAll(user.id, seasonId),
                            eventRepository.getForMatch(matchId, seasonId),
                            lineupRepository.getForMatch(matchId, seasonId),
                            statsRepository.getForMatch(matchId, seasonId)
                        ]);

                        set({ 
                            match, 
                            allPlayers,
                            events: matchEvents,
                            lineup: matchLineup || null,
                            stats: matchStats,
                            loading: false 
                        });

                        await get().syncAndPersistMinutes();
                        return true;
                    } else {
                        // Se la query ha risposto ma il match è nullo, potrebbe essere un errore di ID o percorso
                        return false; 
                    }
                } catch (error) {
                    console.error("Error fetching match data:", error);
                    return false;
                }
            }
            return false;
        };

        // Retry loop per gestire l'inizializzazione asincrona dello store (es. refresh pagina)
        let attempts = 0;
        const maxAttempts = 10;
        const checkAndLoad = async () => {
            const success = await attemptLoading();
            if (!success && attempts < maxAttempts) {
                attempts++;
                setTimeout(checkAndLoad, 600);
            } else {
                set({ loading: false });
            }
        };

        checkAndLoad();
    },

    syncAndPersistMinutes: async () => {
        const { match, lineup, events, matchId, allPlayers } = get();
        const user = useAuthStore.getState().user;
        if (!match || !matchId || !user) return;

        const duration = match.duration || 90;
        const halfTime = duration / 2;
        const pitchManTeam = match.isHome ? 'home' : 'away';

        const getAbsoluteMinute = (event: MatchEvent) => {
            if (event.period === '1T') return Math.min(event.minute, halfTime);
            if (event.period === '2T') return halfTime + Math.min(event.minute, halfTime);
            return event.minute + duration; 
        };

        const chronologicalEvents = [...events].sort((a, b) => {
            const periodOrder: Record<string, number> = { '1T': 1, '2T': 2, '1TS': 3, '2TS': 4 };
            const pA = periodOrder[a.period] || 0;
            const pB = periodOrder[b.period] || 0;
            if (pA !== pB) return pA - pB;
            return a.minute - b.minute;
        });

        const newStats: PlayerMatchStats[] = allPlayers.map(player => {
            const playerId = player.id;
            const yellowCards = events.filter(e => e.type === 'yellow_card' && e.playerId === playerId && e.team === pitchManTeam).length;
            const redCards = events.filter(e => e.type === 'red_card' && e.playerId === playerId && e.team === pitchManTeam).length;
            const goals = events.filter(e => e.type === 'goal' && e.playerId === playerId && e.team === pitchManTeam).length;
            const assists = events.filter(e => e.type === 'goal' && e.assistPlayerId === playerId && e.team === pitchManTeam).length;

            let minutesPlayed = 0;
            const isStarter = lineup?.starters.includes(playerId);
            const isSubstitute = lineup?.substitutes.includes(playerId);

            if (lineup && (isStarter || isSubstitute)) {
                if (isStarter) {
                    const subOutEvent = chronologicalEvents.find(e => 
                        e.type === 'substitution' && e.subOutPlayerId === playerId && e.team === pitchManTeam
                    );
                    minutesPlayed = subOutEvent ? getAbsoluteMinute(subOutEvent) : duration;
                } else {
                    const subInEvent = chronologicalEvents.find(e => 
                        e.type === 'substitution' && e.playerId === playerId && e.team === pitchManTeam
                    );
                    if (subInEvent) {
                        const subInMin = getAbsoluteMinute(subInEvent);
                        const subOutEventLater = chronologicalEvents.find(e => 
                            e.type === 'substitution' && e.subOutPlayerId === playerId && e.team === pitchManTeam && getAbsoluteMinute(e) > subInMin
                        );
                        const endMin = subOutEventLater ? getAbsoluteMinute(subOutEventLater) : duration;
                        minutesPlayed = Math.max(0, endMin - subInMin);
                    }
                }
            }

            return { matchId, playerId, minutesPlayed, goals, assists, yellowCards, redCards, teamOwnerId: user.id };
        }).filter(s => s.minutesPlayed > 0 || s.goals > 0 || s.assists > 0 || s.yellowCards > 0 || s.redCards > 0);

        for (const stat of newStats) {
            await statsRepository.upsert(matchId, match.seasonId, stat.playerId, stat, user.id);
        }

        set({ stats: newStats });
        await aggregationRepository.syncAllPlayersStats(user.id, match.seasonId);
        useStatsStore.getState().loadStats();
    },

    saveAllStats: async (newStats) => {
        const { matchId, match } = get();
        const user = useAuthStore.getState().user;
        if (!matchId || !match || !user) return;
        for (const stat of newStats) {
            await statsRepository.upsert(matchId, match.seasonId, stat.playerId, stat, user.id);
        }
        set({ stats: newStats });
        await aggregationRepository.syncAllPlayersStats(user.id, match.seasonId);
        useStatsStore.getState().loadStats();
    },

    addEvent: async (eventData) => {
        const { matchId, match } = get();
        const user = useAuthStore.getState().user;
        if (!matchId || !match || !user) return;
        await eventRepository.add({ ...eventData, matchId }, match.seasonId, user.id);
        const updatedEvents = await eventRepository.getForMatch(matchId, match.seasonId);
        const homeGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'home').length;
        const awayGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'away').length;
        const updatedMatch = await matchRepository.update(matchId, match.seasonId, { result: { home: homeGoals, away: awayGoals } });
        set({ events: updatedEvents, match: updatedMatch || get().match });
        await get().syncAndPersistMinutes();
    },

    addEvents: async (eventsData) => {
        const { matchId, match } = get();
        const user = useAuthStore.getState().user;
        if (!matchId || !match || !user) return;
        for (const data of eventsData) {
            await eventRepository.add({ ...data, matchId }, match.seasonId, user.id);
        }
        const updatedEvents = await eventRepository.getForMatch(matchId, match.seasonId);
        const homeGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'home').length;
        const awayGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'away').length;
        const updatedMatch = await matchRepository.update(matchId, match.seasonId, { result: { home: homeGoals, away: awayGoals } });
        set({ events: updatedEvents, match: updatedMatch || get().match });
        await get().syncAndPersistMinutes();
    },

    deleteEvent: async (eventId) => {
        const { matchId, match } = get();
        if (!matchId || !match) return;
        await eventRepository.delete(eventId, matchId, match.seasonId);
        const updatedEvents = await eventRepository.getForMatch(matchId, match.seasonId);
        const homeGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'home').length;
        const awayGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'away').length;
        const updatedMatch = await matchRepository.update(matchId, match.seasonId, { result: { home: homeGoals, away: awayGoals } });
        set({ events: updatedEvents, match: updatedMatch || get().match });
        await get().syncAndPersistMinutes();
    },
    
    updateMatch: async (data) => {
        const { matchId, match } = get();
        if (!matchId || !match) return;
        const updatedMatch = await matchRepository.update(matchId, match.seasonId, data);
        if (updatedMatch) {
            set({ match: updatedMatch });
            await get().syncAndPersistMinutes();
        }
    },

    saveLineup: async (lineupData) => {
        const { matchId, match } = get();
        const user = useAuthStore.getState().user;
        if (!matchId || !match || !user) return;
        await lineupRepository.save({ ...lineupData, matchId }, match.seasonId, user.id);
        set({ lineup: { ...lineupData, matchId } });
        await get().syncAndPersistMinutes();
    }
}));
