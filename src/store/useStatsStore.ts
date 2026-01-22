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
    };
}

interface StatsState {
    teamRecord: TeamRecord | null;
    playerLeaderboard: PlayerLeaderboardEntry[];
    loading: boolean;
    loadStats: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
    teamRecord: null,
    playerLeaderboard: [],
    loading: true,
    loadStats: async () => {
        set({ loading: true });
        const [teamRecord, playerLeaderboard] = await Promise.all([
            aggregationRepository.getTeamRecord(),
            aggregationRepository.getAllPlayersAggregatedStats()
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

        set({ teamRecord, playerLeaderboard: sortedLeaderboard, loading: false });
    },
}));
