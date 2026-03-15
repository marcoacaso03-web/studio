"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, Users, Trophy, Calendar, ArrowRight, Globe, Home, Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Match, MatchStatus } from "@/lib/types";
import { useMatchesStore } from "@/store/useMatchesStore";
import { usePlayersStore } from "@/store/usePlayersStore";
import { useStatsStore } from "@/store/useStatsStore";
import { useSeasonsStore } from "@/store/useSeasonsStore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ImportTuttocampoDialog } from "@/components/partite/import-tuttocampo-dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Dynamic loading for the form to save bundle size
const MatchFormDialog = dynamic(() => import("@/components/partite/match-form-dialog").then(mod => mod.MatchFormDialog), {
  ssr: false
});

export default function DashboardPage() {
  const { matches, loading: matchesLoading, fetchAll: fetchMatches, add: addMatch, remove: removeMatch } = useMatchesStore();
  const { players, loading: playersLoading, fetchAll: fetchPlayers } = usePlayersStore();
  const { teamRecord, loading: statsLoading, loadStats } = useStatsStore();
  const { activeSeason, fetchAll: fetchSeasons } = useSeasonsStore();
  const router = useRouter();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);

  useEffect(() => {
    const initialize = async () => {
      await fetchSeasons();
      fetchMatches();
      fetchPlayers();
      loadStats();
    };
    initialize();
  }, [fetchMatches, fetchPlayers, loadStats, fetchSeasons]);

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

  const handleSaveMatch = async (data: any) => {
    const newMatch = await addMatch(data);
    if (newMatch) {
      loadStats();
    }
  };

  const handleDeleteMatch = async () => {
    if (!matchToDelete) return;
    await removeMatch(matchToDelete.id);
    setMatchToDelete(null);
    loadStats();
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
    if (!match.id) {
        console.error("ERRORE NAVIGAZIONE: ID Partita mancante", match);
        return;
    }
    const path = `/calendario/${match.id}?s=${match.seasonId}`;
    router.push(path);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mini Stats Cards in cima - Grid orizzontale compatta */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-sm border rounded-2xl bg-card overflow-hidden h-[100px]">
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
        <Card className="shadow-sm border rounded-2xl bg-card overflow-hidden h-[100px]">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-0.5">
            <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Performance</CardTitle>
            <Trophy className="h-3 w-3 text-accent/40" />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {statsLoading ? <Skeleton className="h-8 w-full rounded-xl" /> : (
              <div className="flex flex-col">
                <div className="text-2xl font-black text-primary tracking-tighter leading-none">{teamRecord?.matchesPlayed || 0}</div>
                <div className="flex gap-2 mt-1 border-t pt-1 border-muted">
                  <span className="text-[8px] font-bold text-primary uppercase">V:{teamRecord?.wins || 0}</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase">P:{teamRecord?.draws || 0}</span>
                  <span className="text-[8px] font-bold text-accent uppercase">S:{teamRecord?.losses || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border shadow-sm bg-card rounded-2xl">
        <CardHeader className="p-4 border-b bg-muted/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-primary font-black uppercase tracking-tight">Calendario</CardTitle>
              <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-widest">
                 {activeSeason ? `Stagione ${activeSeason.name}` : 'Identificazione...'}
              </CardDescription>
            </div>
            <div className="flex gap-1.5">
              <Button 
                variant="outline"
                className="border-primary/20 text-primary h-8 text-[9px] font-black uppercase px-3 rounded-xl"
                size="sm"
                onClick={() => setIsImportOpen(true)}
              >
                <Globe className="mr-1 h-3 w-3" />
                Importa
              </Button>
              <Button className="bg-accent text-accent-foreground h-8 text-[9px] font-black uppercase px-3 rounded-xl shadow-sm" size="sm" onClick={() => setIsFormOpen(true)}>
                  <PlusCircle className="mr-1 h-3 w-3" />
                  Nuova
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {matchesLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
            </div>
          ) : matches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl m-4 bg-muted/10">
                  <Calendar className="h-10 w-10 mx-auto opacity-20 mb-3" />
                  <p className="font-black text-xs text-foreground uppercase tracking-widest">Nessuna partita</p>
              </div>
          ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableBody>
                {matches.map((match) => {
                  const mDate = new Date(match.date);
                  const day = mDate.getDate().toString().padStart(2, '0');
                  const month = mDate.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase();
                  
                  return (
                    <TableRow key={match.id} className="h-12 border-b hover:bg-primary/5 transition-all group">
                      <TableCell 
                        className="p-0 px-4 cursor-pointer"
                        onClick={() => navigateToMatch(match)}
                      >
                        <div className="flex items-center gap-3">
                          {/* Data compatta */}
                          <div className="flex flex-col items-center min-w-[32px]">
                            <span className="text-[10px] font-black leading-none text-primary">{day}</span>
                            <span className="text-[7px] font-bold text-muted-foreground">{month}</span>
                          </div>

                          {/* Logo casa/trasferta rimpicciolito */}
                          <div className="p-1.5 bg-muted/30 rounded-lg">
                            {match.isHome ? (
                              <Home className="h-3 w-3 text-primary/60" />
                            ) : (
                              <Plane className="h-3 w-3 text-accent/60" />
                            )}
                          </div>

                          {/* Info Partita */}
                          <div className="flex-1 flex items-center justify-between gap-2">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-foreground uppercase tracking-tight truncate max-w-[120px] md:max-w-none">
                                {match.opponent}
                              </span>
                              <span className="text-[8px] font-bold text-muted-foreground uppercase">{match.type}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Risultato a Badge */}
                              <div className="bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-lg min-w-[36px] text-center">
                                <span className="text-[10px] font-black tabular-nums text-primary">
                                  {match.result ? `${match.result.home}-${match.result.away}` : '- : -'}
                                </span>
                              </div>
                              
                              <StatusBadge status={match.status} />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right p-0 pr-4 w-10">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all" 
                          onClick={(e) => { e.stopPropagation(); setMatchToDelete(match); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      {isFormOpen && (
        <MatchFormDialog 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen} 
          onSave={handleSaveMatch} 
          match={null} 
        />
      )}

      {isImportOpen && (
        <ImportTuttocampoDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
        />
      )}

      <AlertDialog open={!!matchToDelete} onOpenChange={(open) => !open && setMatchToDelete(null)}>
        <AlertDialogContent className="max-w-[90vw] rounded-3xl border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary text-2xl font-black uppercase tracking-tight">Elimina Gara</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Questa azione è irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 mt-8">
            <AlertDialogCancel className="flex-1 mt-0 rounded-2xl font-black uppercase text-xs h-12 bg-muted/50 border-none">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMatch} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-2xl font-black uppercase text-xs h-12 shadow-lg shadow-destructive/20">
              Conferma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
