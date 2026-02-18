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
     * Based on match lineups and chronological events.
     * @returns An array of objects, each containing a player's ID, name, and their aggregated stats.
     */
    async getAllPlayersAggregatedStats() {
        const players = await db.players.toArray();
        const allEvents = await db.matchEvents.toArray();
        const allLineups = await db.matchLineups.toArray();
        const completedMatches = await db.matches.where('status').equals('completed').toArray();
        const completedMatchIds = new Set(completedMatches.map(m => m.id));

        return players.map(player => {
            // Presenze: giocatore in formazione (starters o subs) in partite completate
            const appearances = allLineups.filter(lineup => {
                if (!completedMatchIds.has(lineup.matchId)) return false;
                return lineup.starters.includes(player.id) || lineup.substitutes.includes(player.id);
            }).length;

            const playerEvents = allEvents.filter(e => {
                if (!completedMatchIds.has(e.matchId)) return false;
                return e.playerId === player.id;
            });
            
            const goals = playerEvents.filter(e => e.type === 'goal').length;
            const assists = playerEvents.filter(e => e.type === 'assist').length;

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
