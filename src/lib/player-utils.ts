import type { Player, InjuryPeriod } from './types';

/**
 * Returns the currently active injury for a player relative to `refDate`
 * (defaults to today). An injury is active when its end date is on or after
 * the reference date.
 */
export function activeInjury(player: Player, refDate: Date = new Date()): InjuryPeriod | null {
  if (!player.injuries || player.injuries.length === 0) return null;
  const ref = refDate.toISOString().slice(0, 10); // YYYY-MM-DD
  const active = player.injuries.find((inj) => inj.endDate >= ref);
  return active ?? null;
}

/** Convenience boolean for UI badges. */
export function isPlayerInjured(player: Player, refDate: Date = new Date()): boolean {
  return activeInjury(player, refDate) !== null;
}

/** Formats an ISO date (YYYY-MM-DD) into a human-readable Italian date. */
export function formatInjuryDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}
