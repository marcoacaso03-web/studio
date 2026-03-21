"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, User, Shield, Sword, Zap, Clock, AlertTriangle, Target, Calendar, BarChart2, ArrowRightLeft } from "lucide-react";

import { usePlayersStore } from "@/store/usePlayersStore";
import { useSeasonsStore } from "@/store/useSeasonsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { aggregationRepository } from "@/lib/repositories/aggregation-repository";
import type { Player } from "@/lib/types";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RadarChart = dynamic(
  () => import("recharts").then((mod) => {
    const { RadarChart: RC, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } = mod;
    const Chart = ({ data, name1, name2 }: { data: any[], name1: string, name2: string }) => (
      <ResponsiveContainer width="100%" height={280}>
        <RC data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 700 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name={name1} dataKey="score1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
          <Radar name={name2} dataKey="score2" stroke="hsl(330, 80%, 60%)" fill="hsl(330, 80%, 60%)" fillOpacity={0.2} strokeWidth={2} />
          <Tooltip
            contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 11 }}
            formatter={(val: number, name: string, props: any) => {
               const raw = name === name1 ? props.payload.raw1 : props.payload.raw2;
               return [raw, name];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 10 }} />
        </RC>
      </ResponsiveContainer>
    );
    return { default: Chart };
  }),
  { ssr: false, loading: () => <Skeleton className="h-[280px] w-full" /> }
);

function calculatePlayerStats(playerId: string, context: any, player: Player, pStats: any) {
  let wins = 0, draws = 0, losses = 0;
  let totalMinutes = 0, cleanSheets = 0, goalsConcededOnPitch = 0, goalsScoredOnPitch = 0;

  const completedMatches = context.matches.filter((m: any) => m.status === "completed");
  for (const match of completedMatches) {
    const details = context.matchesDetails[match.id];
    if (!details) continue;
    const isStarter = details.lineup?.starters.includes(playerId) ?? false;
    const stat = details.stats.find((s: any) => s.playerId === playerId);
    const hasPlayed = isStarter || !!stat;
    
    if (hasPlayed) {
      totalMinutes += stat?.minutesPlayed ?? 0;
      
      const chronologicalEvents = [...details.events].sort((a: any,b: any) => a.minute - b.minute);
      const myTeam = match.isHome ? 'home' : 'away';
      const oppTeam = match.isHome ? 'away' : 'home';
      
      let enterMin = 0;
      let exitMin = match.duration || 90;
      
      if (!isStarter && stat && stat.minutesPlayed > 0) {
         const subIn = chronologicalEvents.find((e: any) => e.type === 'substitution' && e.playerId === playerId);
         enterMin = subIn ? subIn.minute : 0;
      }
      const subOut = chronologicalEvents.find((e: any) => e.type === 'substitution' && e.subOutPlayerId === playerId);
      if (subOut) exitMin = subOut.minute;
      
      let matchGoalsConcededCount = 0;
      chronologicalEvents.forEach((e: any) => {
          if (e.minute >= enterMin && e.minute <= exitMin && e.type === 'goal') {
             if (e.team === myTeam) goalsScoredOnPitch++;
             if (e.team === oppTeam) { goalsConcededOnPitch++; matchGoalsConcededCount++; }
          }
      });
      
      if (player.role === "Portiere" && matchGoalsConcededCount === 0) cleanSheets++;

      if (!match.result) continue;
      const scored = match.isHome ? match.result.home : match.result.away;
      const conceded = match.isHome ? match.result.away : match.result.home;
      if (scored > conceded) wins++;
      else if (scored < conceded) losses++;
      else draws++;
    }
  }
  
  return pStats ? {
    appearances: pStats.stats.appearances, goals: pStats.stats.goals, assists: pStats.stats.assists,
    avgMinutes: pStats.stats.avgMinutes, yellowCards: pStats.stats.yellowCards ?? 0, redCards: pStats.stats.redCards ?? 0,
    totalMinutes, wins, losses, draws, cleanSheets, goalsConcededOnPitch, goalsScoredOnPitch
  } : { appearances: 0, goals: 0, assists: 0, avgMinutes: 0, yellowCards: 0, redCards: 0, totalMinutes: 0, wins: 0, losses: 0, draws: 0, cleanSheets: 0, goalsConcededOnPitch: 0, goalsScoredOnPitch: 0 };
}

