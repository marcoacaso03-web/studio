"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Users, Trophy, Calendar, Home, Plane, LayoutList } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Match, MatchStatus } from "@/lib/types";
import { useMatchesStore } from "@/store/useMatchesStore";
import { usePlayersStore } from "@/store/usePlayersStore";
import { useStatsStore } from "@/store/useStatsStore";
import { useSeasonsStore } from "@/store/useSeasonsStore";
import { Skeleton } from "@/components/ui/skeleton";
import { FullCalendarDialog } from "@/components/partite/full-calendar-dialog";

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
        return <div className="h-1.5 w-1.5 rounded-full bg-primary" title="Finita" />;
      case 'scheduled':
        return <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" title="Programmata" />;
      case 'canceled':
        return <div className="h-1.5 w-1.5 rounded-full bg-destructive" title="Annullata" />;
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
    <div className="space-y-3 md:space-y-6">
      {/* Mini Stats Cards */}
      <div className="grid grid-cols-2 gap-2">
        <Card 
          className="shadow-sm border rounded-2xl bg-card overflow-hidden h-[90px] md:h-[100px] cursor-pointer hover:bg-primary/5 transition-colors active:scale-95"
          onClick={() => router.push('/membri')}
        >
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-0.5">
            <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">ROSA</CardTitle>
            <Users className="h-3 w-3 text-primary/40" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {playersLoading ? <Skeleton className="h-8 w-full rounded-xl" /> : (
              <div className="flex flex-col">
                <div className="text-2xl font-black text-primary tracking-tighter leading-none">{roleStats.total}</div>
                <div className="flex flex-wrap gap-x-2 text-[8px] font-bold text-muted-foreground uppercase mt-1 border-t pt-1 border-muted">
                  <span className="text-primary">ATT:{roleStats.attaccanti}</span>
                  <span>CEN:{roleStats.centrocampisti}</span>
                  <span>DIF:{roleStats.difensori}</span>
                  <span className="text-accent">POR:{roleStats.portieri}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card 
          className="shadow-sm border rounded-2xl bg-card overflow-hidden h-[90px] md:h-[100px] cursor-pointer hover:bg-primary/5 transition-colors active:scale-95"
          onClick={() => router.push('/statistiche')}
        >
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-0.5">
            <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Statistiche</CardTitle>
            <Trophy className="h-3 w-3 text-accent/40" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {statsLoading ? <Skeleton className="h-8 w-full rounded-xl" /> : (
              <div className="flex flex-col">
                <div className="text-2xl font-black text-primary tracking-tighter leading-none">{teamRecord?.matchesPlayed || 0}</div>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 border-t pt-1 border-muted">
                  <span className="text-[8px] font-bold text-primary uppercase">V:{teamRecord?.wins || 0}</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase">P:{teamRecord?.draws || 0}</span>
                  <span className="text-[8px] font-bold text-accent uppercase">S:{teamRecord?.losses || 0}</span>
                  <span className="text-[8px] font-black text-foreground/60 uppercase">DR:{teamRecord?.goalsFor || 0}-{teamRecord?.goalsAgainst || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border shadow-sm bg-card rounded-2xl">
        <CardHeader className="p-3 md:p-4 border-b bg-muted/5 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base md:text-lg text-primary font-black uppercase tracking-tight">Prossime & Recenti</CardTitle>
            <CardDescription className="text-[8px] md:text-[9px] uppercase font-bold text-muted-foreground/60 tracking-widest">
               {activeSeason ? `Stagione ${activeSeason.name}` : 'Identificazione...'}
            </CardDescription>
          </div>
          <Button 
            variant="outline"
            className="border-primary/20 text-primary h-7 md:h-8 text-[8px] md:text-[9px] font-black uppercase px-2 md:px-3 rounded-xl"
            size="sm"
            onClick={() => setIsFullCalendarOpen(true)}
          >
            <LayoutList className="mr-1 h-3 w-3" />
            Vedi Tutto
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {matchesLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
            </div>
          ) : dashboardMatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-2xl m-3 bg-muted/10">
                  <Calendar className="h-8 w-8 mx-auto opacity-20 mb-2" />
                  <p className="font-black text-[10px] text-foreground uppercase tracking-widest">Nessuna partita</p>
              </div>
          ) : (
            <Table>
              <TableBody>
                {dashboardMatches.map((match) => {
                  const mDate = new Date(match.date);
                  const day = mDate.getDate().toString().padStart(2, '0');
                  const month = mDate.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase();
                  
                  return (
                    <TableRow key={match.id} className="h-12 border-b hover:bg-primary/5 transition-all group cursor-pointer" onClick={() => navigateToMatch(match)}>
                      <TableCell className="p-0 px-3">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center min-w-[32px]">
                            <span className="text-[11px] font-black leading-none text-primary">{day}</span>
                            <span className="text-[8px] font-bold text-muted-foreground">{month}</span>
                          </div>
                          <div className="p-1.5 bg-muted/30 rounded-lg">
                            {match.isHome ? <Home className="h-3 w-3 text-primary/60" /> : <Plane className="h-3 w-3 text-accent/60" />}
                          </div>
                          <div className="flex-1 flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-foreground uppercase tracking-tight truncate max-w-[120px]">
                                {match.opponent}
                              </span>
                              <span className="text-[9px] font-bold text-muted-foreground uppercase">{match.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded-lg min-w-[32px] text-center">
                                <span className="text-[11px] font-black tabular-nums text-primary">
                                  {match.result ? `${match.result.home}-${match.result.away}` : '- : -'}
                                </span>
                              </div>
                              <StatusBadge status={match.status} />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <FullCalendarDialog 
        open={isFullCalendarOpen} 
        onOpenChange={setIsFullCalendarOpen} 
      />
    </div>
  );
}
