
import Dexie, { type EntityTable } from 'dexie';
import type { Player, Match, MatchAttendance, PlayerMatchStats, MatchLineup, MatchEvent, Season } from './types';

class PitchManDB extends Dexie {
    players!: EntityTable<Player, 'id'>;
    matches!: EntityTable<Match, 'id'>;
    matchAttendances!: EntityTable<MatchAttendance, ['matchId', 'playerId']>;
    playerMatchStats!: EntityTable<PlayerMatchStats, ['matchId', 'playerId']>;
    matchLineups!: EntityTable<MatchLineup, 'matchId'>;
    matchEvents!: EntityTable<MatchEvent, 'id'>;
    seasons!: EntityTable<Season, 'id'>;

    constructor() {
        super('PitchManDB');
        // Versione 8: aggiunto userId a tutte le tabelle principali per isolamento multi-utente
        this.version(8).stores({
            players: 'id, userId, seasonId, name',
            matches: 'id, userId, seasonId, date, status',
            matchAttendances: '[matchId+playerId], matchId, status',
            playerMatchStats: '[matchId+playerId], matchId',
            matchEvents: 'id, matchId, playerId, type',
            seasons: 'id, userId, isActive'
        });
    }
}

export const db = new PitchManDB();
