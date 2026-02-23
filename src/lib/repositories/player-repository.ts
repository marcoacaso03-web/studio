
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
import { PlaceHolderImages } from '../placeholder-images';

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
    const q = query(playersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const players = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Player));
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
    const placeholder = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
    const id = `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    const newPlayer: Player = {
      id,
      userId: data.userId,
      seasonId: data.seasonId,
      name: data.name,
      role: data.role,
      avatarUrl: placeholder.imageUrl,
      imageHint: placeholder.imageHint,
      stats: { appearances: 0, goals: 0, assists: 0, avgMinutes: 0 },
    };

    await setDoc(doc(db, 'teams', data.seasonId, 'players', id), newPlayer);
    return newPlayer;
  },

  async bulkAdd(playersData: { name: string, role: Role }[], userId: string, seasonId: string) {
    const db = getFirestore();
    const batch = writeBatch(db);
    const timestamp = Date.now();
    
    const newPlayers: Player[] = playersData.map((p, index) => {
      const placeholder = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
      const id = `p_${timestamp}_${index}_${Math.random().toString(36).substr(2, 5)}`;
      const newPlayer: Player = {
        id,
        userId,
        seasonId,
        name: p.name,
        role: p.role,
        avatarUrl: placeholder.imageUrl,
        imageHint: placeholder.imageHint,
        stats: { appearances: 0, goals: 0, assists: 0, avgMinutes: 0 },
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
    await updateDoc(docRef, updates);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as Player : undefined;
  },

  async delete(id: string, seasonId: string) {
    const db = getFirestore();
    return await deleteDoc(doc(db, 'teams', seasonId, 'players', id));
  },
};
