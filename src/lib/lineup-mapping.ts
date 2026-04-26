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
  "3-5-2": ["POR", "DCS", "DC", "DCD", "ES", "CCS", "MED", "CCD", "ED", "ATT", "ATT"],
  "4-2-3-1": ["POR", "TS", "DC", "DC", "TD", "MED", "MED", "ES", "TRQ", "ED", "ATT"],
  "3-4-2-1": ["POR", "DCS", "DC", "DCD", "ES", "CCS", "CCD", "ED", "TRQ", "TRQ", "ATT"],
  "3-4-1-2": ["POR", "DCS", "DC", "DCD", "ES", "CCS", "CCD", "ED", "TRQ", "ATT", "ATT"],
  "4-3-1-2": ["POR", "TS", "DC", "DC", "TD", "CC", "MED", "CC", "TRQ", "ATT", "ATT"]
};

export const FORMATION_COORDINATES: Record<string, { top: number, left: number }[]> = {
  "4-4-2": [
    { top: 90, left: 50 }, // POR
    { top: 72, left: 15 }, { top: 72, left: 38 }, { top: 72, left: 62 }, { top: 72, left: 85 }, // Difesa
    { top: 45, left: 15 }, { top: 45, left: 38 }, { top: 45, left: 62 }, { top: 45, left: 85 }, // Centrocampo
    { top: 18, left: 35 }, { top: 18, left: 65 } // Attacco
  ],
  "4-3-3": [
    { top: 90, left: 50 },
    { top: 72, left: 15 }, { top: 72, left: 38 }, { top: 72, left: 62 }, { top: 72, left: 85 },
    { top: 48, left: 25 }, { top: 55, left: 50 }, { top: 48, left: 75 },
    { top: 22, left: 20 }, { top: 15, left: 50 }, { top: 22, left: 80 }
  ],
  "3-5-2": [
    { top: 90, left: 50 },
    { top: 72, left: 25 }, { top: 75, left: 50 }, { top: 72, left: 75 },
    { top: 48, left: 12 }, { top: 48, left: 32 }, { top: 55, left: 50 }, { top: 48, left: 68 }, { top: 48, left: 88 },
    { top: 18, left: 38 }, { top: 18, left: 62 }
  ],
  "4-2-3-1": [
    { top: 90, left: 50 },
    { top: 72, left: 15 }, { top: 72, left: 38 }, { top: 72, left: 62 }, { top: 72, left: 85 },
    { top: 55, left: 35 }, { top: 55, left: 65 },
    { top: 32, left: 20 }, { top: 32, left: 50 }, { top: 32, left: 80 },
    { top: 12, left: 50 }
  ],
  "3-4-2-1": [
    { top: 90, left: 50 },
    { top: 72, left: 25 }, { top: 75, left: 50 }, { top: 72, left: 75 },
    { top: 50, left: 12 }, { top: 50, left: 38 }, { top: 50, left: 62 }, { top: 50, left: 88 },
    { top: 28, left: 35 }, { top: 28, left: 65 },
    { top: 12, left: 50 }
  ],
  "3-4-1-2": [
    { top: 90, left: 50 },
    { top: 72, left: 25 }, { top: 75, left: 50 }, { top: 72, left: 75 },
    { top: 50, left: 12 }, { top: 50, left: 38 }, { top: 50, left: 62 }, { top: 50, left: 88 },
    { top: 32, left: 50 },
    { top: 15, left: 35 }, { top: 15, left: 65 }
  ],
  "4-3-1-2": [
    { top: 90, left: 50 },
    { top: 72, left: 15 }, { top: 72, left: 38 }, { top: 72, left: 62 }, { top: 72, left: 85 },
    { top: 55, left: 25 }, { top: 60, left: 50 }, { top: 55, left: 75 },
    { top: 35, left: 50 },
    { top: 15, left: 35 }, { top: 15, left: 65 }
  ]
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

export function getPositionCoordinates(formation: string, index: number): { top: number, left: number } {
  const coords = FORMATION_COORDINATES[formation] || FORMATION_COORDINATES["4-4-2"];
  return coords[index] || { top: 0, left: 0 };
}
