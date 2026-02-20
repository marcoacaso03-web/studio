"use client";

import { create } from 'zustand';
import { matchRepository } from '@/lib/repositories/match-repository';
import { playerRepository } from '@/lib/repositories/player-repository';
import { aggregationRepository } from '@/lib/repositories/aggregation-repository';
import { lineupRepository } from '@/lib/repositories/lineup-repository';
import { eventRepository } from '@/lib/repositories/event-repository';
import { statsRepository } from '@/lib/repositories/stats-repository';
import { attendanceRepository } from '@/lib/repositories/attendance-repository';
import { useStatsStore } from './useStatsStore';
import type { Match, Player, MatchLineup, MatchEvent, PlayerMatchStats, MatchAttendance, AttendanceStatus } from '@/lib/types';

interface MatchDetailState {
    matchId: string | null;
    match: Match | null;
    allPlayers: Player[];
    events: MatchEvent[];
    lineup: MatchLineup | null;
    stats: PlayerMatchStats[];
    attendance: MatchAttendance[];
    loading: boolean;
    
    load: (matchId: string) => Promise<void>;
    updateMatch: (data: Partial<Omit<Match, 'id'>>) => Promise<void>;
    saveLineup: (lineup: MatchLineup) => Promise<void>;
    saveAllStats: (stats: PlayerMatchStats[]) => Promise<void>;
    addEvent: (event: Omit<MatchEvent, 'id'>) => Promise<void>;
    addEvents: (events: Omit<MatchEvent, 'id'>[]) => Promise<void>;
    deleteEvent: (eventId: string) => Promise<void>;
    syncAndPersistMinutes: () => Promise<void>;
    updateAttendance: (playerId: string, status: AttendanceStatus) => Promise<void>;
}

