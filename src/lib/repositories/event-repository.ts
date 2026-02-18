import { db } from '@/lib/db';
import type { MatchEvent } from '@/lib/types';

export const eventRepository = {
    async getForMatch(matchId: string) {
        return await db.matchEvents.where({ matchId }).sortBy('minute');
    },

    async add(event: Omit<MatchEvent, 'id'>) {
        const id = `e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newEvent = { ...event, id };
        await db.matchEvents.add(newEvent);
        return newEvent;
    },

    async delete(id: string) {
        return await db.matchEvents.delete(id);
    }
};
