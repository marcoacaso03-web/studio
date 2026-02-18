"use client";

import { create } from 'zustand';
import { matchRepository } from '@/lib/repositories/match-repository';
import { statsRepository } from '@/lib/repositories/stats-repository';
import { playerRepository } from '@/lib/repositories/player-repository';
import { aggregationRepository } from '@/lib/repositories/aggregation-repository';
import { lineupRepository } from '@/lib/repositories/lineup-repository';
import { useStatsStore } from './useStatsStore';
import type { Match, Player, PlayerMatchStats, MatchLineup } from '@/lib/types';

interface MatchDetailState {
    matchId: string | null;
    match: Match | null;
    allPlayers: Player[];
    stats: PlayerMatchStats[];
    lineup: MatchLineup | null;
    loading: boolean;
    
    load: (matchId: string) => Promise<void>;
    saveAllStats: (allStats: PlayerMatchStats[]) => Promise<void>;
    updateResult: (home: number, away: number) => Promise<void>;
    saveLineup: (lineup: MatchLineup) => Promise<void>;
}

export const useMatchDetailStore = create<MatchDetailState>((set, get) => ({
    matchId: null,
    match: null,
    allPlayers: [],
    stats: [],
    lineup: null,
    loading: true,

    load: async (matchId) => {
        set({ loading: true, matchId, match: null, stats: [], lineup: null });
        
        const match = await matchRepository.getById(matchId);
        if (!match) {
            set({ loading: false });
            return;
        }

        const allPlayers = await playerRepository.getAll();
        const matchStats = await statsRepository.getForMatch(matchId);
        const matchLineup = await lineupRepository.getForMatch(matchId);

        // Se c'è una formazione, mostriamo solo i giocatori in formazione per le statistiche.
        // Se non c'è, mostriamo tutti per permettere l'inserimento libero.
        const activePlayerIds = matchLineup 
            ? new Set([...matchLineup.starters, ...matchLineup.substitutes].filter(id => !!id))
            : new Set(allPlayers.map(p => p.id));

        const playersForStats = allPlayers.filter(p => activePlayerIds.has(p.id));
        
        const fullStats = playersForStats.map(p => {
            const existing = matchStats.find(s => s.playerId === p.id);
            return existing || { matchId, playerId: p.id, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
        });

        set({ 
            match, 
            allPlayers,
            stats: fullStats,
            lineup: matchLineup || null,
            loading: false 
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
        
        // Quando salviamo la formazione, aggiorniamo anche la lista dei giocatori disponibili per le statistiche
        const allPlayers = get().allPlayers;
        const activePlayerIds = new Set([...lineup.starters, ...lineup.substitutes].filter(id => !!id));
        const playersForStats = allPlayers.filter(p => activePlayerIds.has(p.id));
        
        const currentStats = get().stats;
        const newStats = playersForStats.map(p => {
            const existing = currentStats.find(s => s.playerId === p.id);
            return existing || { matchId, playerId: p.id, goals: 0, assists: 0, yellowCards: 0, redCards: 0 };
        });

        set({ lineup, stats: newStats });
    }
}));
