
import { db } from '@/lib/db';
import type { Season } from '@/lib/types';

export const seasonRepository = {
    async getAll(userId: string) {
        if (!userId) return [];
        return await db.seasons.where('userId').equals(userId).toArray();
    },

    async getById(id: string) {
        if (!id) return undefined;
        return await db.seasons.get(id);
    },

    async getActive(userId: string) {
        if (!userId) return undefined;
        // Filtriamo linearmente per isActive per evitare DataError con chiavi booleane indicizzate
        const seasons = await db.seasons.where('userId').equals(userId).toArray();
        return seasons.find(s => s.isActive === true);
    },

    async add(name: string, userId: string) {
        const id = `s_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const newSeason: Season = { id, userId, name, isActive: false };
        await db.seasons.add(newSeason);
        return newSeason;
    },

    async setActive(id: string, userId: string) {
        if (!userId) return;
        return await db.transaction('rw', db.seasons, async () => {
            // Disattiva tutte le stagioni dell'utente specifico
            await db.seasons.where('userId').equals(userId).modify({ isActive: false });
            // Attiva quella selezionata
            await db.seasons.update(id, { isActive: true });
        });
    },

    async ensureDefaultSeason(userId: string) {
        if (!userId) return undefined;
        const seasonsCount = await db.seasons.where('userId').equals(userId).count();
        if (seasonsCount === 0) {
            const defaultSeason = await this.add('2025/26', userId);
            await this.setActive(defaultSeason.id, userId);
            return { ...defaultSeason, isActive: true };
        }
        return await this.getActive(userId);
    }
};
