import { db } from '@/lib/db';
import type { Season } from '@/lib/types';

export const seasonRepository = {
    async getAll() {
        return await db.seasons.toArray();
    },

    async getById(id: string) {
        return await db.seasons.get(id);
    },

    async getActive() {
        return await db.seasons.where('isActive').equals(1).first();
    },

    async add(name: string) {
        const id = `s_${Date.now()}`;
        const newSeason: Season = { id, name, isActive: false };
        await db.seasons.add(newSeason);
        return newSeason;
    },

    async setActive(id: string) {
        return await db.transaction('rw', db.seasons, async () => {
            await db.seasons.toCollection().modify({ isActive: false });
            await db.seasons.update(id, { isActive: true });
        });
    },

    async ensureDefaultSeason() {
        const seasons = await db.seasons.count();
        if (seasons === 0) {
            const defaultSeason = await this.add('2024/25');
            await this.setActive(defaultSeason.id);
            
            // Migra le partite esistenti senza seasonId
            await db.matches.toCollection().modify({ seasonId: defaultSeason.id });
            return defaultSeason;
        }
        return await this.getActive();
    }
};
