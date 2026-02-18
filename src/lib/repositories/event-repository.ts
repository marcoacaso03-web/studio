import { db } from '@/lib/db';
import type { MatchEvent } from '@/lib/types';

const periodOrder: Record<string, number> = {
    '1T': 1,
    '2T': 2,
    '1TS': 3,
    '2TS': 4
};

export const eventRepository = {
    async getForMatch(matchId: string) {
        const events = await db.matchEvents.where({ matchId }).toArray();
        // Ordinamento decrescente: Periodo (2TS -> 1T) e poi Minuto (alto -> basso)
        return events.sort((a, b) => {
            if (periodOrder[b.period] !== periodOrder[a.period]) {
                return periodOrder[b.period] - periodOrder[a.period];
            }
            return b.minute - a.minute;
        });
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
