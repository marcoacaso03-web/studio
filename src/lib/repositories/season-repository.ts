
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  writeBatch,
  getFirestore
} from 'firebase/firestore';
import type { Season } from '@/lib/types';

export const seasonRepository = {
    async getAll(userId: string) {
        if (!userId) return [];
        const db = getFirestore();
        const seasonsRef = collection(db, 'teams');
        const q = query(seasonsRef, where('ownerId', '==', userId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Season));
    },

    async getById(id: string) {
        if (!id) return undefined;
        const db = getFirestore();
        const docRef = doc(db, 'teams', id);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } as Season : undefined;
    },

    async getActive(userId: string) {
        if (!userId) return undefined;
        const db = getFirestore();
        const seasonsRef = collection(db, 'teams');
        const q = query(seasonsRef, where('ownerId', '==', userId), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        return snapshot.docs.length > 0 ? { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as Season : undefined;
    },

    async add(name: string, userId: string) {
        const db = getFirestore();
        // Genera un ID corto e leggibile
        const shortRandom = Math.random().toString(36).substring(2, 7).toUpperCase();
        const id = `S-${shortRandom}`;
        
        const newSeason: Season = { 
            id, 
            userId, 
            ownerId: userId, 
            name, 
            isActive: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'teams', id), newSeason);
        return newSeason;
    },

    async setActive(id: string, userId: string) {
        if (!userId) return;
        const db = getFirestore();
        const batch = writeBatch(db);
        
        const all = await this.getAll(userId);
        all.forEach(s => {
            if (s.id !== id) {
                batch.update(doc(db, 'teams', s.id), { isActive: false, updatedAt: new Date().toISOString() });
            }
        });
        
        batch.update(doc(db, 'teams', id), { isActive: true, updatedAt: new Date().toISOString() });
        await batch.commit();
    },

    async delete(id: string) {
        const db = getFirestore();
        const docRef = doc(db, 'teams', id);
        return await writeBatch(db).delete(docRef).commit();
    },

    async ensureDefaultSeason(userId: string) {
        if (!userId) return undefined;
        
        // Prima verifichiamo se esiste già una stagione attiva
        const active = await this.getActive(userId);
        if (active) return active;
        
        // Se non c'è una stagione attiva, verifichiamo se ce ne sono di esistenti
        const all = await this.getAll(userId);
        if (all.length > 0) {
            // Se ne esistono, impostiamo la prima come attiva
            const firstSeasonId = all[0].id;
            await this.setActive(firstSeasonId, userId);
            return { ...all[0], isActive: true };
        }
        
        // Se non esiste assolutamente nulla, creiamo la stagione predefinita
        // Usiamo un ID basato sul userId per evitare duplicazioni da chiamate concorrenti
        const defaultId = `S-DEFAULT-${userId.substring(0, 6).toUpperCase()}`;
        const db = getFirestore();
        
        const initialSeason: Season = { 
            id: defaultId, 
            userId, 
            ownerId: userId, 
            name: '2025/26', 
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'teams', defaultId), initialSeason);
        return initialSeason;
    }
};
