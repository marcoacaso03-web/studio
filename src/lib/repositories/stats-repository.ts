import { db } from '@/lib/db';
import type { PlayerMatchStats } from '@/lib/types';

export type PlayerStatsUpdateData = Omit<PlayerMatchStats, 'matchId' | 'playerId'>;

export const statsRepository = {
    async getForMatch(matchId: string) {
        return await db.playerMatchStats.where({ matchId }).toArray();
    },

    async upsert(matchId: string, playerId: string, stats: PlayerStatsUpdateData) {
        const fullStats: PlayerMatchStats = { matchId, playerId, ...stats };
        // Dexie's put method works as an "upsert"
        await db.playerMatchStats.put(fullStats);
        return fullStats;
    }
};
