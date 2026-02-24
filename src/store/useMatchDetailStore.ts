
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
    error: string | null;
    
    load: (matchId: string, seasonId?: string) => Promise<void>;
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
    error: null,

    load: async (matchId, seasonId) => {
        set({ loading: true, error: null, matchId, match: null });
        
        try {
            const authState = useAuthStore.getState();
            // Attendiamo che l'autenticazione sia pronta se necessario
            if (!authState.isInitialized) {
                // In un caso reale potremmo sottoscrivere o attendere, qui facciamo un check rapido
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            const currentUser = useAuthStore.getState().user;
            if (!currentUser) {
                set({ error: "Accesso negato: devi essere loggato per visualizzare i dettagli.", loading: false });
                return;
            }

            // Identificazione stagione: priorità al parametro URL, poi alla stagione attiva nello store
            let targetSeasonId = seasonId || useSeasonsStore.getState().activeSeason?.id;
            
            if (!targetSeasonId) {
                // Se non c'è seasonId, proviamo a caricarla se lo store è vuoto
                await useSeasonsStore.getState().fetchAll();
                targetSeasonId = useSeasonsStore.getState().activeSeason?.id;
            }

            if (!targetSeasonId) {
                set({ error: "Identificativo stagione mancante. Torna alla dashboard.", loading: false });
                return;
            }

            const match = await matchRepository.getById(matchId, targetSeasonId);
            
            if (!match) {
                set({ 
                    error: `Partita non trovata (ID: ${matchId}). Potrebbe essere stata eliminata o appartenere a un'altra stagione.`, 
                    loading: false 
                });
                return;
            }

            const [allPlayers, matchEvents, matchLineup, matchStats] = await Promise.all([
                playerRepository.getAll(currentUser.id, targetSeasonId),
                eventRepository.getForMatch(matchId, targetSeasonId, currentUser.id),
                lineupRepository.getForMatch(matchId, targetSeasonId),
                statsRepository.getForMatch(matchId, targetSeasonId, currentUser.id)
            ]);

            set({ 
                match, 
                allPlayers,
                events: matchEvents,
                lineup: matchLineup || null,
                stats: matchStats,
                loading: false,
                error: null
            });

            await get().syncAndPersistMinutes();
        } catch (e: any) {
            console.error("Error in match detail load:", e);
            set({ 
                error: `Errore durante il recupero dei dati: ${e.message || "Permessi insufficienti o errore di rete"}.`, 
                loading: false 
            });
        }
    },

    syncAndPersistMinutes: async () => {
        const { match, lineup, events, matchId, allPlayers } = get();
        const user = useAuthStore.getState().user;
        if (!match || !matchId || !user) return;

        try {
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
        } catch (error) {
            console.warn("Failed to sync minutes:", error);
        }
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
        const updatedEvents = await eventRepository.getForMatch(matchId, match.seasonId, user.id);
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
        const updatedEvents = await eventRepository.getForMatch(matchId, match.seasonId, user.id);
        const homeGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'home').length;
        const awayGoals = updatedEvents.filter(e => e.type === 'goal' && e.team === 'away').length;
        const updatedMatch = await matchRepository.update(matchId, match.seasonId, { result: { home: homeGoals, away: awayGoals } });
        set({ events: updatedEvents, match: updatedMatch || get().match });
        await get().syncAndPersistMinutes();
    },

    deleteEvent: async (eventId) => {
        const { matchId, match } = get();
        const user = useAuthStore.getState().user;
        if (!matchId || !match || !user) return;
        await eventRepository.delete(eventId, matchId, match.seasonId);
        const updatedEvents = await eventRepository.getForMatch(matchId, match.seasonId, user.id);
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
