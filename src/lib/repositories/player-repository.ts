
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
  where,
  writeBatch
} from 'firebase/firestore';
import type { Player, Role } from '@/lib/types';
import { PlayerSchema } from '@/lib/schemas';

export type PlayerCreateData = {
    name: string;
    role: Role;
    seasonId: string;
    userId: string;
}

export const playerRepository = {
  async getAll(userId: string, seasonId?: string) {
    if (!userId || !seasonId) return [];
    const db = getFirestore();
    const playersRef = collection(db, 'teams', seasonId, 'players');
    const q = query(playersRef, where('teamOwnerId', '==', userId));
    const snapshot = await getDocs(q);
    const players = snapshot.docs.map(doc => {
      const data = { ...doc.data(), id: doc.id };
      const parsed = PlayerSchema.safeParse(data);
      if (!parsed.success) {
        console.error("Schema validation failed for Player:", parsed.error);
        return data as Player;
      }
      return parsed.data;
    });
    return players.sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string, seasonId: string) {
    if (!id || !seasonId) return undefined;
    const db = getFirestore();
    const docRef = doc(db, 'teams', seasonId, 'players', id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as Player : undefined;
  },

  async add(data: PlayerCreateData) {
    const db = getFirestore();
    // Genera un ID corto e leggibile (es: P-XYZ78)
    const shortRandom = Math.random().toString(36).substring(2, 7).toUpperCase();
    const id = `P-${shortRandom}`;
    
    const newPlayer: Player = {
      id,
      userId: data.userId,
      teamOwnerId: data.userId,
      teamId: data.seasonId,
      seasonId: data.seasonId,
      name: data.name.toUpperCase(),
      role: data.role,
      stats: { appearances: 0, goals: 0, assists: 0, avgMinutes: 0 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'teams', data.seasonId, 'players', id), newPlayer);
    return newPlayer;
  },

  async bulkAdd(playersData: { name: string, role: Role }[], userId: string, seasonId: string) {
    const db = getFirestore();
    const batch = writeBatch(db);
    
    const newPlayers: Player[] = playersData.map((p) => {
      const shortRandom = Math.random().toString(36).substring(2, 7).toUpperCase();
      const id = `P-${shortRandom}`;
      const newPlayer: Player = {
        id,
        userId,
        teamOwnerId: userId,
        teamId: seasonId,
        seasonId,
        name: p.name.toUpperCase(),
        role: p.role,
        stats: { appearances: 0, goals: 0, assists: 0, avgMinutes: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = doc(db, 'teams', seasonId, 'players', id);
      batch.set(docRef, newPlayer);
      return newPlayer;
    });

    await batch.commit();
    return newPlayers;
  },

  async update(id: string, seasonId: string, updates: Partial<Omit<Player, 'id' | 'userId' | 'seasonId'>>) {
    const db = getFirestore();
    const docRef = doc(db, 'teams', seasonId, 'players', id);
    const updatesWithTimestamp = { 
      ...updates, 
      ...(updates.name && { name: updates.name.toUpperCase() }),
      updatedAt: new Date().toISOString() 
    };
    await updateDoc(docRef, updatesWithTimestamp);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as Player : undefined;
  },

  async delete(id: string, seasonId: string) {
    const db = getFirestore();
    return await deleteDoc(doc(db, 'teams', seasonId, 'players', id));
  },
};
