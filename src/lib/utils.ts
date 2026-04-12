import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Restituisce il nome del giocatore nell'ordine COGNOME NOME per le liste.
 * Se il giocatore ha firstName e lastName separati li usa direttamente,
 * altrimenti inverte le parti del fullName.
 */
export function displayPlayerName(player: { firstName?: string; lastName?: string; name: string }): string {
  if (player.lastName && player.firstName) {
    return `${player.lastName} ${player.firstName}`.trim().toUpperCase();
  }
  // Fallback: inverte le parti del nome completo
  const parts = player.name.trim().split(/\s+/);
  if (parts.length <= 1) return player.name.toUpperCase();
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return `${lastName} ${firstName}`.trim().toUpperCase();
}
