"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, User, Shield, Sword, Zap, Clock, AlertTriangle, Target, Calendar, TrendingUp, ArrowRightLeft } from "lucide-react";

import { usePlayersStore } from "@/store/usePlayersStore";
import { useSeasonsStore } from "@/store/useSeasonsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { aggregationRepository } from "@/lib/repositories/aggregation-repository";
import { trainingRepository } from "@/lib/repositories/training-repository";
import type { Player, TrainingSession, TrainingAttendance, TrainingStatus, Match } from "@/lib/types";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Lazy-load grafici per ottimizzare LCP
const RadarChart = dynamic(
  () => import("recharts").then((mod) => {
    const { RadarChart: RC, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } = mod;
    const Chart = ({ data }: { data: { subject: string; score: number; rawValue: number }[] }) => (
      <ResponsiveContainer width="100%" height={240}>
        <RC data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 700 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }}
            formatter={(val: number, name: string, props: any) => [props.payload.rawValue, ""]}
          />
        </RC>
      </ResponsiveContainer>
    );
    return { default: Chart };
  }),
  { ssr: false, loading: () => <Skeleton className="h-60 w-full" /> }
);

const BarChartComponent = dynamic(
  () => import("recharts").then((mod) => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } = mod;
    const Chart = ({ data }: { data: { name: string; value: number; color: string }[] }) => (
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barSize={28}>
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontWeight: 700 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }}
            formatter={(v: number) => [v, ""]}
          />
          {data.map((entry, i) => (
            <Bar key={i} dataKey="value" radius={[6, 6, 0, 0]}>
              <Cell fill={entry.color} />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
    return { default: Chart };
  }),
  { ssr: false, loading: () => <Skeleton className="h-40 w-full" /> }
);

// ─── Tipi interni ─────────────────────────────────────────────────────────────
interface PlayerDetailStats {
  appearances: number;
  goals: number;
  assists: number;
  avgMinutes: number;
  yellowCards: number;
  redCards: number;
  totalMinutes: number;
  wins: number;
  losses: number;
  draws: number;
  cleanSheets: number;
  goalsConcededOnPitch: number;
  goalsScoredOnPitch: number;
}

interface TrainingRecord {
  session: TrainingSession;
  status: TrainingStatus | null;
}

interface MatchRecord {
  match: Match;
  status: "titolare" | "entrato" | "inutilizzato" | "non_convocato" | "da_giocare";
}

const roleLabel: Record<string, string> = {
  Portiere: "POR",
  Difensore: "DIF",
  Centrocampista: "CEN",
  Attaccante: "ATT",
};

const roleBg: Record<string, string> = {
  Portiere: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Difensore: "bg-primary/10 text-primary border-primary/20",
  Centrocampista: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Attaccante: "bg-red-500/10 text-red-500 border-red-500/20",
};

// ─── Componente StatCard ───────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = "text-primary" }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 bg-muted/30 border rounded-xl p-3 text-center">
      <Icon className={`h-4 w-4 ${color} mb-0.5`} />
      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      {sub && <span className="text-[9px] text-muted-foreground font-medium">{sub}</span>}
    </div>
  );
}

