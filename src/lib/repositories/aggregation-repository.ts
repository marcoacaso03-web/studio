import { db } from '@/lib/db';

export const aggregationRepository = {
    /**
     * Aggregates team-level stats like wins, draws, losses, and goals from all completed matches.
     * Returns detailed stats for overall, home, and away.
     */
    async getTeamRecord(userId: string, seasonId?: string) {
        if (!userId) return this.processMatchesRecord([]);

        let query = db.matches.where('userId').equals(userId);
        let completedMatches: any[];
        
        if (seasonId) {
            completedMatches = await query.and(m => m.seasonId === seasonId && m.status === 'completed').toArray();
        } else {
            completedMatches = await query.and(m => m.status === 'completed').toArray();
        }
        
        return this.processMatchesRecord(completedMatches);
    },

    processMatchesRecord(completedMatches: any[]) {
        const createRecord = () => ({
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            matchesPlayed: 0,
        });

        const record = {
            overall: createRecord(),
            home: createRecord(),
            away: createRecord()
        };

        for (const match of completedMatches) {
            if (!match.result) continue;
            
            const target = match.isHome ? record.home : record.away;
            record.overall.matchesPlayed++;
            target.matchesPlayed++;

            if (match.isHome) {
                record.overall.goalsFor += match.result.home;
                record.overall.goalsAgainst += match.result.away;
                target.goalsFor += match.result.home;
                target.goalsAgainst += match.result.away;
                
                if (match.result.home > match.result.away) { record.overall.wins++; target.wins++; }
                else if (match.result.home < match.result.away) { record.overall.losses++; target.losses++; }
                else { record.overall.draws++; target.draws++; }
            } else {
                record.overall.goalsFor += match.result.away;
                record.overall.goalsAgainst += match.result.home;
                target.goalsFor += match.result.away;
                target.goalsAgainst += match.result.home;
                
                if (match.result.away > match.result.home) { record.overall.wins++; target.wins++; }
                else if (match.result.away < match.result.home) { record.overall.losses++; target.losses++; }
                else { record.overall.draws++; target.draws++; }
            }
        }
        return record;
    },

    /**
     * Returns the chronological trend of match results.
     */
    async getTeamTrend(userId: string, seasonId?: string) {
        if (!userId) return [];

        let query = db.matches.where('userId').equals(userId);
        let completedMatches: any[];
        
        if (seasonId) {
            completedMatches = await query.and(m => m.seasonId === seasonId && m.status === 'completed').toArray();
        } else {
            completedMatches = await query.and(m => m.status === 'completed').toArray();
        }

        completedMatches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
     * Aggregates goals scored by interval for PitchMan.
     */
    async getGoalsByInterval(userId: string, seasonId?: string) {
        if (!userId) return [];

        let matchQuery = db.matches.where('userId').equals(userId);
        const completedMatches = seasonId
            ? await matchQuery.and(m => m.seasonId === seasonId && m.status === 'completed').toArray()
            : await matchQuery.and(m => m.status === 'completed').toArray();

        const completedMatchIds = new Set(completedMatches.map(m => m.id));
        const allEvents = await db.matchEvents.where('type').equals('goal').toArray();
        
        const intervals = {
            '1-30': 0,
            '31-60': 0,
            '61-90+': 0
        };

        allEvents.forEach(event => {
            if (!completedMatchIds.has(event.matchId)) return;
            
            const match = completedMatches.find(m => m.id === event.matchId);
            if (!match) return;

            const isPitchManGoal = match.isHome ? event.team === 'home' : event.team === 'away';
            
            if (isPitchManGoal) {
                if (event.period === '1T') {
                    if (event.minute <= 30) intervals['1-30']++;
                    else intervals['31-60']++;
                } else {
                    intervals['61-90+']++;
                }
            }
        });

        return [
            { name: '1-30\'', value: intervals['1-30'], fill: "hsl(var(--chart-1))" },
            { name: '31-60\'', value: intervals['31-60'], fill: "hsl(var(--chart-2))" },
            { name: '61-90\'+', value: intervals['61-90+'], fill: "hsl(var(--chart-3))" }
        ];
    },

    /**
     * Calculates and returns aggregated stats for all players.
     */
    async getAllPlayersAggregatedStats(userId: string, seasonId?: string) {
        if (!userId) return [];

        const players = seasonId 
            ? await db.players.where('userId').equals(userId).and(p => p.seasonId === seasonId).toArray()
            : await db.players.where('userId').equals(userId).toArray();

        let matchQuery = db.matches.where('userId').equals(userId).and(m => m.status === 'completed');
        const completedMatches = seasonId
            ? await matchQuery.and(m => m.seasonId === seasonId).toArray()
            : await matchQuery.toArray();

        const completedMatchIds = new Set(completedMatches.map(m => m.id));
        
        const allEvents = (await db.matchEvents.toArray()).filter(e => completedMatchIds.has(e.matchId));
        const allLineups = (await db.matchLineups.toArray()).filter(l => completedMatchIds.has(l.matchId));
        const allStats = (await db.playerMatchStats.toArray()).filter(s => completedMatchIds.has(s.matchId));

        return players.map(player => {
            const matchInvolvement = allLineups.filter(lineup => {
                return lineup.starters.includes(player.id) || lineup.substitutes.includes(player.id);
            });
            const appearances = matchInvolvement.length;

            const playerEvents = allEvents.filter(e => e.playerId === player.id);
            const playerStats = allStats.filter(s => s.playerId === player.id);

            const totalMinutes = playerStats.reduce((acc, s) => acc + (s.minutesPlayed || 0), 0);
            const yellowCards = playerStats.reduce((acc, s) => acc + (s.yellowCards || 0), 0);
            const redCards = playerStats.reduce((acc, s) => acc + (s.redCards || 0), 0);
            
            const avgMinutes = appearances > 0 ? Math.round(totalMinutes / appearances) : 0;
            const goals = playerEvents.filter(e => e.type === 'goal').length;
            
            const assists = allEvents.filter(e => e.type === 'goal' && e.assistPlayerId === player.id).length;

            return {
                playerId: player.id,
                name: player.name,
                stats: {
                    appearances,
                    goals,
                    assists,
                    avgMinutes,
                    yellowCards,
                    redCards
                }
            };
        });
    },

    async syncAllPlayersStats(userId: string, seasonId?: string) {
        if (!userId) return;
        const allPlayerAggregatedStats = await this.getAllPlayersAggregatedStats(userId, seasonId);
        
        await db.transaction('rw', db.players, async () => {
            const updates = allPlayerAggregatedStats.map(({ playerId, stats }) => {
                return db.players.update(playerId, { stats });
            });
            await Promise.all(updates);
        });
    }
};
