"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Users, Trophy, Calendar, Home, Plane, LayoutList } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Match, MatchStatus } from "@/lib/types";
import { useMatchesStore } from "@/store/useMatchesStore";
import { usePlayersStore } from "@/store/usePlayersStore";
import { useStatsStore } from "@/store/useStatsStore";
import { useSeasonsStore } from "@/store/useSeasonsStore";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const FullCalendarDialog = dynamic(() => import("@/components/partite/full-calendar-dialog").then(mod => mod.FullCalendarDialog), { ssr: false });

export default function DashboardPage() {
  const { matches, loading: matchesLoading, fetchAll: fetchMatches } = useMatchesStore();
  const { players, loading: playersLoading, fetchAll: fetchPlayers } = usePlayersStore();
  const { teamRecord, loading: statsLoading, loadStats } = useStatsStore();
  const { activeSeason, fetchAll: fetchSeasons } = useSeasonsStore();
  const router = useRouter();
  
  const [isFullCalendarOpen, setIsFullCalendarOpen] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await fetchSeasons();
      fetchMatches();
      fetchPlayers();
      loadStats();
    };
    initialize();
  }, [fetchMatches, fetchPlayers, loadStats, fetchSeasons]);

  const dashboardMatches = useMemo(() => {
    if (matchesLoading) return [];
    
    const completed = matches
      .filter(m => m.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
      
    const upcoming = matches
      .filter(m => m.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 1);
      
    return [...completed, ...upcoming].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [matches, matchesLoading]);

  const StatusBadge = ({ status }: { status: MatchStatus }) => {
    switch (status) {
      case 'completed':
        return <div className="h-2 w-2 rounded-full bg-cyan-400 glow-text-cyan" title="Finita" />;
      case 'scheduled':
        return <div className="h-2 w-2 rounded-full bg-muted-foreground/40" title="Programmata" />;
      case 'canceled':
        return <div className="h-2 w-2 rounded-full bg-destructive" title="Annullata" />;
      default:
        return null;
    }
  };

  const roleStats = useMemo(() => {
    return {
      total: players.length,
      attaccanti: players.filter(p => p.role === 'Attaccante').length,
      centrocampisti: players.filter(p => p.role === 'Centrocampista').length,
      difensori: players.filter(p => p.role === 'Difensore').length,
      portieri: players.filter(p => p.role === 'Portiere').length,
    };
  }, [players]);

  const navigateToMatch = (match: Match) => {
    if (!match.id) return;
    router.push(`/calendario/${match.id}?s=${match.seasonId}`);
  };

  return (
    <div className="space-y-4 md:space-y-6 pt-2">
      {/* Mini Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* ROSA CARD */}
        <div 
          className="relative border-yellow-cyan rounded-3xl p-4 cursor-pointer hover:opacity-90 transition-all active:scale-95 bg-card/40 backdrop-blur-sm shadow-2xl overflow-hidden"
          onClick={() => router.push('/membri')}
        >
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-yellow drop-shadow-[0_0_8px_rgba(255,255,0,0.4)]">ROSA</h3>
            <Users className="h-4 w-4 text-brand-cyan opacity-80" />
          </div>
          {playersLoading ? <Skeleton className="h-8 w-16 rounded-lg bg-card/20 hover:bg-card/30" /> : (
            <div className="flex flex-col">
              <div className="text-5xl font-black text-foreground tracking-tighter mb-2">{roleStats.total}</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-80 flex flex-wrap gap-2">
                <span>ATT:{roleStats.attaccanti}</span>
                <span>CEN:{roleStats.centrocampisti}</span>
                <span>DIF:{roleStats.difensori}</span>
                <span>POR:{roleStats.portieri}</span>
              </div>
            </div>
          )}
        </div>

        {/* STATISTICHE CARD */}
        <div 
          className="relative border-yellow-cyan rounded-3xl p-4 cursor-pointer hover:opacity-90 transition-all active:scale-95 bg-card/40 backdrop-blur-sm shadow-2xl overflow-hidden"
          onClick={() => router.push('/statistiche')}
        >
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-yellow drop-shadow-[0_0_8px_rgba(255,255,0,0.4)]">STATISTICHE</h3>
            <Trophy className="h-4 w-4 text-brand-cyan opacity-80" />
          </div>
          {statsLoading ? <Skeleton className="h-8 w-16 rounded-lg bg-card/20 hover:bg-card/30" /> : (
            <div className="flex flex-col">
              <div className="text-5xl font-black text-foreground tracking-tighter mb-2">{teamRecord?.wins || 0}</div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase opacity-80 flex flex-wrap gap-2">
                <span>V:{teamRecord?.wins || 0}</span>
                <span>P:{teamRecord?.draws || 0}</span>
                <span>S:{teamRecord?.losses || 0}</span>
                <span>DR:{teamRecord?.goalsFor || 0}-{teamRecord?.goalsAgainst || 0}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PROSSIME & RECENTI */}
      <div className="relative border-cyan-gradient rounded-[32px] overflow-hidden bg-card/30 backdrop-blur-sm shadow-2xl">
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Prossime & Recenti</h2>
          </div>
          <button 
            onClick={() => setIsFullCalendarOpen(true)}
            className="bg-cyan-gradient px-4 py-1.5 rounded-full text-[10px] font-black uppercase text-primary-foreground glow-neon hover:scale-105 transition-all"
          >
            Vedi Tutto
          </button>
        </div>

        <div className="px-1">
          {matchesLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-2xl bg-card/20 hover:bg-card/30" />)}
            </div>
          ) : dashboardMatches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto opacity-20 mb-3" />
              <p className="font-black text-xs uppercase tracking-[0.2em]">Nessuna partita</p>
            </div>
          ) : (
            <Table>
              <TableBody>
                {dashboardMatches.map((match) => (
                  <TableRow 
                    key={match.id} 
                    className="h-16 border-b border-white/5 hover:bg-card/20 hover:bg-card/30 transition-all group cursor-pointer" 
                    onClick={() => navigateToMatch(match)}
                  >
                    <TableCell className="px-5">
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-3">
                          {match.isHome ? 
                            <Home className="h-6 w-6 text-brand-yellow" /> : 
                            <Plane className="h-6 w-6 text-brand-cyan" />
                          }
                        </div>
                        <div className="flex-1 flex items-center justify-between gap-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-foreground uppercase tracking-tight text-ellipsis truncate max-w-[140px]">
                              {match.opponent}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest leading-none">
                              {match.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-black text-foreground tabular-nums">
                              {match.result ? `${match.result.home} - ${match.result.away}` : '0 - 0'}
                            </span>
                            <StatusBadge status={match.status} />
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <FullCalendarDialog 
        open={isFullCalendarOpen} 
        onOpenChange={setIsFullCalendarOpen} 
      />
    </div>
  );
}
