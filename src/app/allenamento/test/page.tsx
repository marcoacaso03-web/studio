'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTestsStore } from '@/store/useTestsStore';
import { usePlayersStore } from '@/store/usePlayersStore';
import { useSeasonsStore } from '@/store/useSeasonsStore';
import { useAuthStore } from '@/store/useAuthStore';
import type { PhysicalTest } from '@/lib/types';
import { sortResults, formatValue, formatDate } from '@/lib/test-utils';
import { Plus, Activity, Zap, Clock, Users, ChevronRight, Trophy } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PhysicalTestDialog } from '@/components/allenamento/physical-test-dialog';

type FilterType = 'all' | 'velocita' | 'resistenza';

export default function PhysicalTestsPage() {
  const router = useRouter();
  const { tests } = useTestsStore();
  const { players } = usePlayersStore();
  const { activeSeason } = useSeasonsStore();
  const { user } = useAuthStore();

  const [filter, setFilter] = useState<FilterType>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const getPlayerName = useCallback((id: string): string => {
    const p = players.find(pl => pl.id === id);
    return p ? `${p.lastName} ${p.firstName}` : '?';
  }, [players]);

  const filteredTests = useMemo(() => {
    return tests
      .filter(t => filter === 'all' || t.type === filter)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [tests, filter]);

  // Group standings by test NAME (not type)
  const standingsGroups = useMemo(() => {
    const byName = new Map<string, PhysicalTest[]>();
    for (const t of tests) {
      const arr = byName.get(t.name) ?? [];
      arr.push(t);
      byName.set(t.name, arr);
    }

    return Array.from(byName.entries()).map(([name, groupTests]) => {
      const latestResults = new Map<string, { result: { playerId: string; value: number }; date: string; test: PhysicalTest }>();
      const sorted = [...groupTests].sort((a, b) => b.date.localeCompare(a.date));
      for (const t of sorted) {
        for (const r of t.results) {
          if (!latestResults.has(r.playerId)) {
            latestResults.set(r.playerId, { result: r, date: t.date, test: t });
          }
        }
      }

      const firstTest = groupTests[0];
      const unit = firstTest.unit;
      const standings = Array.from(latestResults.entries())
        .map(([playerId, { result, date }]) => ({
          playerId,
          playerName: getPlayerName(playerId),
          value: result.value,
          date,
        }))
        .sort((a, b) => unit === 'metri' ? b.value - a.value : a.value - b.value);

      return { name, unit, standings };
    });
  }, [tests, getPlayerName]);

  const totalPlayers = players.length;

  const handleTestCreated = useCallback((id: string) => {
    setDialogOpen(false);
    router.push(`/allenamento/test/${id}`);
  }, [router]);

  return (
    <div className="space-y-4 pb-24">
      <PageHeader title="Test Fisici">
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-9 text-[10px] font-black uppercase rounded-xl"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Nuovo Test
        </Button>
      </PageHeader>

      {filteredTests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Activity className="h-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm font-black uppercase text-muted-foreground/60">
            Nessun test registrato
          </p>
          <p className="text-[10px] font-bold uppercase mt-1 text-muted-foreground/40">
            Registra il primo test fisico della stagione
          </p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="mt-6 h-11 text-[10px] font-black uppercase rounded-xl"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Crea il tuo primo test
          </Button>
        </div>
      ) : (
        <>
          {/* Filter */}
          <div className="flex bg-muted/50 rounded-full p-0.5 w-fit">
            {(['all', 'velocita', 'resistenza'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={
                  'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ' +
                  (filter === f
                    ? 'bg-background dark:bg-black border border-primary dark:border-brand-green text-foreground'
                    : 'text-muted-foreground/50')
                }
              >
                {f === 'all' ? 'Tutti' : f === 'velocita' ? 'Velocità' : 'Resistenza'}
              </button>
            ))}
          </div>

          {/* Sessions list */}
          <div className="space-y-2 mb-6">
            {filteredTests.map(test => (
              <Link
                key={test.id}
                href={`/allenamento/test/${test.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-border dark:border-brand-green/20 bg-muted/10 dark:bg-card/5 hover:bg-muted/20 dark:hover:bg-card/10 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{test.name}</p>
                  <p className="text-[9px] text-muted-foreground/50 uppercase mt-0.5">
                    {formatDate(test.date)} • {test.type}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-black text-muted-foreground/50">
                  <Users className="h-3 w-3" />
                  {test.results.length}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
              </Link>
            ))}
          </div>

          {/* Standings per test name */}
          {standingsGroups.map(group => (
            <div key={group.name} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {group.name} — <span className="text-yellow-500">{group.unit}</span>
                </span>
              </div>

              <div className="rounded-2xl border border-border dark:border-brand-green/20 overflow-hidden">
                {group.standings.map((entry, idx) => (
                  <div
                    key={entry.playerId}
                    className="flex items-center gap-3 px-4 py-2.5 border-b border-border dark:border-brand-green/10 last:border-b-0"
                  >
                    <span className="w-5 text-center text-[11px] font-black text-muted-foreground/60">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{entry.playerName}</p>
                    </div>
                    <span className="text-[11px] font-black text-foreground">
                      {formatValue(entry.value, group.unit)}
                    </span>
                    <span className="text-[9px] text-muted-foreground/40 w-12 text-right">
                      {formatDate(entry.date)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      <PhysicalTestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleTestCreated}
        players={players}
      />
    </div>
  );
}
