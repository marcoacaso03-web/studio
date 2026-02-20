
"use client";

import { create } from 'zustand';
import { aggregationRepository } from '@/lib/repositories/aggregation-repository';
import { useSeasonsStore } from './useSeasonsStore';
import { useAuthStore } from './useAuthStore';

interface TeamRecord {
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    matchesPlayed: number;
}

interface PlayerLeaderboardEntry {
    playerId: string;
    name: string;
    stats: {
        appearances: number;
        goals: number;
        assists: number;
        avgMinutes: number;
        yellowCards: number;
        redCards: number;
    };
}

interface TrendEntry {
    date: string;
    opponent: string;
    value: number;
}

interface IntervalEntry {
    name: string;
    value: number;
    fill: string;
}

interface StatsState {
    teamRecord: TeamRecord | null;
    homeRecord: TeamRecord | null;
    awayRecord: TeamRecord | null;
    playerLeaderboard: PlayerLeaderboardEntry[];
    teamTrend: TrendEntry[];
    goalsIntervals: IntervalEntry[];
    loading: boolean;
    loadStats: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
    teamRecord: null,
    homeRecord: null,
    awayRecord: null,
    playerLeaderboard: [],
    teamTrend: [],
    goalsIntervals: [],
    loading: true,
    loadStats: async () => {
        set({ loading: true });
        
        const user = useAuthStore.getState().user;
        const activeSeasonId = useSeasonsStore.getState().activeSeason?.id;

        if (!user) {
            set({ loading: false });
            return;
        }

        const [records, playerLeaderboard, teamTrend, goalsIntervals] = await Promise.all([
            aggregationRepository.getTeamRecord(user.id, activeSeasonId),
            aggregationRepository.getAllPlayersAggregatedStats(user.id, activeSeasonId),
            aggregationRepository.getTeamTrend(user.id, activeSeasonId),
            aggregationRepository.getGoalsByInterval(user.id, activeSeasonId)
        ]);
        
        const sortedLeaderboard = [...playerLeaderboard].sort((a, b) => {
            if (b.stats.goals !== a.stats.goals) {
                return b.stats.goals - a.stats.goals;
            }
            if (b.stats.assists !== a.stats.assists) {
                return b.stats.assists - a.stats.assists;
            }
            return b.stats.appearances - a.stats.appearances;
        });

        set({ 
            teamRecord: records.overall, 
            homeRecord: records.home,
            awayRecord: records.away,
            playerLeaderboard: sortedLeaderboard as PlayerLeaderboardEntry[], 
            teamTrend: teamTrend as TrendEntry[], 
            goalsIntervals,
            loading: false 
        });
    },
}));
