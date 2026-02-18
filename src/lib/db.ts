import Dexie, { type EntityTable } from 'dexie';
import type { Player, Match, MatchAttendance, PlayerMatchStats, MatchLineup } from './types';

class SquadraPlusDB extends Dexie {
    players!: EntityTable<Player, 'id'>;
    matches!: EntityTable<Match, 'id'>;
    matchAttendances!: EntityTable<MatchAttendance, ['matchId', 'playerId']>;
    playerMatchStats!: EntityTable<PlayerMatchStats, ['matchId', 'playerId']>;
    matchLineups!: EntityTable<MatchLineup, 'matchId'>;

    constructor() {
        super('SquadraPlusDB');
        // Versione 3: aggiunto supporto per matchLineups
        this.version(3).stores({
            players: 'id, name',
            matches: 'id, date, status',
            matchAttendances: '[matchId+playerId], status',
            playerMatchStats: '[matchId+playerId]',
            matchLineups: 'matchId',
        });
        this.version(2).stores({
            players: 'id, name',
            matches: 'id, date, status',
            matchAttendances: '[matchId+playerId], status',
            playerMatchStats: '[matchId+playerId]',
        });
    }
}

export const db = new SquadraPlusDB();
