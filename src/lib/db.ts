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
        // Versione 6: aggiunta seasonId alla tabella players per isolamento totale
        this.version(6).stores({
            players: 'id, seasonId, name',
            matches: 'id, seasonId, date, status',
            matchAttendances: '[matchId+playerId], status',
            playerMatchStats: '[matchId+playerId]',
            matchLineups: 'matchId',
            matchEvents: 'id, matchId, playerId, type',
            seasons: 'id, isActive'
        });
        this.version(5).stores({
            players: 'id, name',
            matches: 'id, seasonId, date, status',
            matchAttendances: '[matchId+playerId], status',
            playerMatchStats: '[matchId+playerId]',
            matchLineups: 'matchId',
            matchEvents: 'id, matchId, playerId, type',
            seasons: 'id, isActive'
        });
        this.version(4).stores({
            players: 'id, name',
            matches: 'id, date, status',
            matchAttendances: '[matchId+playerId], status',
            playerMatchStats: '[matchId+playerId]',
            matchLineups: 'matchId',
            matchEvents: 'id, matchId, playerId, type',
        });
        this.version(3).stores({
            players: 'id, name',
            matches: 'id, date, status',
            matchAttendances: '[matchId+playerId], status',
            playerMatchStats: '[matchId+playerId]',
            matchLineups: 'matchId',
        });
    }
}

export const db = new PitchManDB();
