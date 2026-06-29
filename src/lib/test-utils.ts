import type { PhysicalTest, TestResult } from '@/lib/types';
import type { Player } from '@/lib/types';

/** Sort results by unit: "secondi" → ascending, "metri" → descending */
export function sortResults(
  results: TestResult[],
  unit: string,
  getPlayerName: (id: string) => string
): (TestResult & { playerName: string })[] {
  const enriched = results.map(r => ({
    ...r,
    playerName: getPlayerName(r.playerId),
  }));
  const isDescending = unit === 'metri';
  return enriched.sort((a, b) =>
    isDescending ? b.value - a.value : a.value - b.value
  );
}

/** Get the latest result per player for a given test name */
export function getLatestPerPlayer(
  tests: PhysicalTest[],
  testName: string
): (TestResult & { date: string; playerName: string })[] {
  const filtered = tests
    .filter(t => t.name === testName)
    .sort((a, b) => b.date.localeCompare(a.date));

  const map = new Map<string, { result: TestResult; date: string }>();
  for (const t of filtered) {
    for (const r of t.results) {
      if (!map.has(r.playerId)) {
        map.set(r.playerId, { result: r, date: t.date });
      }
    }
  }

  return Array.from(map.entries()).map(([playerId, { result, date }]) => ({
    ...result,
    playerId,
    date,
    playerName: '',  // to be filled by caller
  }));
}

export function formatValue(value: number, unit: string): string {
  if (unit === 'secondi') return `${value.toFixed(2)}s`;
  if (unit === 'metri') return `${Math.round(value)}m`;
  return value.toString();
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}

/** Compute delta between a result and the previous one for the same test name */
export function computeDelta(
  tests: PhysicalTest[],
  playerId: string,
  testName: string,
  currentValue: number,
  currentDate: string,
  unit: string
): { delta: number; isImprovement: boolean } | null {
  const previous = tests
    .filter(t => t.name === testName && t.date < currentDate)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(t => t.results.find(r => r.playerId === playerId))
    .find(r => r !== undefined);

  if (!previous) return null;

  const delta = currentValue - previous.value;
  const isImprovement = unit === 'metri' ? delta > 0 : delta < 0;
  return { delta, isImprovement };
}
