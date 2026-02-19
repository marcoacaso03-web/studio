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
     * Returns the chronological trend of match results (1: win, 0: draw, -1: loss).
     */
    async getTeamTrend() {
        const completedMatches = await db.matches.where('status').equals('completed').sortBy('date');
        return completedMatches.map(match => {
            if (!match.result) return null;
            let value = 0;
            if (match.isHome) {
                if (match.result.home > match.result.away) value = 1;
                else if (match.result.home < match.result.away) value = -1;
            } else {
                if (match.result.away > match.result.home) value = 1;
                else if (match.result.away < match.result.home) value = -1;
            }
            return {
                date: new Date(match.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
                opponent: match.opponent,
                value
            };
        }).filter(Boolean);
    },

    /**
     * Aggregates goals scored by interval.
     */
    async getGoalsByInterval() {
        const events = await db.matchEvents.where('type').equals('goal').and(e => e.team === 'home').toArray();
        const intervals = {
            '1-30': 0,
            '31-60': 0,
            '61-90+': 0
        };

        events.forEach(event => {
            if (event.period === '1T') {
                if (event.minute <= 30) intervals['1-30']++;
                else intervals['31-60']++;
            } else {
                // 2T o TS sono considerati 61+
                intervals['61-90+']++;
            }
        });

        return [
            { name: '1-30\'', value: intervals['1-30'], fill: "hsl(var(--chart-1))" },
            { name: '31-60\'', value: intervals['31-60'], fill: "hsl(var(--chart-2))" },
            { name: '61-90\'+', value: intervals['61-90+'], fill: "hsl(var(--chart-3))" }
        ];
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
            
            // Gol: quando il giocatore è l'autore del goal
            const goals = playerEvents.filter(e => e.type === 'goal').length;
            
            // Assist: quando il giocatore è assistPlayerId in un evento goal (nuovo sistema)
            // o quando è l'autore di un evento assist (vecchio sistema/compatibilità)
            const newAssists = allEvents.filter(e => {
                if (!completedMatchIds.has(e.matchId)) return false;
                return e.type === 'goal' && e.assistPlayerId === player.id;
            }).length;
            
            const oldAssists = playerEvents.filter(e => e.type === 'assist').length;
            const assists = newAssists + oldAssists;

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
