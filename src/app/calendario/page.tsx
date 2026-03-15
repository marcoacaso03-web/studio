"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2, Users, Trophy, Calendar, ArrowRight, Globe } from "lucide-react";
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
        return <Badge variant="default" className="text-[8px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20 uppercase font-black">Finita</Badge>;
      case 'scheduled':
        return <Badge variant="secondary" className="text-[8px] px-1.5 py-0 uppercase font-black">Programmata</Badge>;
      case 'canceled':
        return <Badge variant="destructive" className="text-[8px] px-1.5 py-0 uppercase font-black">Annullata</Badge>;
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

  // Navigazione esplicita alla rotta dinamica /calendario/[id] passando il seasonId come parametro query
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
      <Card className="overflow-hidden border shadow-md bg-card rounded-2xl">
        <CardHeader className="p-4 md:p-6 pb-2 md:pb-4 border-b bg-muted/5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg md:text-2xl text-primary font-black uppercase tracking-tight">Calendario</CardTitle>
              <CardDescription className="text-[10px] md:text-sm uppercase font-bold text-muted-foreground/60 tracking-widest">
                 {activeSeason ? `Stagione ${activeSeason.name}` : 'Identificazione stagione...'}
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button 
                variant="outline"
                className="flex-1 md:flex-none border-primary/20 text-primary hover:bg-primary/5 h-8 md:h-10 text-[10px] md:text-xs font-black uppercase px-4 rounded-xl"
                size="sm"
                onClick={() => setIsImportOpen(true)}
              >
                <Globe className="mr-1.5 h-3.5 w-3.5" />
                Importa
              </Button>
              <Button className="flex-1 md:flex-none bg-accent text-accent-foreground hover:bg-accent/90 h-8 md:h-10 text-[10px] md:text-xs font-black uppercase px-4 rounded-xl shadow-lg" size="sm" onClick={() => setIsFormOpen(true)}>
                  <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                  Nuova Gara
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {matchesLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : matches.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl m-4 bg-muted/10">
                  <Calendar className="h-10 w-10 mx-auto opacity-20 mb-3" />
                  <p className="font-black text-xs text-foreground uppercase tracking-widest">Nessuna partita in archivio</p>
                  <p className="text-[10px] mt-1 font-bold uppercase opacity-60">Inizia subito la tua nuova stagione sportiva.</p>
              </div>
          ) : (
          <div className="overflow-x-auto">
            <Table className="block md:table">
              <TableHeader className="hidden md:table-header-group bg-muted/30">
                <TableRow className="border-none">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest px-6">Gara & Data</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Competizione</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Risultato</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Stato</TableHead>
                  <TableHead className="w-24 text-right pr-6 text-[10px] font-black uppercase tracking-widest">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="block md:table-row-group">
                {matches.map((match) => (
                  <TableRow key={match.id} className="flex flex-row items-center justify-between md:table-row border-b hover:bg-primary/5 transition-all group cursor-default">
                    {/* Area Cliccabile Sinistra: Data, Avversario, Tipo */}
                    <TableCell 
                      className="p-4 px-6 block md:table-cell flex-1 md:flex-none cursor-pointer"
                      onClick={() => navigateToMatch(match)}
                      title="Clicca per visualizzare i dettagli"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center h-10 w-10 bg-primary/5 rounded-xl border border-primary/10 md:hidden">
                            <span className="text-[8px] font-black text-primary uppercase">{new Date(match.date).toLocaleDateString('it-IT', { month: 'short' })}</span>
                            <span className="text-lg font-black text-primary leading-none">{new Date(match.date).getDate()}</span>
                        </div>
                        <div className="flex flex-col md:block">
                          <span className="hidden md:inline text-xs font-bold text-muted-foreground mr-3">
                            {new Date(match.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-sm md:text-base font-black text-primary uppercase tracking-tight">
                            Vs {match.opponent}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 md:hidden">
                             <span className="text-[9px] font-bold text-muted-foreground uppercase">{match.type}</span>
                             <Badge variant="outline" className="text-[8px] py-0 px-1 border-primary/20 text-primary font-black uppercase">{match.isHome ? 'CASA' : 'TRASF'}</Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell 
                      className="hidden md:table-cell cursor-pointer"
                      onClick={() => navigateToMatch(match)}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase text-foreground">{match.type}</span>
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">{match.isHome ? 'CASA' : 'TRASFERTA'}</span>
                      </div>
                    </TableCell>

                    <TableCell 
                      className="p-4 block md:table-cell text-center flex flex-col items-center md:block mr-4 md:mr-0 cursor-pointer"
                      onClick={() => navigateToMatch(match)}
                    >
                      <div className="inline-flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                        <span className="text-xs md:text-lg font-black tabular-nums">
                          {match.result ? `${match.result.home}-${match.result.away}` : 'v - v'}
                        </span>
                        <ArrowRight className="h-3 w-3 text-primary opacity-30 md:hidden" />
                      </div>
                      <div className="md:hidden mt-2"><StatusBadge status={match.status} /></div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell cursor-pointer" onClick={() => navigateToMatch(match)}>
                      <StatusBadge status={match.status} />
                    </TableCell>
                    
                    <TableCell className="text-right p-4 block md:table-cell">
                      <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors" 
                            onClick={(e) => { e.stopPropagation(); setMatchToDelete(match); }}
                            title="Elimina Gara"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:gap-6">
        <Card className="shadow-md border rounded-2xl bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">ROSA</CardTitle>
            <div className="p-1.5 bg-primary/5 rounded-lg"><Users className="h-4 w-4 text-primary" /></div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {playersLoading ? <Skeleton className="h-10 w-full rounded-xl" /> : (
              <div className="flex flex-col">
                <div className="text-3xl md:text-5xl font-black text-primary tracking-tighter">{roleStats.total}</div>
                <div className="flex flex-wrap gap-x-3 text-[10px] md:text-xs font-black text-muted-foreground uppercase mt-2 border-t pt-2 border-muted">
                  <span className="text-primary">ATT: {roleStats.attaccanti}</span>
                  <span>CEN: {roleStats.centrocampisti}</span>
                  <span>DIF: {roleStats.difensori}</span>
                  <span className="text-accent">POR: {roleStats.portieri}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-md border rounded-2xl bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-4 pb-1">
            <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Performance</CardTitle>
            <div className="p-1.5 bg-accent/5 rounded-lg"><Trophy className="h-4 w-4 text-accent" /></div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {statsLoading ? <Skeleton className="h-10 w-full rounded-xl" /> : (
              <div className="flex flex-col">
                <div className="text-3xl md:text-5xl font-black text-primary tracking-tighter">{teamRecord?.matchesPlayed || 0}</div>
                <div className="flex gap-3 mt-2 border-t pt-2 border-muted">
                  <span className="text-[10px] md:text-xs font-black text-primary uppercase">V: {teamRecord?.wins || 0}</span>
                  <span className="text-[10px] md:text-xs font-black text-muted-foreground uppercase">P: {teamRecord?.draws || 0}</span>
                  <span className="text-[10px] md:text-xs font-black text-accent uppercase">S: {teamRecord?.losses || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
              Questa azione è irreversibile. Tutti gli eventi e le statistiche associate andranno persi.
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
