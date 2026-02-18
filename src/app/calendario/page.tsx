
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Rocket } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { playerRepository } from "@/lib/repositories/player-repository";


export default function CalendarioPage() {
  const { matches, loading, fetchAll, add, remove } = useMatchesStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSeedData = async () => {
    try {
        const p1 = await playerRepository.add({ name: "Marco Rossi", number: 10, role: "Attaccante" });
        const p2 = await playerRepository.add({ name: "Luca Bianchi", number: 5, role: "Difensore" });
        const p3 = await playerRepository.add({ name: "Davide Neri", number: 1, role: "Portiere" });
        
        const matchDate = new Date();
        matchDate.setDate(matchDate.getDate() - 2);
        
        await add({
            opponent: "Real Isola",
            location: "Stadio Comunale",
            date: matchDate,
            isHome: true
        });

        toast({ title: "Dati di esempio creati", description: "Abbiamo aggiunto giocatori e una partita per farti esplorare l'app." });
        fetchAll();
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

    const newMatch = await add(matchData);
    if (newMatch) {
      toast({ title: "Partita aggiunta", description: `La partita contro ${newMatch.opponent} è stata creata.` });
    }
  };

  const handleDeleteMatch = async () => {
    if (!matchToDelete) return;
    await remove(matchToDelete.id);
    toast({ title: "Partita eliminata", variant: "destructive" });
    setMatchToDelete(null);
  };


  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendario Partite</CardTitle>
            <CardDescription>Visualizza e gestisci tutte le partite della stagione.</CardDescription>
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
        {loading ? (
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
              <TableHead>
                <span className="sr-only">Azioni</span>
              </TableHead>
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
                <TableCell>
                   <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Apri menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/calendario/${match.id}`}>Vedi Dettagli</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onSelect={(e) => {
                                e.preventDefault();
                                setTimeout(() => setMatchToDelete(match), 0);
                              }} 
                              className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground"
                            >
                              Elimina
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>

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
    </>
  );
}
