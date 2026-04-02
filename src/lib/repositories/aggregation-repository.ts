import { matchRepository } from './match-repository';
import { playerRepository } from './player-repository';
import { eventRepository } from './event-repository';
import { statsRepository } from './stats-repository';
import { lineupRepository } from './lineup-repository';
import type { Match, Player, MatchEvent, PlayerMatchStats, MatchLineup } from '../types';

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

/**
 * Contesto di dati completo per una stagione, caricato una sola volta per ottimizzare i calcoli.
 */
interface SeasonDataContext {
    matches: Match[];
    players: Player[];
    matchesDetails: {
        [matchId: string]: {
            events: MatchEvent[];
            lineup?: MatchLineup;
            stats: PlayerMatchStats[];
        }
    };
}

export const aggregationRepository = {
    /**
     * Carica solo i dati necessari per il riepilogo (vittorie/sconfitte).
     * Molto veloce perché non scarica i dettagli delle singole partite.
     */
    async getSummaryContext(userId: string, seasonId: string): Promise<SeasonDataContext> {
        const [matches, players] = await Promise.all([
            matchRepository.getAll(userId, seasonId),
            playerRepository.getAll(userId, seasonId)
        ]);

        return { matches, players, matchesDetails: {} };
    },

    /**
     * Carica tutti i dati, inclusi eventi, formazioni e statistiche di ogni partita.
     * Usato per i grafici e le leaderboard.
     */
    async getDetailedContext(userId: string, seasonId: string): Promise<SeasonDataContext> {
        const [matches, players] = await Promise.all([
            matchRepository.getAll(userId, seasonId),
            playerRepository.getAll(userId, seasonId)
        ]);

        const completedMatches = matches.filter(m => m.status === 'completed');
        
        const detailsResults = await Promise.all(completedMatches.map(async (match) => {
            try {
                const [events, lineup, stats] = await Promise.all([
                    eventRepository.getForMatch(match.id, seasonId, userId).catch(() => []),
                    lineupRepository.getForMatch(match.id, seasonId, userId).catch(() => undefined),
                    statsRepository.getForMatch(match.id, seasonId, userId).catch(() => [])
                ]);
                return { matchId: match.id, events, lineup, stats };
            } catch (e) {
                console.warn(`Could not fetch details for match ${match.id}`, e);
                return { matchId: match.id, events: [], lineup: undefined, stats: [] };
            }
        }));

        const matchesDetails: SeasonDataContext['matchesDetails'] = {};
        detailsResults.forEach(res => {
            matchesDetails[res.matchId] = {
                events: res.events,
                lineup: res.lineup,
                stats: res.stats
            };
        });

        return { matches, players, matchesDetails };
    },

    getTeamRecordFromContext(context: SeasonDataContext): FullTeamRecord {
        const createRecord = (): TeamStatsRecord => ({
            wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, matchesPlayed: 0,
        });

        const record: FullTeamRecord = {
            overall: createRecord(),
            home: createRecord(),
            away: createRecord()
        };

        const completedMatches = context.matches.filter(m => m.status === 'completed');

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

    getTeamTrendFromContext(context: SeasonDataContext) {
        const completedMatches = context.matches.filter(m => m.status === 'completed');

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

    getGoalsByIntervalFromContext(context: SeasonDataContext) {
        const intervals = { '1-30': 0, '31-60': 0, '61-90+': 0 };
        const completedMatches = context.matches.filter(m => m.status === 'completed');

        for (const match of completedMatches) {
            const details = context.matchesDetails[match.id];
            if (!details) continue;

            const isPitchManTeam = match.isHome ? 'home' : 'away';
            const goals = details.events.filter(e => e.type === 'goal' && e.team === isPitchManTeam);
            
            goals.forEach(event => {
                if (event.period === '1T') {
                    if (event.minute <= 30) intervals['1-30']++;
                    else intervals['31-60']++;
                } else {
                    intervals['61-90+']++;
                }
            });
        }

        return [
            { name: "1-30'", value: intervals['1-30'], fill: "#ace504" },
            { name: "31-60'", value: intervals['31-60'], fill: "rgba(172, 229, 4, 0.6)" },
            { name: "61-90'+", value: intervals['61-90+'], fill: "rgba(172, 229, 4, 0.3)" }
        ];
    },

    getPlayersAggregatedStatsFromContext(context: SeasonDataContext) {
        const completedMatches = context.matches.filter(m => m.status === 'completed');
        const results = [];

        for (const player of context.players) {
            let appearances = 0;
            let goals = 0;
            let assists = 0;
            let totalMinutes = 0;
            let yellowCards = 0;
            let redCards = 0;

            for (const match of completedMatches) {
                const details = context.matchesDetails[match.id];
                if (!details) continue;

                const isStarter = details.lineup?.starters.includes(player.id) ?? false;
                const playerStats = details.stats.find(s => s.playerId === player.id);
                const hasPlayed = isStarter || !!playerStats;

                if (hasPlayed) {
                    appearances++;
                    if (playerStats) {
                        totalMinutes += playerStats.minutesPlayed || 0;
                        yellowCards += playerStats.yellowCards || 0;
                        redCards += playerStats.redCards || 0;
                    }
                    
                    const isPitchManSide = match.isHome ? 'home' : 'away';
                    goals += details.events.filter(e => e.type === 'goal' && e.playerId === player.id && e.team === isPitchManSide).length;
                    assists += details.events.filter(e => e.type === 'goal' && e.assistPlayerId === player.id && e.team === isPitchManSide).length;
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

    // Compatibilità legacy e sync
    async syncAllPlayersStats(userId: string, seasonId?: string) {
        if (!userId || !seasonId) return;
        const context = await this.getDetailedContext(userId, seasonId);
        const allStats = this.getPlayersAggregatedStatsFromContext(context);
        for (const { playerId, stats } of allStats) {
            await playerRepository.update(playerId, seasonId, { stats });
        }
    }
};