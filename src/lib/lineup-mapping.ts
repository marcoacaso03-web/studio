/**
 * Single source of truth for jersey numbers based on tactical positions.
 */

export const FORMATION_NUMBERS: Record<string, number[]> = {
  "4-4-2": [1, 3, 4, 5, 2, 11, 6, 8, 7, 9, 10], 
  "4-3-3": [1, 3, 4, 5, 2, 8, 6, 10, 11, 9, 7], 
  "3-5-2": [1, 4, 5, 6, 3, 11, 8, 7, 2, 9, 10], 
  "4-2-3-1": [1, 3, 4, 5, 2, 6, 8, 11, 10, 7, 9], 
  "3-4-2-1": [1, 4, 5, 6, 3, 8, 11, 2, 7, 10, 9], 
  "3-4-1-2": [1, 4, 5, 6, 3, 8, 11, 2, 7, 10, 9], 
  "4-3-1-2": [1, 3, 4, 5, 2, 8, 6, 7, 10, 9, 11]  
};

export const FORMATION_POSITIONS: Record<string, string[]> = {
  "4-4-2": ["POR", "TS", "DC", "DC", "TD", "ES", "CC", "CC", "ED", "ATT", "ATT"],
  "4-3-3": ["POR", "TS", "DC", "DC", "TD", "CC", "MED", "CC", "AS", "ATT", "AD"],
  "3-5-2": ["POR", "DCD", "DC", "DCS", "ES", "CCD", "MED", "CCS", "ED", "ATT", "ATT"],
  "4-2-3-1": ["POR", "TS", "DC", "DC", "TD", "MED", "MED", "ES", "TRQ", "ED", "ATT"],
  "3-4-2-1": ["POR", "DCD", "DC", "DCS", "ES", "CCD", "CCS", "ED", "TRQ", "TRQ", "ATT"],
  "3-4-1-2": ["POR", "DCD", "DC", "DCS", "ES", "CCD", "CCS", "ED", "TRQ", "ATT", "ATT"],
  "4-3-1-2": ["POR", "TS", "DC", "DC", "TD", "CC", "MED", "CC", "TRQ", "ATT", "ATT"]
};

export function getJerseyNumber(formation: string, index: number): number {
  const numbers = FORMATION_NUMBERS[formation] || FORMATION_NUMBERS["4-4-2"];
  return numbers[index] || (index + 1);
}

export function getSubstituteNumber(index: number): number {
  return index + 12;
}

export function getPositionAcronym(formation: string, index: number): string {
  const positions = FORMATION_POSITIONS[formation] || FORMATION_POSITIONS["4-4-2"];
  return positions[index] || "N/A";
}
