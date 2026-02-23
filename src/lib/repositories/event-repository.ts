
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  query,
  orderBy
} from 'firebase/firestore';
import type { MatchEvent } from '@/lib/types';

const periodOrder: Record<string, number> = {
    '1T': 1,
    '2T': 2,
    '1TS': 3,
    '2TS': 4
};

export const eventRepository = {
    async getForMatch(matchId: string, seasonId: string) {
        if (!matchId || !seasonId) return [];
        const db = getFirestore();
        const eventsRef = collection(db, 'teams', seasonId, 'matches', matchId, 'events');
        const q = query(eventsRef);
        const snapshot = await getDocs(q);
        const events = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as MatchEvent));
        
        return events.sort((a, b) => {
            if (periodOrder[b.period] !== periodOrder[a.period]) {
                return periodOrder[b.period] - periodOrder[a.period];
            }
            return b.minute - a.minute;
        });
    },

    async add(event: Omit<MatchEvent, 'id'>, seasonId: string) {
        const db = getFirestore();
        const eventsRef = collection(db, 'teams', seasonId, 'matches', event.matchId, 'events');
        const docRef = await addDoc(eventsRef, event);
        return { ...event, id: docRef.id };
    },

    async delete(id: string, matchId: string, seasonId: string) {
        const db = getFirestore();
        const docRef = doc(db, 'teams', seasonId, 'matches', matchId, 'events', id);
        return await deleteDoc(docRef);
    }
};
