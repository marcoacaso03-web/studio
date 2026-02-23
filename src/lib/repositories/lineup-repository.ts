
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import type { MatchLineup } from '@/lib/types';

export const lineupRepository = {
    async getForMatch(matchId: string, seasonId: string) {
        if (!matchId || !seasonId) return undefined;
        const db = getFirestore();
        const docRef = doc(db, 'teams', seasonId, 'matches', matchId, 'lineup', 'primary');
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? snapshot.data() as MatchLineup : undefined;
    },

    async save(lineup: MatchLineup, seasonId: string) {
        if (!lineup.matchId || !seasonId) return lineup;
        const db = getFirestore();
        const docRef = doc(db, 'teams', seasonId, 'matches', lineup.matchId, 'lineup', 'primary');
        await setDoc(docRef, lineup);
        return lineup;
    }
};
