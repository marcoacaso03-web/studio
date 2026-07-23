
import Dexie, { type EntityTable, type Table } from 'dexie';
import type { Player, Match, MatchAttendance, PlayerMatchStats, MatchLineup, MatchEvent, Season } from './types';

export type SyncMutation = {
  id?: number;
  collection: 'players' | 'matches' | 'matchAttendances' | 'playerMatchStats' | 'matchLineups' | 'matchEvents' | 'seasons';
  docId: string;
  action: 'add' | 'update' | 'delete' | 'upsert';
  payload: unknown;
  userId?: string;
  seasonId?: string;
  matchId?: string;
  playerId?: string;
  createdAt: number;
};

class PitchManDB extends Dexie {
    players!: EntityTable<Player, 'id'>;
    matches!: EntityTable<Match, 'id'>;
    matchAttendances!: Table<MatchAttendance, [string, string]>;
    playerMatchStats!: Table<PlayerMatchStats, [string, string]>;
    matchLineups!: EntityTable<MatchLineup, 'matchId'>;
    matchEvents!: EntityTable<MatchEvent, 'id'>;
    seasons!: EntityTable<Season, 'id'>;
    syncQueue!: EntityTable<SyncMutation, 'id'>;

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
        // Versione 10: Coda di sincronizzazione offline
        this.version(10).stores({
            syncQueue: '++id, collection, docId, createdAt'
        });
    }
}

export const db = new PitchManDB();