// ─── Componente HeatMap presenza allenamenti ───────────────────────────────────
function TrainingHeatmap({ records }: { records: TrainingRecord[] }) {
  const statusColor: Record<string, string> = {
    presente: "bg-emerald-500",
    ritardo: "bg-amber-400",
    assente: "bg-red-500",
  };
  const statusLabel: Record<string, string> = {
    presente: "Presente",
    ritardo: "In ritardo",
    assente: "Assente",
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-xs border-2 border-dashed rounded-xl">
        Nessun allenamento registrato per questa stagione.
      </div>
    );
  }

  const presenti = records.filter((r) => r.status === "presente").length;
  const totale = records.length;
  const percentuale = totale > 0 ? Math.round((presenti / totale) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${percentuale}%` }}
          />
        </div>
        <span className="text-xs font-black text-emerald-500 min-w-[3rem] text-right">{percentuale}%</span>
      </div>
      <p className="text-[10px] text-muted-foreground font-medium">
        {presenti} presenze su {totale} allenamenti
      </p>

      {/* Griglia dot */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {records.slice(0, 60).map((r) => (
          <div
            key={r.session.id}
            title={`${r.session.date} — ${r.status ? statusLabel[r.status] : "N/A"}`}
            className={`h-3.5 w-3.5 rounded-sm ${r.status ? statusColor[r.status] : "bg-muted"} cursor-default transition-transform hover:scale-125`}
          />
        ))}
        {records.length > 60 && (
          <span className="text-[9px] text-muted-foreground self-center">+{records.length - 60}</span>
        )}
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 pt-1">
        {Object.entries(statusColor).map(([key, cls]) => (
          <div key={key} className="flex items-center gap-1">
            <div className={`h-2.5 w-2.5 rounded-sm ${cls}`} />
            <span className="text-[9px] text-muted-foreground font-medium capitalize">{statusLabel[key]}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-muted" />
          <span className="text-[9px] text-muted-foreground font-medium">N/A</span>
        </div>
      </div>
    </div>
  );
}

// ─── Componente HeatMap presenza partite ───────────────────────────────────────
function MatchHeatmap({ records }: { records: MatchRecord[] }) {
  const statusColor: Record<string, string> = {
    titolare: "bg-emerald-500",
    entrato: "bg-amber-400",
    inutilizzato: "bg-orange-500",
    non_convocato: "bg-red-500",
    da_giocare: "bg-muted"
  };
  const statusLabel: Record<string, string> = {
    titolare: "Titolare",
    entrato: "Subentrato",
    inutilizzato: "Panchina",
    non_convocato: "Non convoc.",
    da_giocare: "Da giocare"
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-xs border-2 border-dashed rounded-xl">
        Nessuna partita in calendario.
      </div>
    );
  }

  const presenze = records.filter(r => r.status === "titolare" || r.status === "entrato").length;
  const matchDisputati = records.filter(r => r.status !== "da_giocare").length;
  const pct = matchDisputati > 0 ? Math.round((presenze / matchDisputati) * 100) : 0;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-black text-emerald-500 min-w-[3rem] text-right">{pct}%</span>
      </div>
      <p className="text-[10px] text-muted-foreground font-medium">
        Presenza in campo nel {pct}% dei match disputati
      </p>

      {/* Griglia dot */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {records.slice(0, 60).map((r, idx) => (
          <div
            key={r.match.id}
            title={`Giornata ${idx + 1} - ${r.match.opponent} — ${statusLabel[r.status]}`}
            className={`h-3.5 w-3.5 rounded-sm ${statusColor[r.status]} cursor-default transition-transform hover:scale-125`}
          />
        ))}
        {records.length > 60 && (
          <span className="text-[9px] text-muted-foreground self-center">+{records.length - 60}</span>
        )}
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {Object.entries(statusColor).map(([key, cls]) => {
          if (key === "da_giocare") return null;
          return (
            <div key={key} className="flex items-center gap-1">
              <div className={`h-2.5 w-2.5 rounded-sm ${cls}`} />
              <span className="text-[9px] text-muted-foreground font-medium capitalize">{statusLabel[key]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Pagina principale ─────────────────────────────────────────────────────────
export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;

  const { players, fetchAll: fetchPlayers } = usePlayersStore();
  const { activeSeason, fetchAll: fetchSeasons } = useSeasonsStore();
  const { user } = useAuthStore();

  const [loadingData, setLoadingData] = useState(true);
  const [playerStats, setPlayerStats] = useState<PlayerDetailStats | null>(null);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [matchRecords, setMatchRecords] = useState<MatchRecord[]>([]);

  // Ricerca giocatore nella lista già in cache oppure aspettiamo il fetch
  const player = useMemo(
    () => players.find((p) => p.id === playerId) ?? null,
    [players, playerId]
  );

  useEffect(() => {
    const init = async () => {
      if (!activeSeason) await fetchSeasons();
      await fetchPlayers();
    };
    init();
  }, [fetchPlayers, fetchSeasons, activeSeason]);

  useEffect(() => {
    if (!user || !activeSeason) return;

    const loadStats = async () => {
      setLoadingData(true);
      try {
        // Aggregazione completa stagionale (già ottimizzata con Batch)
        const context = await aggregationRepository.getSeasonContext(user.id, activeSeason.id);
        const allStats = aggregationRepository.getPlayersAggregatedStatsFromContext(context);
        const pStats = allStats.find((s) => s.playerId === playerId);

        // Calcola W/D/L e metriche "On Pitch"
        let wins = 0, draws = 0, losses = 0;
        let totalMinutes = 0;
        let cleanSheets = 0;
        let goalsConcededOnPitch = 0;
        let goalsScoredOnPitch = 0;

        const completedMatches = context.matches.filter((m) => m.status === "completed");
        for (const match of completedMatches) {
          const details = context.matchesDetails[match.id];
          if (!details) continue;
          const isStarter = details.lineup?.starters.includes(playerId) ?? false;
          const stat = details.stats.find((s) => s.playerId === playerId);
          const hasPlayed = isStarter || !!stat;
          
          if (hasPlayed) {
            totalMinutes += stat?.minutesPlayed ?? 0;
            
            // Calcolo On-Pitch Goals
            const chronologicalEvents = [...details.events].sort((a,b) => a.minute - b.minute);
            const myTeam = match.isHome ? 'home' : 'away';
            const oppTeam = match.isHome ? 'away' : 'home';
            
            let enterMin = 0;
            let exitMin = match.duration || 90;
            
            if (!isStarter && stat && stat.minutesPlayed > 0) {
               const subIn = chronologicalEvents.find(e => e.type === 'substitution' && e.playerId === playerId);
               enterMin = subIn ? subIn.minute : 0;
            }
            const subOut = chronologicalEvents.find(e => e.type === 'substitution' && e.subOutPlayerId === playerId);
            if (subOut) exitMin = subOut.minute;
            
            let matchGoalsConcededCount = 0;
            chronologicalEvents.forEach(e => {
                if (e.minute >= enterMin && e.minute <= exitMin && e.type === 'goal') {
                   if (e.team === myTeam) goalsScoredOnPitch++;
                   if (e.team === oppTeam) {
                      goalsConcededOnPitch++;
                      matchGoalsConcededCount++;
                   }
                }
            });
            
            // Applica clean sheet logic
            if (player?.role === "Portiere" && matchGoalsConcededCount === 0) cleanSheets++;

            if (!match.result) continue;
            const scored = match.isHome ? match.result.home : match.result.away;
            const conceded = match.isHome ? match.result.away : match.result.home;
            if (scored > conceded) wins++;
            else if (scored < conceded) losses++;
            else draws++;
          }
        }

        setPlayerStats(
          pStats
            ? {
                appearances: pStats.stats.appearances,
                goals: pStats.stats.goals,
                assists: pStats.stats.assists,
                avgMinutes: pStats.stats.avgMinutes,
                yellowCards: pStats.stats.yellowCards ?? 0,
                redCards: pStats.stats.redCards ?? 0,
                totalMinutes,
                wins,
                losses,
                draws,
                cleanSheets,
                goalsConcededOnPitch,
                goalsScoredOnPitch
              }
            : { appearances: 0, goals: 0, assists: 0, avgMinutes: 0, yellowCards: 0, redCards: 0, totalMinutes: 0, wins: 0, losses: 0, draws: 0, cleanSheets: 0, goalsConcededOnPitch: 0, goalsScoredOnPitch: 0 }
        );

        // Storico presenze partite
        const allMatches = context.matches.sort((a, b) => a.date.localeCompare(b.date));
        const mRecords: MatchRecord[] = allMatches.map(match => {
          if (match.status !== "completed") return { match, status: "da_giocare" };
          const details = context.matchesDetails[match.id];
          if (!details || !details.lineup) return { match, status: "non_convocato" };

          const isStarter = details.lineup.starters.includes(playerId);
          const isSub = details.lineup.substitutes.includes(playerId);
          const stat = details.stats.find((s) => s.playerId === playerId);
          const minutesPlayed = stat?.minutesPlayed ?? 0;

          if (isStarter) return { match, status: "titolare" };
          if (isSub) {
            if (minutesPlayed > 0) return { match, status: "entrato" };
            return { match, status: "inutilizzato" };
          }
          return { match, status: "non_convocato" };
        });
        setMatchRecords(mRecords);

        // Storico presenze allenamenti
        const sessions = await trainingRepository.getAll(user.id, activeSeason.id);
        const sortedSessions = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
        const sessionIds = sortedSessions.map((s) => s.id);
        const allAtt = await trainingRepository.getAllAttendanceForSeason(user.id, sessionIds);

        const records: TrainingRecord[] = sortedSessions.map((session) => {
          const attRecord = allAtt.find((a) => a.sessionId === session.id);
          const playerAtt = attRecord?.attendance.find((a) => a.playerId === playerId);
          return { session, status: playerAtt?.status ?? null };
        });
        setTrainingRecords(records);
      } catch (e) {
        console.error("Errore caricamento dettaglio giocatore:", e);
      } finally {
        setLoadingData(false);
      }
    };

    loadStats();
  }, [user, activeSeason, playerId]);

  const radarData = useMemo(() => {
    if (!playerStats) return [];
    const maxApps = Math.max(playerStats.appearances, 1);
    const maxGoals = Math.max(playerStats.goals, 10);
    const maxAssists = Math.max(playerStats.assists, 10);
    const maxWins = maxApps;
    const maxMins = 90;

    return [
      { subject: "Presenze",  score: (playerStats.appearances / maxApps) * 100,  rawValue: playerStats.appearances },
      { subject: "Gol",       score: (playerStats.goals / maxGoals) * 100,       rawValue: playerStats.goals },
      { subject: "Assist",    score: (playerStats.assists / maxAssists) * 100,    rawValue: playerStats.assists },
      { subject: "Vittorie",  score: (playerStats.wins / maxWins) * 100,         rawValue: playerStats.wins },
      { subject: "Min/Medi",  score: (playerStats.avgMinutes / maxMins) * 100,    rawValue: playerStats.avgMinutes },
    ];
  }, [playerStats]);

  const barData = useMemo(() => {
    if (!playerStats) return [];
    return [
      { name: "Vittorie",  value: playerStats.wins,   color: "hsl(145 60% 45%)" },
      { name: "Pareggi",   value: playerStats.draws,  color: "hsl(220 60% 60%)" },
      { name: "Sconfitte", value: playerStats.losses, color: "hsl(0 70% 55%)" },
    ];
  }, [playerStats]);

  const splitName = (fullName: string) => {
    const parts = fullName.split(" ");
    const firstName = parts.shift() || "";
    return { firstName, lastName: parts.join(" ") };
  };

  // ─── Loading skeleton ────────────────────────────────────────────────────────
  if (!player && !loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <User className="h-12 w-12 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">Giocatore non trovato.</p>
        <Button variant="outline" onClick={() => router.push("/membri")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Torna alla Rosa
        </Button>
      </div>
    );
  }

  const { firstName, lastName } = player ? splitName(player.name) : { firstName: "…", lastName: "" };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Link href="/membri" className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <span className="text-xl md:text-3xl">
                {loadingData && !player ? (
                  <Skeleton className="h-7 w-40" />
                ) : (
                  <>
                    <span className="font-light">{firstName}</span>
                    {lastName && <span className="font-black ml-1.5">{lastName}</span>}
                  </>
                )}
              </span>
              {player && (
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded border ${roleBg[player.role] ?? "bg-muted text-muted-foreground"}`}
                >
                  {roleLabel[player.role] ?? player.role}
                </span>
              )}
            </div>
            <span className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider ml-6">
              {activeSeason?.name ?? "…"}
            </span>
          </div>
        }
      >
        <Link href={`/membri/confronto?p1=${playerId}`}>
          <Button variant="outline" size="sm" className="hidden md:flex gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
            <span className="text-xs font-black uppercase tracking-wider">Confronta</span>
          </Button>
        </Link>
        <Link href={`/membri/confronto?p1=${playerId}`} className="md:hidden">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
          </Button>
        </Link>
      </PageHeader>

      {/* Statistiche principali e avanzate */}
      <div className="space-y-2">
        {loadingData ? (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
          </div>
        ) : playerStats ? (
          <>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <StatCard icon={Calendar}       label="Presenze"   value={playerStats.appearances} />
              <StatCard icon={Target}         label="Gol"        value={playerStats.goals}        color="text-emerald-500" />
              <StatCard icon={Zap}            label="Assist"     value={playerStats.assists}       color="text-sky-500" />
              <StatCard icon={Clock}          label="Min giocati" value={playerStats.totalMinutes} sub="minuti totali" />
              <StatCard icon={AlertTriangle}  label="Gialli"     value={playerStats.yellowCards}   color="text-amber-500" />
              <StatCard icon={Shield}         label="Rossi"      value={playerStats.redCards}      color="text-red-500" />
            </div>
            
            {/* Statistiche Avanzate On-Pitch */}
            <div className={`grid grid-cols-2 ${player?.role === 'Portiere' ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-2`}>
              <StatCard icon={Target} label="Gol x Match" value={playerStats.appearances > 0 ? (playerStats.goals / playerStats.appearances).toFixed(2) : "0"} />
              {playerStats.goals > 0 && <StatCard icon={Clock} label="Minuti x Gol" value={Math.round(playerStats.totalMinutes / playerStats.goals)} sub="un gol ogni" />}
              <StatCard icon={Sword} label="Gol Fatti" value={playerStats.goalsScoredOnPitch} sub="in campo" color="text-emerald-500" />
              <StatCard icon={Shield} label="Gol Subiti" value={playerStats.goalsConcededOnPitch} sub="in campo" color="text-red-500" />
              {player?.role === "Portiere" && <StatCard icon={Zap} label="Clean Sheets" value={playerStats.cleanSheets} sub="reti inviolate" color="text-amber-500" />}
            </div>
          </>
        ) : null}
      </div>

      {/* Grafici rendimento */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Radar */}
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-0 px-4 pt-4">
            <CardTitle className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" /> Profilo Tecnico
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-2">
            {loadingData ? <Skeleton className="h-60 w-full" /> : <RadarChart data={radarData} />}
          </CardContent>
        </Card>

        {/* Barchart W/D/L */}
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-0 px-4 pt-4">
            <CardTitle className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sword className="h-3 w-3" /> Risultati Personali
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-2">
            {loadingData ? <Skeleton className="h-40 w-full" /> : (
              <>
                <BarChartComponent data={barData} />
                <p className="text-[9px] text-center text-muted-foreground mt-1 font-medium">
                  Partite giocate: <strong>{playerStats?.appearances ?? 0}</strong> · Minuti totali: <strong>{playerStats?.totalMinutes ?? 0}'</strong>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Heatmap presenze */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-0 px-4 pt-4">
            <CardTitle className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sword className="h-3 w-3" /> Storico Presenze Partite
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 px-4 pb-5">
            {loadingData ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <MatchHeatmap records={matchRecords} />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader className="pb-0 px-4 pt-4">
            <CardTitle className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> Storico Presenze Allenamenti
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 px-4 pb-5">
            {loadingData ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <TrainingHeatmap records={trainingRecords} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
