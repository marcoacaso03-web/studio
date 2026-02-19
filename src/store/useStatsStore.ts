
"use client";

import { create } from 'zustand';
import { aggregationRepository } from '@/lib/repositories/aggregation-repository';

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
    playerLeaderboard: PlayerLeaderboardEntry[];
    teamTrend: TrendEntry[];
    goalsIntervals: IntervalEntry[];
    loading: boolean;
    loadStats: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
    teamRecord: null,
    playerLeaderboard: [],
    teamTrend: [],
    goalsIntervals: [],
    loading: true,
    loadStats: async () => {
        set({ loading: true });
        const [teamRecord, playerLeaderboard, teamTrend, goalsIntervals] = await Promise.all([
            aggregationRepository.getTeamRecord(),
            aggregationRepository.getAllPlayersAggregatedStats(),
            aggregationRepository.getTeamTrend(),
            aggregationRepository.getGoalsByInterval()
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
            teamRecord, 
            playerLeaderboard: sortedLeaderboard as PlayerLeaderboardEntry[], 
            teamTrend: teamTrend as TrendEntry[], 
            goalsIntervals,
            loading: false 
        });
    },
}));
