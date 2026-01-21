"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getMatches, addMatch, updateMatch, deleteMatch } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


export default function CalendarioPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setMatches(getMatches());
  }, []);

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

  const handleOpenForm = (match: Match | null) => {
    setSelectedMatch(match);
    setIsFormOpen(true);
  };
  
  const handleSaveMatch = (data: {opponent: string, location: string, date: Date, isHome: boolean}, matchId?: string) => {
    const matchData = { ...data, date: data.date.toISOString() };

    if (matchId) {
      const updated = updateMatch(matchId, matchData);
      if(updated) {
        toast({ title: "Partita aggiornata", description: `La partita contro ${updated.opponent} è stata modificata.` });
      }
    } else {
      const newMatch = addMatch(matchData);
      toast({ title: "Partita aggiunta", description: `La partita contro ${newMatch.opponent} è stata creata.` });
    }
    setMatches(getMatches());
  };

  const handleDeleteMatch = (matchId: string) => {
    const success = deleteMatch(matchId);
    if(success) {
        setMatches(matches.filter(m => m.id !== matchId));
        toast({ title: "Partita eliminata", variant: "destructive" });
    }
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
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleOpenForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Aggiungi Partita
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
                            <DropdownMenuItem onClick={() => handleOpenForm(match)}>
                              Modifica
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground">
                                  Elimina
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Questa azione non può essere annullata. La partita verrà eliminata definitivamente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteMatch(match.id)} className="bg-destructive hover:bg-destructive/90">
                                    Elimina
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
      <MatchFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSave={handleSaveMatch} 
        match={selectedMatch} 
      />
    </>
  );
}
