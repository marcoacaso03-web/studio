
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
        // Restituisce solo la prima, ma il sistema ora garantisce l'unicità tramite ensureDefaultSeason
        return snapshot.docs.length > 0 ? { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as Season : undefined;
    },

    async add(name: string, userId: string) {
        const db = getFirestore();
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
        
        // Trova tutte le stagioni attualmente attive per questo utente
        const seasonsRef = collection(db, 'teams');
        const q = query(seasonsRef, where('ownerId', '==', userId), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        
        // Disattiva tutte le stagioni attive tranne quella target (se già presente)
        snapshot.docs.forEach(docSnap => {
            if (docSnap.id !== id) {
                batch.update(docSnap.ref, { isActive: false, updatedAt: new Date().toISOString() });
            }
        });
        
        // Attiva la stagione target
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
        
        // Recupera tutte le stagioni per controllare l'integrità dell'attivazione
        const all = await this.getAll(userId);
        const activeSeasons = all.filter(s => s.isActive);
        
        // Caso ideale: esattamente una stagione attiva
        if (activeSeasons.length === 1) {
            return activeSeasons[0];
        }

        // Se ci sono stagioni ma nessuna o troppe sono attive, normalizziamo
        if (all.length > 0) {
            const targetId = activeSeasons.length > 1 ? activeSeasons[0].id : all[0].id;
            await this.setActive(targetId, userId);
            // Restituiamo l'oggetto aggiornato
            return { ...all.find(s => s.id === targetId)!, isActive: true };
        }
        
        // Se non esistono stagioni, creiamo quella predefinita
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
