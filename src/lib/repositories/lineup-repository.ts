import { db } from '@/lib/db';
import type { MatchLineup } from '@/lib/types';

export const lineupRepository = {
    async getForMatch(matchId: string) {
        return await db.matchLineups.get(matchId);
    },

    async save(lineup: MatchLineup) {
        await db.matchLineups.put(lineup);
        return lineup;
    }
};
