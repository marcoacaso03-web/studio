import { db } from '@/lib/db';

export const aggregationRepository = {
    /**
     * Aggregates team-level stats like wins, draws, losses, and goals from all completed matches.
     * @returns An object with the team's record.
     */
    async getTeamRecord() {
        const completedMatches = await db.matches.where('status').equals('completed').toArray();
        const record = {
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            matchesPlayed: 0,
        };

        for (const match of completedMatches) {
            if (!match.result) continue;
            
            record.matchesPlayed++;

            if (match.isHome) {
                record.goalsFor += match.result.home;
                record.goalsAgainst += match.result.away;
                if (match.result.home > match.result.away) record.wins++;
                else if (match.result.home < match.result.away) record.losses++;
                else record.draws++;
            } else { // Away match
                record.goalsFor += match.result.away;
                record.goalsAgainst += match.result.home;
                if (match.result.away > match.result.home) record.wins++;
                else if (match.result.away < match.result.home) record.losses++;
                else record.draws++;
            }
        }
        return record;
    },

    /**
     * Calculates and returns aggregated stats (appearances, goals, assists) for all players.
     * Appearances are based on match lineups (if present) or existing match stats.
     * @returns An array of objects, each containing a player's ID, name, and their aggregated stats.
     */
    async getAllPlayersAggregatedStats() {
        const players = await db.players.toArray();
        const allMatchStats = await db.playerMatchStats.toArray();
        const allLineups = await db.matchLineups.toArray();
        const completedMatches = await db.matches.where('status').equals('completed').toArray();
        const completedMatchIds = new Set(completedMatches.map(m => m.id));

        return players.map(player => {
            // Un giocatore ha una presenza se è in una formazione di una partita completata
            // o se ha registrato statistiche in una partita completata.
            const appearancesInLineups = allLineups.filter(lineup => {
                if (!completedMatchIds.has(lineup.matchId)) return false;
                return lineup.starters.includes(player.id) || lineup.substitutes.includes(player.id);
            }).length;

            const playerMatchStats = allMatchStats.filter(s => {
                if (!completedMatchIds.has(s.matchId)) return false;
                return s.playerId === player.id;
            });
            
            // Per evitare doppi conteggi tra lineup e stats manuali, usiamo un Set degli ID partita
            const matchIdsWithActivity = new Set([
                ...allLineups.filter(l => completedMatchIds.has(l.matchId) && (l.starters.includes(player.id) || l.substitutes.includes(player.id))).map(l => l.matchId),
                ...playerMatchStats.map(s => s.matchId)
            ]);

            const appearances = matchIdsWithActivity.size;
            const goals = playerMatchStats.reduce((sum, stat) => sum + stat.goals, 0);
            const assists = playerMatchStats.reduce((sum, stat) => sum + stat.assists, 0);

            return {
                playerId: player.id,
                name: player.name,
                stats: {
                    appearances,
                    goals,
                    assists,
                }
            };
        });
    },

    /**
     * Re-calculates and updates the aggregated `stats` property for all players in the database.
     * This is the method to call to keep player summary stats in sync.
     */
    async syncAllPlayersStats() {
        const allPlayerAggregatedStats = await this.getAllPlayersAggregatedStats();
        
        await db.transaction('rw', db.players, async () => {
            const updates = allPlayerAggregatedStats.map(({ playerId, stats }) => {
                return db.players.update(playerId, { stats });
            });
            await Promise.all(updates);
        });
    }
};
