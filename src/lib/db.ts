import Dexie, { type EntityTable } from 'dexie';
import type { Player, Match, MatchAttendance, PlayerMatchStats } from './types';

class SquadraPlusDB extends Dexie {
    players!: EntityTable<Player, 'id'>;
    matches!: EntityTable<Match, 'id'>;
    matchAttendances!: EntityTable<MatchAttendance, ['matchId', 'playerId']>;
    playerMatchStats!: EntityTable<PlayerMatchStats, ['matchId', 'playerId']>;

    constructor() {
        super('SquadraPlusDB');
        this.version(1).stores({
            players: 'id, name',
            matches: 'id, date',
            matchAttendances: '[matchId+playerId]',
            playerMatchStats: '[matchId+playerId]',
        });
    }
}

export const db = new SquadraPlusDB();