export const useMatchDetailStore = create<MatchDetailState>((set, get) => ({
    matchId: null,
    match: null,
    allPlayers: [],
    events: [],
    lineup: null,
    stats: [],
    attendance: [],
    loading: true,

    load: async (matchId) => {
        set({ loading: true, matchId, match: null, events: [], lineup: null, stats: [], attendance: [] });
        
        const match = await matchRepository.getById(matchId);
        if (!match) {
            set({ loading: false });
            return;
        }

        // Fetch players belonging specifically to the match's season
        const allPlayers = await playerRepository.getAll(match.seasonId);
        const matchEvents = await eventRepository.getForMatch(matchId);
        const matchLineup = await lineupRepository.getForMatch(matchId);
        const matchStats = await statsRepository.getForMatch(matchId);
        const matchAttendance = await attendanceRepository.getForMatch(matchId);

        set({ 
            match, 
            allPlayers,
            events: matchEvents,
            lineup: matchLineup || null,
            stats: matchStats,
            attendance: matchAttendance,
            loading: false 
        });

        await get().syncAndPersistMinutes();
    },

    syncAndPersistMinutes: async () => {
        const { match, lineup, events, matchId, allPlayers } = get();
        if (!match || !matchId) return;

        const duration = match.duration || 90;
        const halfTime = duration / 2;
        const pitchManTeam = match.isHome ? 'home' : 'away';

        // Calcoliamo le statistiche per TUTTI i giocatori della rosa della stagione
        // per permettere la registrazione di eventi (come cartellini) anche a chi non ha giocato.
        const rosterPlayerIds = allPlayers.map(p => p.id);

        const getAbsoluteMinute = (event: MatchEvent) => {
            if (event.period === '1T') return Math.min(event.minute, halfTime);
            if (event.period === '2T') return halfTime + Math.min(event.minute, halfTime);
            if (event.period === '1TS') return duration + event.minute;
            if (event.period === '2TS') return duration + 15 + event.minute;
            return event.minute;
        };

        const chronologicalEvents = [...events].sort((a, b) => {
            const periodOrder: Record<string, number> = { '1T': 1, '2T': 2, '1TS': 3, '2TS': 4 };
            if (periodOrder[a.period] !== periodOrder[b.period]) return periodOrder[a.period] - periodOrder[b.period];
            return a.minute - b.minute;
        });

        const newStats: PlayerMatchStats[] = rosterPlayerIds.map(playerId => {
            // Sincronizzazione automatica dei dati basata sugli eventi della cronaca
            const yellowCards = events.filter(e => e.type === 'yellow_card' && e.playerId === playerId && e.team === pitchManTeam).length;
            const redCards = events.filter(e => e.type === 'red_card' && e.playerId === playerId && e.team === pitchManTeam).length;
            const goals = events.filter(e => e.type === 'goal' && e.playerId === playerId && e.team === pitchManTeam).length;
            const assists = events.filter(e => e.type === 'goal' && e.assistPlayerId === playerId && e.team === pitchManTeam).length;

            let minutesPlayed = 0;
            const isStarter = lineup?.starters.includes(playerId);
            const isSubstitute = lineup?.substitutes.includes(playerId);

            // Calcolo minuti solo se il giocatore è stato in distinta
            if (lineup && (isStarter || isSubstitute)) {
                if (isStarter) {
                    const subOutEvent = chronologicalEvents.find(e => 
                        e.type === 'substitution' && 
                        e.subOutPlayerId === playerId && 
                        e.team === pitchManTeam
                    );
                    minutesPlayed = subOutEvent ? getAbsoluteMinute(subOutEvent) : duration;
                } else {
                    const subInEvent = chronologicalEvents.find(e => 
                        e.type === 'substitution' && 
                        e.playerId === playerId && 
                        e.team === pitchManTeam
                    );
                    if (subInEvent) {
                        const subInMin = getAbsoluteMinute(subInEvent);
                        const subOutEventLater = chronologicalEvents.find(e => 
                            e.type === 'substitution' && 
                            e.subOutPlayerId === playerId && 
                            e.team === pitchManTeam && 
                            getAbsoluteMinute(e) > subInMin
                        );
                        const endMin = subOutEventLater ? getAbsoluteMinute(subOutEventLater) : duration;
                        minutesPlayed = Math.max(0, endMin - subInMin);
                    }
                }
            }

            return {
                matchId: match.id,
                playerId,
                minutesPlayed,
                goals,
                assists,
                yellowCards,
                redCards
            };
        }).filter(stat => 
            // Salviamo solo se il giocatore ha partecipato alla gara o ha avuto un evento
            stat.minutesPlayed > 0 || 
            stat.goals > 0 || 
            stat.assists > 0 || 
            stat.yellowCards > 0 || 
            stat.redCards > 0 ||
            (lineup && (lineup.starters.includes(stat.playerId) || lineup.substitutes.includes(stat.playerId)))
        );

        for (const stat of newStats) {
            await statsRepository.upsert(matchId, stat.playerId, stat);
        }

        set({ stats: newStats });
        // Sincronizza le statistiche aggregate per la stagione corretta
        await aggregationRepository.syncAllPlayersStats(match.seasonId);
        // Forza il ricaricamento degli store delle statistiche globali
        useStatsStore.getState().loadStats();
    },

    saveAllStats: async (newStats) => {
        const { matchId, match } = get();
        if (!matchId || !match) return;

        for (const stat of newStats) {
            await statsRepository.upsert(matchId, stat.playerId, stat);
        }
        
        set({ stats: newStats });
        await aggregationRepository.syncAllPlayersStats(match.seasonId);
        useStatsStore.getState().loadStats();
    },

    updateAttendance: async (playerId: string, status: AttendanceStatus) => {
        const { matchId } = get();
        if (!matchId) return;

        await attendanceRepository.upsert(matchId, playerId, status);
        const updatedAttendance = await attendanceRepository.getForMatch(matchId);
        set({ attendance: updatedAttendance });
    },

    addEvent: async (eventData) => {
        const { matchId, match } = get();
        if (!matchId || !match) return;

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
        const { matchId, match } = get();
        if (!matchId || !match) return;

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
        const { matchId, match } = get();
        if (!matchId || !match) return;

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