const splitName = (fullName: string) => {
  const parts = fullName.split(" ");
  const firstName = parts.shift() || "";
  return { firstName, lastName: parts.join(" ") };
};

function ConfrontoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const p1Id = searchParams.get("p1");
  const p2Id = searchParams.get("p2");

  const { players, fetchAll: fetchPlayers } = usePlayersStore();
  const { activeSeason, fetchAll: fetchSeasons } = useSeasonsStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [statsP1, setStatsP1] = useState<any>(null);
  const [statsP2, setStatsP2] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      if (!activeSeason) await fetchSeasons();
      await fetchPlayers();
    };
    init();
  }, [fetchPlayers, fetchSeasons, activeSeason]);

  const p1 = useMemo(() => players.find(p => p.id === p1Id) || null, [players, p1Id]);
  const p2 = useMemo(() => players.find(p => p.id === p2Id) || null, [players, p2Id]);

  useEffect(() => {
    if (!user || !activeSeason || !p1Id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const context = await aggregationRepository.getSeasonContext(user.id, activeSeason.id);
        const allStats = aggregationRepository.getPlayersAggregatedStatsFromContext(context);
        
        if (p1Id) {
          const pCurrent = players.find(p => p.id === p1Id);
          if (pCurrent) {
             setStatsP1(calculatePlayerStats(p1Id, context, pCurrent, allStats.find(s => s.playerId === p1Id)));
          }
        }
        if (p2Id) {
          const pCurrent2 = players.find(p => p.id === p2Id);
          if (pCurrent2) {
             setStatsP2(calculatePlayerStats(p2Id, context, pCurrent2, allStats.find(s => s.playerId === p2Id)));
          }
        }
      } catch (e) {
        console.error("Error loading stats", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, activeSeason, p1Id, p2Id, players]);

  // Restrict p2 selection based on p1's role
  const isP1Goalkeeper = p1?.role === "Portiere";
  const eligibleP2s = useMemo(() => {
    if (!p1) return [];
    return players.filter(p => {
       if (p.id === p1.id) return false;
       if (isP1Goalkeeper) return p.role === "Portiere";
       return p.role !== "Portiere"; // Outfield players compared with outfield
    });
  }, [players, p1, isP1Goalkeeper]);

  const handleChangeP2 = (v: string) => {
    router.replace(`/membri/confronto?p1=${p1Id}&p2=${v}`);
  };

  const radarData = useMemo(() => {
    if (!statsP1 || !statsP2) return [];
    const maxApps = Math.max(statsP1.appearances, statsP2.appearances, 1);
    const maxGoals = Math.max(statsP1.goals, statsP2.goals, 10);
    const maxAssists = Math.max(statsP1.assists, statsP2.assists, 10);
    const maxWins = maxApps;
    const maxMins = 90;

    return [
      { 
        subject: "Presenze", 
        score1: (statsP1.appearances / maxApps) * 100, raw1: statsP1.appearances, 
        score2: (statsP2.appearances / maxApps) * 100, raw2: statsP2.appearances 
      },
      { 
        subject: "Gol", 
        score1: (statsP1.goals / maxGoals) * 100, raw1: statsP1.goals,
        score2: (statsP2.goals / maxGoals) * 100, raw2: statsP2.goals 
      },
      { 
        subject: "Assist", 
        score1: (statsP1.assists / maxAssists) * 100, raw1: statsP1.assists,
        score2: (statsP2.assists / maxAssists) * 100, raw2: statsP2.assists 
      },
      { 
        subject: "Vittorie", 
        score1: (statsP1.wins / maxWins) * 100, raw1: statsP1.wins,
        score2: (statsP2.wins / maxWins) * 100, raw2: statsP2.wins 
      },
      { 
        subject: "Min/Medi", 
        score1: (statsP1.avgMinutes / maxMins) * 100, raw1: statsP1.avgMinutes,
        score2: (statsP2.avgMinutes / maxMins) * 100, raw2: statsP2.avgMinutes 
      },
    ];
  }, [statsP1, statsP2]);

  if (!p1Id || (!p1 && !loading)) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <ArrowRightLeft className="h-12 w-12 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">Seleziona un giocatore da confrontare.</p>
          <Button variant="outline" onClick={() => router.push("/membri")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Torna alla Rosa
          </Button>
        </div>
     );
  }

  return (
    <div className="space-y-4 pb-8 max-w-4xl mx-auto">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Link href={`/membri/${p1Id}`} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="font-light">Confronto</span>
            <span className="font-black">Giocatori</span>
          </div>
        }
      />

      {/* Selectors */}
      <div className="grid grid-cols-2 gap-4">
         <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
               <User className="h-8 w-8 text-primary mb-1" />
               <h3 className="font-black text-lg text-primary">{p1?.name ?? "..."}</h3>
               <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">{p1?.role}</span>
            </CardContent>
         </Card>
         
         <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-full">
               {!p2 ? (
                  <Select onValueChange={handleChangeP2}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Confronta con...`} />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleP2s.map(plyr => (
                         <SelectItem key={plyr.id} value={plyr.id}>{plyr.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
               ) : (
                  <>
                     <User className="h-8 w-8 text-[#E13A71] mb-1" />
                     <h3 className="font-black text-lg text-[#E13A71]">{p2.name}</h3>
                     <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => router.replace(`/membri/confronto?p1=${p1Id}`)}>
                        Cambia Avversario
                     </Button>
                  </>
               )}
            </CardContent>
         </Card>
      </div>

      {p1 && p2 && statsP1 && statsP2 && (
         <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <Card className="rounded-2xl border shadow-sm">
                <CardHeader className="pb-0 px-4 pt-4">
                  <CardTitle className="text-[11px] font-black uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1.5">
                    <BarChart2 className="h-3 w-3" /> Bilanciamento Tecnico
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 px-2">
                   <RadarChart data={radarData} name1={p1.name} name2={p2.name} />
                </CardContent>
            </Card>

            <Card className="rounded-2xl border shadow-sm">
                <CardContent className="p-0">
                   <div className="grid grid-cols-3 divide-x border-b items-center py-2 bg-muted/20">
                      <div className="text-center font-black text-primary text-xs truncate px-1">{splitName(p1.name).lastName}</div>
                      <div className="text-center text-[9px] font-black text-muted-foreground uppercase tracking-widest">Metrica</div>
                      <div className="text-center font-black text-[#E13A71] text-xs truncate px-1">{splitName(p2.name).lastName}</div>
                   </div>
                   
                   {[
                      { label: "Presenze", val1: statsP1.appearances, val2: statsP2.appearances, better: "high" },
                      { label: "Valore Gol", val1: statsP1.goals, val2: statsP2.goals, better: "high" },
                      { label: "Assist", val1: statsP1.assists, val2: statsP2.assists, better: "high" },
                      { label: "Min totali", val1: statsP1.totalMinutes, val2: statsP2.totalMinutes, better: "high" },
                      { label: "Min medi", val1: statsP1.avgMinutes, val2: statsP2.avgMinutes, better: "high" },
                      { label: "Vittorie", val1: statsP1.wins, val2: statsP2.wins, better: "high" },
                      { label: "Gol On-Pitch", val1: statsP1.goalsScoredOnPitch, val2: statsP2.goalsScoredOnPitch, better: "high" },
                      { label: "Gol Subiti On-Pitch", val1: statsP1.goalsConcededOnPitch, val2: statsP2.goalsConcededOnPitch, better: "low" },
                      ...(isP1Goalkeeper ? [{ label: "Clean Sheets", val1: statsP1.cleanSheets, val2: statsP2.cleanSheets, better: "high" }] : []),
                   ].map((row, i) => {
                      const is1Better = row.better === "high" ? row.val1 > row.val2 : row.val1 < row.val2;
                      const is2Better = row.better === "high" ? row.val2 > row.val1 : row.val2 < row.val1;
                      return (
                         <div key={i} className="grid grid-cols-3 divide-x border-b last:border-0 items-center py-3 hover:bg-muted/10 transition-colors">
                            <div className={`text-center font-black ${is1Better ? "text-primary text-lg" : "text-muted-foreground text-sm"}`}>{row.val1}</div>
                            <div className="text-center text-[10px] font-bold text-muted-foreground uppercase">{row.label}</div>
                            <div className={`text-center font-black ${is2Better ? "text-[#E13A71] text-lg" : "text-muted-foreground text-sm"}`}>{row.val2}</div>
                         </div>
                      )
                   })}
                </CardContent>
            </Card>
         </div>
      )}
    </div>
  );
}

export default function ConfrontoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-sm">Caricamento...</div>}>
      <ConfrontoContent />
    </Suspense>
  );
}
