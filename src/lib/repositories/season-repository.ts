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
        // Dexie stores booleans and queries them consistently with boolean values
        return await db.seasons.where('isActive').equals(true).first();
    },

    async add(name: string) {
        const id = `s_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const newSeason: Season = { id, name, isActive: false };
        await db.seasons.add(newSeason);
        return newSeason;
    },

    async setActive(id: string) {
        return await db.transaction('rw', db.seasons, async () => {
            // Set all to false first
            await db.seasons.toCollection().modify({ isActive: false });
            // Set target to true
            await db.seasons.update(id, { isActive: true });
        });
    },

    async ensureDefaultSeason() {
        const seasonsCount = await db.seasons.count();
        if (seasonsCount === 0) {
            const defaultSeason = await this.add('2025/26');
            await this.setActive(defaultSeason.id);
            
            // Migrate any existing orphaned records to this default season
            await db.matches.toCollection().modify((m: any) => { if (!m.seasonId) m.seasonId = defaultSeason.id; });
            await db.players.toCollection().modify((p: any) => { if (!p.seasonId) p.seasonId = defaultSeason.id; });
            
            return { ...defaultSeason, isActive: true };
        }
        return await this.getActive();
    }
};
