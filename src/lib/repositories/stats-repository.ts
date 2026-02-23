
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  query
} from 'firebase/firestore';
import type { PlayerMatchStats } from '@/lib/types';

export type PlayerStatsUpdateData = Omit<PlayerMatchStats, 'matchId' | 'playerId'>;

export const statsRepository = {
    async getForMatch(matchId: string, seasonId: string) {
        if (!matchId || !seasonId) return [];
        const db = getFirestore();
        const statsRef = collection(db, 'teams', seasonId, 'matches', matchId, 'stats');
        const snapshot = await getDocs(query(statsRef));
        return snapshot.docs.map(doc => ({ ...doc.data(), playerId: doc.id } as PlayerMatchStats));
    },

    async upsert(matchId: string, seasonId: string, playerId: string, stats: PlayerStatsUpdateData) {
        const db = getFirestore();
        const docRef = doc(db, 'teams', seasonId, 'matches', matchId, 'stats', playerId);
        const fullStats: PlayerMatchStats = { matchId, playerId, ...stats };
        await setDoc(docRef, fullStats);
        return fullStats;
    }
};
