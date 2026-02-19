
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, PlusCircle, Rocket, Trash2, Users, Trophy, Calendar } from "lucide-react";
import Link from "next/link";
import { Match } from "@/lib/types";
import { MatchFormDialog } from "@/components/partite/match-form-dialog";
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
import { useToast } from "@/hooks/use-toast";
import { useMatchesStore } from "@/store/useMatchesStore";
import { usePlayersStore } from "@/store/usePlayersStore";
import { useStatsStore } from "@/store/useStatsStore";
import { Skeleton } from "@/components/ui/skeleton";
import { playerRepository } from "@/lib/repositories/player-repository";
import { TooltipProvider } from "@/components/ui/tooltip";


export default function DashboardPage() {
  const { matches, loading: matchesLoading, fetchAll: fetchMatches, add: addMatch, remove: removeMatch } = useMatchesStore();
  const { players, loading: playersLoading, fetchAll: fetchPlayers } = usePlayersStore();
  const { teamRecord, loading: statsLoading, loadStats } = useStatsStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
    loadStats();
  }, [fetchMatches, fetchPlayers, loadStats]);

  const handleSeedData = async () => {
    try {
        await playerRepository.add({ name: "Marco Rossi", role: "Attaccante" });
        await playerRepository.add({ name: "Luca Bianchi", role: "Difensore" });
        await playerRepository.add({ name: "Davide Neri", role: "Portiere" });
        
        const matchDate = new Date();
        matchDate.setDate(matchDate.getDate() - 2);
        
        await addMatch({
            opponent: "Real Isola",
            location: "Stadio Comunale",
            date: matchDate,
            isHome: true,
            duration: 90
        });

        toast({ title: "Dati di esempio creati", description: "Abbiamo aggiunto giocatori e una partita per farti esplorare l'app." });
        fetchMatches();
        fetchPlayers();
        loadStats();
    } catch (e) {
        console.error(e);
    }
  };

  const getStatusBadge = (status: 'scheduled' | 'completed' | 'canceled') => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">FIN</Badge>;
      case 'scheduled':
        return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">PROG</Badge>;
      case 'canceled':
        return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">ANN</Badge>;
      default:
        return null;
    }
  }

  const handleSaveMatch = async (data: any) => {
    const matchData = { 
        ...data, 
        date: data.date.toISOString(),
    };

    const newMatch = await addMatch(matchData);
    if (newMatch) {
      toast({ title: "Partita aggiunta", description: `La partita contro ${newMatch.opponent} è stata creata.` });
      loadStats();
    }
  };

  const handleDeleteMatch = async () => {
    if (!matchToDelete) return;
    await removeMatch(matchToDelete.id);
    toast({ title: "Partita eliminata", variant: "destructive" });
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

  const loading = matchesLoading || playersLoading || statsLoading;

  return (
    <TooltipProvider>
      <div className="space-y-4 md:space-y-6">
        <Card className="overflow-hidden border shadow-md bg-card">
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4 border-b bg-muted/5">
            <div className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="text-lg md:text-2xl text-primary font-black uppercase tracking-tight">Partite</CardTitle>
                <CardDescription className="text-[10px] md:text-sm uppercase font-bold text-muted-foreground/60">Stagione 2024/25</CardDescription>
              </div>
              <div className="flex gap-2">
                {matches.length === 0 && !loading && (
                    <Button variant="outline" size="sm" onClick={handleSeedData} className="h-8 text-[10px] px-2">
                        <Rocket className="mr-1 h-3 w-3" /> Esempio
                    </Button>
                )}
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-8 md:h-9 text-[10px] md:text-xs font-black uppercase" size="sm" onClick={() => setIsFormOpen(true)}>
                    <PlusCircle className="mr-1 h-3.5 w-3.5" />
                    Nuova
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {matchesLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : matches.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg m-4">
                    <p className="font-semibold text-xs text-foreground uppercase">Nessuna partita</p>
                    <p className="text-[10px] mt-1">Inizia subito la tua stagione.</p>
                </div>
            ) : (
            <Table className="block md:table">
              <TableHeader className="hidden md:table-header-group bg-muted/30">
                <TableRow>
                  <TableHead className="text-[10px] font-bold uppercase">Data</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase">Avversario</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase">Luogo</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase">Risultato</TableHead>
                  <TableHead className="text-[10px] font-bold uppercase">Stato</TableHead>
                  <TableHead className="w-24 text-right pr-6 text-[10px] font-bold uppercase">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="block md:table-row-group">
                {matches.map((match) => (
                  <TableRow key={match.id} className="flex flex-row items-center justify-between md:table-row py-3 px-4 md:px-0 border-b hover:bg-muted/5 transition-colors">
                    <TableCell className="p-0 md:p-4 block md:table-cell flex-1 md:flex-none">
                      <div className="flex flex-col md:block">
                        <span className="text-[10px] font-bold text-primary flex items-center gap-1 md:hidden">
                          <Calendar className="h-3 w-3" />
                          {new Date(match.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                        </span>
                        <span className="hidden md:inline text-sm">
                          {new Date(match.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-sm md:text-base font-black text-foreground block md:hidden mt-0.5">
                          {match.opponent}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="hidden md:table-cell font-bold">
                      {match.opponent}
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {match.location} {match.isHome ? '(C)' : '(T)'}
                    </TableCell>

                    <TableCell className="p-0 md:p-4 block md:table-cell text-center md:text-left flex flex-col items-center md:block mr-4 md:mr-0">
                      <span className="text-xs md:text-base font-black bg-primary/5 px-2 py-1 rounded border border-primary/10">
                        {match.result ? `${match.result.home}-${match.result.away}` : 'v-v'}
                      </span>
                      <div className="md:hidden mt-1">
                        {getStatusBadge(match.status)}
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {getStatusBadge(match.status)}
                    </TableCell>

                    <TableCell className="text-right p-0 md:p-4 md:pr-4 block md:table-cell">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="outline" size="icon" className="h-8 w-8 md:h-9 md:w-9 border-primary/20 text-primary hover:bg-primary/5" asChild>
                          <Link href={`/calendario/${match.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 md:h-9 md:w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                          onClick={() => setMatchToDelete(match)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>

        {/* Riepilogo Dashboard */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <Card className="shadow-sm border bg-card">
            <CardHeader className="flex flex-row items-center justify-between p-3 md:p-4 pb-1 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-black uppercase tracking-wider text-muted-foreground/60">Rosa</CardTitle>
              <Users className="h-3.5 w-3.5 text-primary" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              {playersLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="flex flex-col">
                  <div className="text-2xl md:text-4xl font-black text-primary leading-tight">
                    {roleStats.total}
                  </div>
                  <div className="flex flex-wrap gap-x-2 text-[8px] md:text-[10px] font-bold text-muted-foreground/80 uppercase">
                    <span>ATT: {roleStats.attaccanti}</span>
                    <span>CEN: {roleStats.centrocampisti}</span>
                    <span>DIF: {roleStats.difensori}</span>
                    <span>POR: {roleStats.portieri}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border bg-card">
            <CardHeader className="flex flex-row items-center justify-between p-3 md:p-4 pb-1 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-black uppercase tracking-wider text-muted-foreground/60">Record</CardTitle>
              <Trophy className="h-3.5 w-3.5 text-accent" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              {statsLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="flex flex-col">
                  <div className="text-2xl md:text-4xl font-black text-primary leading-tight">
                    {teamRecord?.matchesPlayed || 0}
                  </div>
                  <div className="flex gap-1.5 md:gap-2">
                    <span className="text-[8px] md:text-[10px] font-bold text-green-600 uppercase">V: {teamRecord?.wins || 0}</span>
                    <span className="text-[8px] md:text-[10px] font-bold text-yellow-600 uppercase">P: {teamRecord?.draws || 0}</span>
                    <span className="text-[8px] md:text-[10px] font-bold text-red-600 uppercase">S: {teamRecord?.losses || 0}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <MatchFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSave={handleSaveMatch} 
        match={null} 
      />

      <AlertDialog open={!!matchToDelete} onOpenChange={(open) => !open && setMatchToDelete(null)}>
        <AlertDialogContent className="max-w-[90vw] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary font-black uppercase">Elimina Gara</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium">
              Questa azione non può essere annullata. Tutti gli eventi e le statistiche di questa partita verranno eliminati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 sm:gap-0 mt-4">
            <AlertDialogCancel className="flex-1 mt-0 rounded-xl font-bold uppercase text-xs h-11">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMatch} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl font-bold uppercase text-xs h-11">
              Conferma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
