
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
        return <Badge variant="default">Completata</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">In Programma</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Annullata</Badge>;
      default:
        return <Badge variant="outline">N/D</Badge>;
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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Dashboard Partite</CardTitle>
                <CardDescription>Visualizza e gestisci le tue gare e l'andamento della stagione.</CardDescription>
              </div>
              <div className="flex gap-2">
                {matches.length === 0 && !loading && (
                    <Button variant="outline" onClick={handleSeedData}>
                        <Rocket className="mr-2 h-4 w-4" /> Esempio
                    </Button>
                )}
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setIsFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Aggiungi Partita
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {matchesLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : matches.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg mt-4">
                    <p className="font-semibold text-lg text-foreground">Nessuna partita in programma</p>
                    <p className="text-sm mt-1">Usa il pulsante "Aggiungi Partita" o "Esempio" per iniziare.</p>
                </div>
            ) : (
            <Table>
              <TableHeader>
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
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">
                      {new Date(match.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell>{match.opponent}</TableCell>
                    <TableCell>{match.location} {match.isHome ? '(C)' : '(T)'}</TableCell>
                    <TableCell>
                      {match.result ? `${match.result.home} - ${match.result.away}` : '-'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(match.status)}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                              <Link href={`/calendario/${match.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Vedi Dettagli</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => setMatchToDelete(match)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Elimina</TooltipContent>
                        </Tooltip>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="aspect-square md:aspect-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold">Riepilogo Rosa</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {playersLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <div className="flex flex-col justify-center h-full space-y-4 pt-2">
                  <div className="text-3xl font-black text-primary">{roleStats.total} <span className="text-sm font-normal text-muted-foreground">Giocatori Totali</span></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Attaccanti</span>
                      <span className="text-xl font-bold">A: {roleStats.attaccanti}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Centrocampisti</span>
                      <span className="text-xl font-bold">C: {roleStats.centrocampisti}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Difensori</span>
                      <span className="text-xl font-bold">D: {roleStats.difensori}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Portieri</span>
                      <span className="text-xl font-bold">P: {roleStats.portieri}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="aspect-square md:aspect-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold">Stato Stagione</CardTitle>
              <Trophy className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <div className="flex flex-col justify-center h-full space-y-4 pt-2">
                  <div className="text-3xl font-black text-primary">{teamRecord?.matchesPlayed || 0} <span className="text-sm font-normal text-muted-foreground">Gare Disputate</span></div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex flex-col items-center">
                      <span className="text-xs font-bold text-green-700 uppercase">Vinte</span>
                      <span className="text-2xl font-black text-green-600">{teamRecord?.wins || 0}</span>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex flex-col items-center">
                      <span className="text-xs font-bold text-yellow-700 uppercase">Pari</span>
                      <span className="text-2xl font-black text-yellow-600">{teamRecord?.draws || 0}</span>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex flex-col items-center">
                      <span className="text-xs font-bold text-red-700 uppercase">Perse</span>
                      <span className="text-2xl font-black text-red-600">{teamRecord?.losses || 0}</span>
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
