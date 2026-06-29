'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useTestsStore } from '@/store/useTestsStore';
import { usePlayersStore } from '@/store/usePlayersStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { testRepository } from '@/lib/repositories/test-repository';
import { formatValue, formatDate, computeDelta } from '@/lib/test-utils';
import type { PhysicalTest, Player } from '@/lib/types';
import { Activity, Trophy, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Helper colors ─────────────────────────────────────
function useChartColors() {
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  return {
    primary:      isDark ? '#ace504' : 'hsl(210 100% 45%)',
    primaryFill:  isDark ? 'rgba(172,229,4,0.15)' : 'rgba(0,128,255,0.12)',
    grid:         isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)',
    tick:         isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
    tooltipBg:    isDark ? 'rgba(0,0,0,0.92)' : 'rgba(255,255,255,0.97)',
    tooltipBorder:isDark ? 'rgba(172,229,4,0.3)' : 'rgba(0,128,255,0.25)',
    tooltipColor: isDark ? '#fff' : '#000',
    cursorFill:   isDark ? 'rgba(172,229,4,0.05)' : 'rgba(0,128,255,0.05)',
  };
}

const LineChart = dynamic<{ data: { date: string; value: number }[]; colors: any; unit: string }>(
  () => import('recharts').then(mod => {
    const { LineChart: LC, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = mod;
    return function Chart({ data, colors, unit }: any) {
      return (
        <ResponsiveContainer width="100%" height={160}>
          <LC data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
            <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: colors.tick, fontWeight: 900 }}
              tickFormatter={(v: string) => formatDate(v)}
            />
            <YAxis
              tick={{ fontSize: 9, fill: colors.tick, fontWeight: 900 }}
              width={40}
              tickFormatter={(v: number) => formatValue(v, unit)}
            />
            <Tooltip
              contentStyle={{ backgroundColor: colors.tooltipBg, border: `1px solid ${colors.tooltipBorder}`, borderRadius: 12, fontSize: 11, color: colors.tooltipColor }}
              formatter={(value: number) => [formatValue(value, unit), 'Risultato']}
            />
            <Line type="monotone" dataKey="value" stroke={colors.primary} strokeWidth={2} dot={{ r: 3, fill: colors.primary }} />
          </LC>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <Skeleton className="h-40 w-full" /> }
);

export function PhysicalTab() {
  const { id: playerId } = useParams();
  const { tests } = useTestsStore();
  const { players } = usePlayersStore();
  const { user } = useAuthStore();
  const chartColors = useChartColors();

  const player = players.find(p => p.id === playerId);

  // Fetch all tests for this season and filter by player
  const [fetchedTests, setFetchedTests] = useState<PhysicalTest[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const seasonId = tests[0]?.seasonId;
    if (!seasonId) { setLoading(false); return; }
    testRepository.getTestsByPlayer(user.id, seasonId, playerId as string)
      .then(setFetchedTests)
      .finally(() => setLoading(false));
  }, [user, playerId, tests]);

  const testsForPlayer = fetchedTests ?? [];

  // Group by test name
  const byTestName = useMemo(() => {
    const groups = new Map<string, { testName: string; unit: string; sessions: { date: string; value: number }[] }>();
    for (const t of testsForPlayer) {
      const result = t.results.find(r => r.playerId === playerId);
      if (!result) continue;
      const existing = groups.get(t.name) ?? { testName: t.name, unit: t.unit, sessions: [] };
      existing.sessions.push({ date: t.date, value: result.value });
      groups.set(t.name, existing);
    }
    // sort sessions within each group by date
    for (const g of groups.values()) {
      g.sessions.sort((a, b) => a.date.localeCompare(b.date));
    }
    return Array.from(groups.values());
  }, [testsForPlayer, playerId]);

  // Last 5 results overall
  const lastResults = useMemo(() => {
    const all: { testName: string; unit: string; date: string; value: number }[] = [];
    for (const t of testsForPlayer) {
      const r = t.results.find(x => x.playerId === playerId);
      if (r) all.push({ testName: t.name, unit: t.unit, date: t.date, value: r.value });
    }
    return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [testsForPlayer, playerId]);

  // Team ranking for each test
  const teamRanks = useMemo(() => {
    const allTests = tests;
    return byTestName.map(group => {
      const latestPerPlayer = new Map<string, { value: number; date: string }>();
      for (const t of allTests.filter(x => x.name === group.testName)) {
        for (const r of t.results) {
          const cur = latestPerPlayer.get(r.playerId);
          if (!cur || t.date > cur.date) {
            latestPerPlayer.set(r.playerId, { value: r.value, date: t.date });
          }
        }
      }
      const sorted = Array.from(latestPerPlayer.entries())
        .map(([pid, { value }]) => ({ playerId: pid, value }))
        .sort((a, b) => group.unit === 'metri' ? b.value - a.value : a.value - b.value);

      const myRank = sorted.findIndex(x => x.playerId === (playerId as string));
      return {
        testName: group.testName,
        unit: group.unit,
        rank: myRank >= 0 ? myRank + 1 : null,
        total: sorted.length,
      };
    });
  }, [byTestName, tests, playerId]);

  if (loading) {
    return <Skeleton className="h-60 w-full" />;
  }

  if (testsForPlayer.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Activity className="h-10 text-muted-foreground/30 mb-3" />
        <p className="text-xs font-black uppercase text-muted-foreground/60">
          Nessun test registrato per questo giocatore
        </p>
        <Link
          href="/allenamento/test"
          className="mt-3 text-[10px] font-black uppercase text-primary dark:text-brand-green flex items-center gap-1 hover:underline"
        >
          Vai ai Test Fisici <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Charts per test name */}
      {byTestName.map(group => (
        <Card key={group.testName} className="rounded-3xl bg-card dark:bg-black/40 border border-border dark:border-brand-green/20 overflow-hidden">
          <CardHeader className="pb-0 px-4 pt-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-white/30 flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-primary dark:text-brand-green" />
              {group.testName} — {group.unit}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-2 pb-4">
            <LineChart data={group.sessions} colors={chartColors} unit={group.unit} />
          </CardContent>
        </Card>
      ))}

      {/* Last results */}
      <Card className="rounded-3xl bg-card dark:bg-black/40 border border-border dark:border-brand-green/20 overflow-hidden">
        <CardHeader className="pb-0 px-4 pt-4">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-white/30">
            Ultimi risultati
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-3 px-4 pb-4">
          <div className="space-y-1">
            {lastResults.map((r, idx) => {
              const prevResult = lastResults.filter(x => x.testName === r.testName && x.date > r.date).sort((a, b) => a.date.localeCompare(b.date))[0];
              const delta = prevResult ? r.value - prevResult.value : null;
              const isImprovement = delta === null ? null : (r.unit === 'metri' ? delta > 0 : delta < 0);

              return (
                <div key={`${r.testName}-${r.date}-${idx}`} className="flex items-center gap-2 py-1.5 border-b border-border dark:border-brand-green/10 last:border-b-0">
                  <span className="text-[10px] font-bold flex-1 truncate">{r.testName}</span>
                  <span className="text-[11px] font-black">{formatValue(r.value, r.unit)}</span>
                  <span className="text-[9px] text-muted-foreground/40 w-12 text-right">{formatDate(r.date)}</span>
                  {delta !== null && (
                    <span className={`text-[9px] font-black w-16 text-right ${isImprovement ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isImprovement ? '🟢' : '🔴'} {delta > 0 ? '+' : ''}{formatValue(delta, r.unit)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Team comparison */}
      {teamRanks.length > 0 && (
        <Card className="rounded-3xl bg-card dark:bg-black/40 border border-border dark:border-brand-green/20 overflow-hidden">
          <CardHeader className="pb-0 px-4 pt-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground dark:text-white/30 flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-yellow-500" />
              Confronto squadra
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 px-4 pb-4">
            <div className="space-y-1.5">
              {teamRanks.map(r => (
                <div key={r.testName} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold flex-1 truncate">{r.testName}</span>
                  {r.rank ? (
                    <span className="text-[10px] font-black text-yellow-500">
                      {r.rank}° su {r.total}
                    </span>
                  ) : (
                    <span className="text-[9px] text-muted-foreground/30">—</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
