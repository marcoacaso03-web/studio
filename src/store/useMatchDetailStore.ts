"use client";

import { create } from 'zustand';
import { matchRepository } from '@/lib/repositories/match-repository';
import { attendanceRepository } from '@/lib/repositories/attendance-repository';
import { statsRepository } from '@/lib/repositories/stats-repository';
import { playerRepository } from '@/lib/repositories/player-repository';
import { aggregationRepository } from '@/lib/repositories/aggregation-repository';
import { lineupRepository } from '@/lib/repositories/lineup-repository';
import { useStatsStore } from './useStatsStore';
import type { Match, Player, MatchAttendance, PlayerMatchStats, AttendanceStatus, MatchLineup } from '@/lib/types';

interface MatchDetailState {
    matchId: string | null;
    match: Match | null;
    allPlayers: Player[];
    attendance: MatchAttendance[];
    stats: PlayerMatchStats[];
    lineup: MatchLineup | null;
    loading: boolean;
    
    load: (matchId: string) => Promise<void>;
    updateAttendance: (playerId: string, status: AttendanceStatus) => Promise<void>;
    saveAllStats: (allStats: PlayerMatchStats[]) => Promise<void>;
    updateResult: (home: number, away: number) => Promise<void>;
    saveLineup: (lineup: MatchLineup) => Promise<void>;
}

export const useMatchDetailStore = create<MatchDetailState>((set, get) => ({
    matchId: null,
    match: null,
    allPlayers: [],
    attendance: [],
    stats: [],
    lineup: null,
    loading: true,

    load: async (matchId) => {
        set({ loading: true, matchId, match: null, attendance: [], stats: [], lineup: null });
        
        const match = await matchRepository.getById(matchId);
        if (!match) {
            set({ loading: false });
            return;
        }

        const allPlayers = await playerRepository.getAll();
        const matchAttendance = await attendanceRepository.getForMatch(matchId);
        const matchStats = await statsRepository.getForMatch(matchId);
        const matchLineup = await lineupRepository.getForMatch(matchId);

        const fullAttendance = allPlayers.map(p => {
            const existing = matchAttendance.find(a => a.playerId === p.id);
            return existing || { matchId, playerId: p.id, status: 'in dubbio' };
        });

        const presentPlayerIds = new Set(fullAttendance.filter(a => a.status === 'presente').map(a => a.playerId));
        const presentPlayers = allPlayers.filter(p => presentPlayerIds.has(p.id));
        
        const fullStats = presentPlayers.map(p => {
            const existing = matchStats.find(s => s.playerId === p.id);
            return existing || { matchId, playerId: p.id, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
        });

        set({ 
            match, 
            allPlayers,
            attendance: fullAttendance, 
            stats: fullStats,
            lineup: matchLineup || null,
            loading: false 
        });
    },

    updateAttendance: async (playerId, status) => {
        const matchId = get().matchId;
        if (!matchId) return;

        await attendanceRepository.upsert(matchId, playerId, status);
        
        set(state => {
            const newAttendance = state.attendance.map(a => 
                a.playerId === playerId ? { ...a, status } : a
            );
            
            const presentPlayerIds = new Set(newAttendance.filter(a => a.status === 'presente').map(a => a.playerId));
            const presentPlayers = state.allPlayers.filter(p => presentPlayerIds.has(p.id));
            
            const newStats = presentPlayers.map(p => {
                const existing = state.stats.find(s => s.playerId === p.id);
                return existing || { matchId, playerId: p.id, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
            });

            return { attendance: newAttendance, stats: newStats };
        });
    },

    saveAllStats: async (allStatsToSave) => {
        const matchId = get().matchId;
        if (!matchId) return;

        await Promise.all(
            allStatsToSave.map(stat => 
                statsRepository.upsert(matchId, stat.playerId, {
                    goals: stat.goals,
                    assists: stat.assists,
                    yellowCards: stat.yellowCards,
                    redCards: stat.redCards,
                })
            )
        );

        await aggregationRepository.syncAllPlayersStats();
        useStatsStore.getState().loadStats();

        set({ stats: allStatsToSave });
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

    saveLineup: async (lineup) => {
        const matchId = get().matchId;
        if (!matchId) return;
        await lineupRepository.save({ ...lineup, matchId });
        set({ lineup });
    }
}));
