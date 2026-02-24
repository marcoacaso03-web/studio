import { matchRepository } from './match-repository';
import { playerRepository } from './player-repository';
import { eventRepository } from './event-repository';
import { statsRepository } from './stats-repository';
import { lineupRepository } from './lineup-repository';
import type { Match, Player, MatchEvent, PlayerMatchStats } from '../types';

export interface TeamStatsRecord {
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    matchesPlayed: number;
}

export interface FullTeamRecord {
    overall: TeamStatsRecord;
    home: TeamStatsRecord;
    away: TeamStatsRecord;
}

export const aggregationRepository = {
    async getTeamRecord(userId: string, seasonId?: string): Promise<FullTeamRecord> {
        if (!userId || !seasonId) return this.processMatchesRecord([]);
        const matches = await matchRepository.getAll(userId, seasonId);
        const completedMatches = matches.filter(m => m.status === 'completed');
        return this.processMatchesRecord(completedMatches);
    },

    processMatchesRecord(completedMatches: Match[]): FullTeamRecord {
        const createRecord = (): TeamStatsRecord => ({
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            matchesPlayed: 0,
        });

        const record: FullTeamRecord = {
            overall: createRecord(),
            home: createRecord(),
            away: createRecord()
        };

        for (const match of completedMatches) {
            if (!match.result) continue;
            
            const target = match.isHome ? record.home : record.away;
            record.overall.matchesPlayed++;
            target.matchesPlayed++;

            const homeGoals = match.result.home;
            const awayGoals = match.result.away;

            if (match.isHome) {
                record.overall.goalsFor += homeGoals;
                record.overall.goalsAgainst += awayGoals;
                target.goalsFor += homeGoals;
                target.goalsAgainst += awayGoals;
                
                if (homeGoals > awayGoals) { record.overall.wins++; target.wins++; }
                else if (homeGoals < awayGoals) { record.overall.losses++; target.losses++; }
                else { record.overall.draws++; target.draws++; }
            } else {
                record.overall.goalsFor += awayGoals;
                record.overall.goalsAgainst += homeGoals;
                target.goalsFor += awayGoals;
                target.goalsAgainst += homeGoals;
                
                if (awayGoals > homeGoals) { record.overall.wins++; target.wins++; }
                else if (awayGoals < homeGoals) { record.overall.losses++; target.losses++; }
                else { record.overall.draws++; target.draws++; }
            }
        }
        return record;
    },

    async getTeamTrend(userId: string, seasonId?: string) {
        if (!userId || !seasonId) return [];
        const matches = await matchRepository.getAll(userId, seasonId);
        const completedMatches = matches.filter(m => m.status === 'completed');

        return completedMatches.map(match => {
            if (!match.result) return null;
            let value = 0;
            const { home, away } = match.result;
            if (match.isHome) {
                if (home > away) value = 1;
                else if (home < away) value = -1;
            } else {
                if (away > home) value = 1;
                else if (away < home) value = -1;
            }
            return {
                date: new Date(match.date).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }),
                opponent: match.opponent,
                value
            };
        }).filter((item): item is NonNullable<typeof item> => item !== null);
    },

    async getGoalsByInterval(userId: string, seasonId?: string) {
        if (!userId || !seasonId) return [];
        const matches = await matchRepository.getAll(userId, seasonId);
        const completedMatches = matches.filter(m => m.status === 'completed');
        
        const intervals = { '1-30': 0, '31-60': 0, '61-90+': 0 };

        for (const match of completedMatches) {
            const events = await eventRepository.getForMatch(match.id, seasonId, userId);
            const goals = events.filter(e => e.type === 'goal');
            
            goals.forEach(event => {
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
        }

        return [
            { name: '1-30\'', value: intervals['1-30'], fill: "hsl(var(--chart-1))" },
            { name: '31-60\'', value: intervals['31-60'], fill: "hsl(var(--chart-2))" },
            { name: '61-90\'+', value: intervals['61-90+'], fill: "hsl(var(--chart-3))" }
        ];
    },

    async getAllPlayersAggregatedStats(userId: string, seasonId?: string) {
        if (!userId || !seasonId) return [];
        const players = await playerRepository.getAll(userId, seasonId);
        const matches = await matchRepository.getAll(userId, seasonId);
        const completedMatches = matches.filter(m => m.status === 'completed');

        const results = [];
        for (const player of players) {
            let appearances = 0;
            let goals = 0;
            let assists = 0;
            let totalMinutes = 0;
            let yellowCards = 0;
            let redCards = 0;

            for (const match of completedMatches) {
                const [lineup, events, stats] = await Promise.all([
                    lineupRepository.getForMatch(match.id, seasonId, userId),
                    eventRepository.getForMatch(match.id, seasonId, userId),
                    statsRepository.getForMatch(match.id, seasonId, userId)
                ]);

                const isInLineup = lineup?.starters.includes(player.id) || lineup?.substitutes.includes(player.id);
                const playerStats = stats.find(s => s.playerId === player.id);

                if (isInLineup || playerStats) {
                    appearances++;
                    if (playerStats) {
                        totalMinutes += playerStats.minutesPlayed || 0;
                        yellowCards += playerStats.yellowCards || 0;
                        redCards += playerStats.redCards || 0;
                    }
                    
                    const isPitchManTeam = match.isHome ? 'home' : 'away';
                    goals += events.filter(e => e.type === 'goal' && e.playerId === player.id && e.team === isPitchManTeam).length;
                    assists += events.filter(e => e.type === 'goal' && e.assistPlayerId === player.id && e.team === isPitchManTeam).length;
                }
            }

            results.push({
                playerId: player.id,
                name: player.name,
                stats: {
                    appearances,
                    goals,
                    assists,
                    avgMinutes: appearances > 0 ? Math.round(totalMinutes / appearances) : 0,
                    yellowCards,
                    redCards
                }
            });
        }
        return results;
    },

    async syncAllPlayersStats(userId: string, seasonId?: string) {
        if (!userId || !seasonId) return;
        const allStats = await this.getAllPlayersAggregatedStats(userId, seasonId);
        for (const { playerId, stats } of allStats) {
            await playerRepository.update(playerId, seasonId, { stats });
        }
    }
};