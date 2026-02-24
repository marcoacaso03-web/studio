
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import type { Match } from '@/lib/types';

export type MatchCreateData = Omit<Match, 'id' | 'result'> & { status?: Match['status'] };

export const matchRepository = {
  async getAll(userId: string, seasonId?: string) {
    if (!userId || !seasonId) return [];
    const db = getFirestore();
    const matchesRef = collection(db, 'teams', seasonId, 'matches');
    const q = query(matchesRef, where('teamOwnerId', '==', userId));
    const snapshot = await getDocs(q);
    const matches = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Match));
    return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
  
  async getById(id: string, seasonId: string) {
    if (!id || !seasonId) return undefined;
    const db = getFirestore();
    const docRef = doc(db, 'teams', seasonId, 'matches', id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as Match : undefined;
  },

  async add(data: MatchCreateData) {
    const db = getFirestore();
    // Genera un ID corto e leggibile (es: M-ABC12)
    const shortRandom = Math.random().toString(36).substring(2, 7).toUpperCase();
    const id = `M-${shortRandom}`;
    
    const newMatch: Match = {
      status: 'scheduled',
      ...data,
      id,
      teamOwnerId: data.userId,
      teamId: data.seasonId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'teams', data.seasonId, 'matches', id), newMatch);
    return newMatch;
  },

  async update(id: string, seasonId: string, updates: Partial<Omit<Match, 'id' | 'userId' | 'seasonId'>>) {
    const db = getFirestore();
    const docRef = doc(db, 'teams', seasonId, 'matches', id);
    const updatesWithTimestamp = { ...updates, updatedAt: new Date().toISOString() };
    await updateDoc(docRef, updatesWithTimestamp);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as Match : undefined;
  },

  async delete(id: string, seasonId: string) {
    const db = getFirestore();
    return await deleteDoc(doc(db, 'teams', seasonId, 'matches', id));
  },
};
