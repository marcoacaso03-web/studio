"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, PlusCircle, Rocket, Trash2, Users, Trophy } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


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
        await playerRepository.add({ name: "Marco Rossi", number: 10, role: "Attaccante" });
        await playerRepository.add({ name: "Luca Bianchi", number: 5, role: "Difensore" });
        await playerRepository.add({ name: "Davide Neri", number: 1, role: "Portiere" });
        
        const matchDate = new Date();
        matchDate.setDate(matchDate.getDate() - 2);
        
        await addMatch({
            opponent: "Real Isola",
            location: "Stadio Comunale",
            date: matchDate,
            isHome: true
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
        return <Badge variant="default" className="text-[10px] px-1.5 py-0">Completata</Badge>;
      case 'scheduled':
        return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">In Programma</Badge>;
      case 'canceled':
        return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Annullata</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0">N/D</Badge>;
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
      loadStats(); // Ricarica record dopo aggiunta
    }
  };

  const handleDeleteMatch = async () => {
    if (!matchToDelete) return;
    await removeMatch(matchToDelete.id);
    toast({ title: "Partita eliminata", variant: "destructive" });
    setMatchToDelete(null);
    loadStats(); // Ricarica record dopo eliminazione
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
        <Card>
          <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl md:text-2xl">Dashboard Partite</CardTitle>
                <CardDescription className="text-xs md:text-sm">Gare e andamento della stagione.</CardDescription>
              </div>
              <div className="flex gap-2">
                {matches.length === 0 && !loading && (
                    <Button variant="outline" size="sm" onClick={handleSeedData}>
                        <Rocket className="mr-2 h-4 w-4" /> Esempio
                    </Button>
                )}
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full md:w-auto" size="sm" onClick={() => setIsFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Aggiungi Partita
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-6 md:pt-0">
            {matchesLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : matches.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg mx-4 mb-4">
                    <p className="font-semibold text-sm text-foreground">Nessuna partita</p>
                    <p className="text-[10px] mt-1">Usa "Aggiungi Partita" per iniziare.</p>
                </div>
            ) : (
            <Table>
              <TableHeader className="hidden md:table-header-group">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Avversario</TableHead>
                  <TableHead>Luogo</TableHead>
                  <TableHead>Risultato</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="w-24 text-right pr-6">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id} className="flex flex-col md:table-row py-2 md:py-0 px-4 md:px-0 border-b">
                    <TableCell className="font-medium p-0 md:p-4 text-xs md:text-sm">
                      <span className="md:hidden text-muted-foreground mr-1">Data:</span>
                      {new Date(match.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="p-0 md:p-4 font-bold md:font-normal text-sm md:text-base">
                      <span className="md:hidden text-muted-foreground font-normal mr-1">Vs:</span>
                      {match.opponent}
                    </TableCell>
                    <TableCell className="p-0 md:p-4 text-[10px] md:text-sm text-muted-foreground md:text-foreground">
                      {match.location} {match.isHome ? '(C)' : '(T)'}
                    </TableCell>
                    <TableCell className="p-0 md:p-4 text-sm font-bold md:font-normal">
                       <span className="md:hidden text-muted-foreground font-normal mr-1">Risultato:</span>
                      {match.result ? `${match.result.home} - ${match.result.away}` : '-'}
                    </TableCell>
                    <TableCell className="p-0 md:p-4 py-1 md:py-4">
                      {getStatusBadge(match.status)}
                    </TableCell>
                    <TableCell className="text-right p-0 md:p-4 md:pr-4 pt-1 md:pt-4">
                      <div className="flex items-center justify-start md:justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-7 px-2 md:h-8 md:w-8 md:p-0 text-xs md:text-sm" asChild>
                          <Link href={`/calendario/${match.id}`}>
                            <Eye className="h-3.5 w-3.5 md:mr-0 mr-1" />
                            <span className="md:hidden">Dettagli</span>
                          </Link>
                        </Button>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hidden md:flex"
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
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-3 md:p-4 pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-lg font-bold">Rosa</CardTitle>
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              {playersLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex flex-col space-y-2">
                  <div className="text-xl md:text-3xl font-black text-primary">
                    {roleStats.total} <span className="text-[10px] md:text-sm font-normal text-muted-foreground">Totali</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 md:gap-4">
                    <span className="text-[9px] md:text-xs font-bold text-muted-foreground">A: {roleStats.attaccanti}</span>
                    <span className="text-[9px] md:text-xs font-bold text-muted-foreground">C: {roleStats.centrocampisti}</span>
                    <span className="text-[9px] md:text-xs font-bold text-muted-foreground">D: {roleStats.difensori}</span>
                    <span className="text-[9px] md:text-xs font-bold text-muted-foreground">P: {roleStats.portieri}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between p-3 md:p-4 pb-1 md:pb-2">
              <CardTitle className="text-xs md:text-lg font-bold">Stato</CardTitle>
              <Trophy className="h-3.5 w-3.5 text-accent" />
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              {statsLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="flex flex-col space-y-2">
                  <div className="text-xl md:text-3xl font-black text-primary">
                    {teamRecord?.matchesPlayed || 0} <span className="text-[10px] md:text-sm font-normal text-muted-foreground">Gare</span>
                  </div>
                  <div className="flex gap-1.5 md:gap-2">
                    <div className="flex flex-col items-center flex-1 py-0.5 bg-green-50 rounded border border-green-100">
                      <span className="text-[8px] font-bold text-green-700">V</span>
                      <span className="text-xs font-black text-green-600">{teamRecord?.wins || 0}</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 py-0.5 bg-yellow-50 rounded border border-yellow-100">
                      <span className="text-[8px] font-bold text-yellow-700">P</span>
                      <span className="text-xs font-black text-yellow-600">{teamRecord?.draws || 0}</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 py-0.5 bg-red-50 rounded border border-red-100">
                      <span className="text-[8px] font-bold text-red-700">S</span>
                      <span className="text-xs font-black text-red-600">{teamRecord?.losses || 0}</span>
                    </div>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. La partita verrà eliminata definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMatch} className="bg-destructive hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
