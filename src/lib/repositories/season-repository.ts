
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
        const id = `s_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        // Usiamo ownerId per allinearci alle regole di sicurezza Firebase
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
        
        // Disattiva tutte le altre
        const all = await this.getAll(userId);
        all.forEach(s => {
            batch.update(doc(db, 'teams', s.id), { isActive: false, updatedAt: new Date().toISOString() });
        });
        
        // Attiva quella selezionata
        batch.update(doc(db, 'teams', id), { isActive: true, updatedAt: new Date().toISOString() });
        await batch.commit();
    },

    async delete(id: string) {
        const db = getFirestore();
        // Nota: Le regole di sicurezza verificheranno se l'utente è l'owner
        const docRef = doc(db, 'teams', id);
        return await writeBatch(db).delete(docRef).commit();
    },

    async ensureDefaultSeason(userId: string) {
        if (!userId) return undefined;
        const active = await this.getActive(userId);
        if (active) return active;
        
        const all = await this.getAll(userId);
        if (all.length === 0) {
            return await this.add('2025/26', userId).then(async s => {
                await this.setActive(s.id, userId);
                return { ...s, isActive: true };
            });
        }
        
        await this.setActive(all[0].id, userId);
        return { ...all[0], isActive: true };
    }
};
