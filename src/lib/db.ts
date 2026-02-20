
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
        // Versione 9: Aggiunta tabella matchLineups mancante e supporto multi-utente
        this.version(9).stores({
            players: 'id, userId, seasonId, name',
            matches: 'id, userId, seasonId, date, status',
            matchAttendances: '[matchId+playerId], matchId, status',
            playerMatchStats: '[matchId+playerId], matchId',
            matchLineups: 'matchId',
            matchEvents: 'id, matchId, playerId, type',
            seasons: 'id, userId, isActive'
        });
    }
}

export const db = new PitchManDB();
