import Dexie, { type EntityTable } from 'dexie';
import type { Player, Match, MatchAttendance, PlayerMatchStats } from './types';

class SquadraPlusDB extends Dexie {
    players!: EntityTable<Player, 'id'>;
    matches!: EntityTable<Match, 'id'>;
    matchAttendances!: EntityTable<MatchAttendance, ['matchId', 'playerId']>;
    playerMatchStats!: EntityTable<PlayerMatchStats, ['matchId', 'playerId']>;

    constructor() {
        super('SquadraPlusDB');
        // Incrementato alla versione 2 per aggiungere gli indici sui campi status
        // status in matches serve per getTeamRecord()
        // status in matchAttendances serve per getAllPlayersAggregatedStats()
        this.version(2).stores({
            players: 'id, name',
            matches: 'id, date, status',
            matchAttendances: '[matchId+playerId], status',
            playerMatchStats: '[matchId+playerId]',
        });
    }
}

export const db = new SquadraPlusDB();
