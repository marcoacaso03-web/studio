import type { MatchEvent } from './types';

/**
 * Conta i gol per home e away tenendo conto degli autogol.
 * - goal con team='home'     → +1 homeGoals
 * - goal con team='away'     → +1 awayGoals
 * - own_goal con team='home' → +1 awayGoals (autogol di un giocatore home → gol per away)
 * - own_goal con team='away' → +1 homeGoals (autogol di un giocatore away → gol per home)
 */
export function countGoals(events: Pick<MatchEvent, 'type' | 'team'>[]): { home: number; away: number } {
    let home = 0;
    let away = 0;
    for (const e of events) {
        if (e.type === 'goal') {
            if (e.team === 'home') home++;
            else away++;
        } else if (e.type === 'own_goal') {
            // Autogol: il gol va alla squadra avversaria di chi lo segna
            if (e.team === 'home') away++;
            else home++;
        }
    }
    return { home, away };
}
