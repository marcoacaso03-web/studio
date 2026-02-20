
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

    async delete(id: string) {
        // Eliminiamo tutti i dati associati alla stagione per non lasciare orfani
        return await db.transaction('rw', [db.seasons, db.players, db.matches, db.matchAttendances, db.playerMatchStats, db.matchLineups, db.matchEvents], async () => {
            const matches = await db.matches.where('seasonId').equals(id).toArray();
            const matchIds = matches.map(m => m.id);
            
            // Pulizia tabelle relazionali per ogni partita della stagione
            if (matchIds.length > 0) {
                await db.matchAttendances.where('matchId').anyOf(matchIds).delete();
                await db.playerMatchStats.where('matchId').anyOf(matchIds).delete();
                await db.matchLineups.where('matchId').anyOf(matchIds).delete();
                await db.matchEvents.where('matchId').anyOf(matchIds).delete();
            }
            
            // Pulizia record principali
            await db.matches.where('seasonId').equals(id).delete();
            await db.players.where('seasonId').equals(id).delete();
            await db.seasons.delete(id);
        });
    },

    async ensureDefaultSeason(userId: string) {
        if (!userId) return undefined;
        
        // Utilizziamo una transazione per prevenire race conditions durante l'inizializzazione
        return await db.transaction('rw', db.seasons, async () => {
            const existingSeasons = await db.seasons.where('userId').equals(userId).toArray();
            
            if (existingSeasons.length === 0) {
                const id = `s_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                const defaultSeason: Season = { id, userId, name: '2025/26', isActive: true };
                await db.seasons.add(defaultSeason);
                return defaultSeason;
            }
            
            // Se esistono stagioni ma nessuna è attiva, impostiamo la prima come attiva
            const active = existingSeasons.find(s => s.isActive === true);
            if (!active && existingSeasons.length > 0) {
                const firstId = existingSeasons[0].id;
                await db.seasons.update(firstId, { isActive: true });
                return { ...existingSeasons[0], isActive: true };
            }
            
            return active;
        });
    },

    async resetUser(userId: string) {
        if (!userId) return;
        return await db.transaction('rw', [db.seasons, db.players, db.matches, db.matchAttendances, db.playerMatchStats, db.matchLineups, db.matchEvents], async () => {
            // Trova tutte le partite dell'utente per pulire le tabelle dipendenti
            const matches = await db.matches.where('userId').equals(userId).toArray();
            const matchIds = matches.map(m => m.id);
            
            if (matchIds.length > 0) {
                await db.matchAttendances.where('matchId').anyOf(matchIds).delete();
                await db.playerMatchStats.where('matchId').anyOf(matchIds).delete();
                await db.matchLineups.where('matchId').anyOf(matchIds).delete();
                await db.matchEvents.where('matchId').anyOf(matchIds).delete();
            }
            
            // Elimina i record primari dell'utente
            await db.matches.where('userId').equals(userId).delete();
            await db.players.where('userId').equals(userId).delete();
            await db.seasons.where('userId').equals(userId).delete();
            
            // Ricrea la stagione predefinita atomica
            const id = `s_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            const defaultSeason: Season = { id, userId, name: '2025/26', isActive: true };
            await db.seasons.add(defaultSeason);
        });
    }
};
