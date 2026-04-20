import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { aggregationRepository } from '@/lib/repositories/aggregation-repository';

// Tool per ottenere il record della squadra (vittorie, pareggi, sconfitte, gol)
export const getTeamRecordTool = ai.defineTool(
  {
    name: 'getTeamRecord',
    description: 'Ottiene il riepilogo della stagione: partite giocate, vittorie, pareggi, sconfitte e gol fatti/subiti.',
    inputSchema: z.object({
      userId: z.string().describe('ID dell\'utente (fornito dal sistema)'),
      seasonId: z.string().describe('ID della stagione (fornito dal sistema)'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    // Nota: In una produzione reale, verificheremmo qui se l'utente ha accesso a questa season.
    const context = await aggregationRepository.getSummaryContext(input.userId, input.seasonId);
    return aggregationRepository.getTeamRecordFromContext(context);
  }
);

// Tool per ottenere la classifica marcatori e assist
export const getPlayerLeaderboardTool = ai.defineTool(
  {
    name: 'getPlayerLeaderboard',
    description: 'Ottiene la lista dei giocatori con i loro gol, assist, presenze e minuti medi.',
    inputSchema: z.object({
      userId: z.string().describe('ID dell\'utente (fornito dal sistema)'),
      seasonId: z.string().describe('ID della stagione (fornito dal sistema)'),
    }),
    outputSchema: z.array(z.any()),
  },
  async (input) => {
    const context = await aggregationRepository.getDetailedContext(input.userId, input.seasonId);
    return aggregationRepository.getPlayersAggregatedStatsFromContext(context);
  }
);

// Tool per l'utilizzo della rosa (quello che abbiamo usato per la heatmap)
export const getSquadUsageTool = ai.defineTool(
  {
    name: 'getSquadUsage',
    description: 'Ottiene i dati su quanto ogni giocatore è stato utilizzato (partite e minuti totali). Utile per capire chi è sovraccaricato.',
    inputSchema: z.object({
      userId: z.string().describe('ID dell\'utente (fornito dal sistema)'),
      seasonId: z.string().describe('ID della stagione (fornito dal sistema)'),
    }),
    outputSchema: z.array(z.any()),
  },
  async (input) => {
    const context = await aggregationRepository.getDetailedContext(input.userId, input.seasonId);
    const stats = aggregationRepository.getPlayersAggregatedStatsFromContext(context);
    return stats.map(p => ({
        name: p.name,
        appearances: p.stats.appearances,
        totalMinutes: Math.round(p.stats.appearances * p.stats.avgMinutes),
        avgMinutes: p.stats.avgMinutes
    }));
  }
);
