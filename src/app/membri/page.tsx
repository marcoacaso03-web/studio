"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { Player, Role } from "@/lib/types";
import { PlayerFormDialog } from "@/components/squadra/player-form-dialog";
import { useToast } from "@/hooks/use-toast";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlayersStore } from "@/store/usePlayersStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function RosaPage() {
  const { players, loading, fetchAll, add, update, remove } = usePlayersStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  
  const handleOpenForm = (player: Player | null) => {
    setSelectedPlayer(player);
    setIsFormOpen(true);
  };
  
  const handleSavePlayer = async (data: {name: string, number: number, role: Role}, playerId?: string) => {
    if (playerId) {
      await update(playerId, data);
      toast({ title: "Giocatore aggiornato", description: `I dati di ${data.name} sono stati modificati.` });
    } else {
      const newPlayer = await add(data);
      if (newPlayer) {
        toast({ title: "Giocatore aggiunto", description: `${newPlayer.name} è stato aggiunto alla rosa.` });
      }
    }
  };

  const handleDeleteConfirm = (player: Player) => {
    setPlayerToDelete(player);
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;
    await remove(playerToDelete.id);
    toast({ title: "Giocatore eliminato", description: `${playerToDelete.name} è stato rimosso dalla rosa.`, variant: "destructive" });
    setPlayerToDelete(null);
  };

  const splitName = (fullName: string) => {
    const parts = fullName.split(' ');
    const firstName = parts.shift() || '';
    const lastName = parts.join(' ');
    return { firstName, lastName };
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader 
          title={
            <div className="flex items-center gap-3">
              <span>Rosa</span>
              {!loading && (
                <Badge variant="secondary" className="text-lg px-3 py-0">
                  {players.length}
                </Badge>
              )}
            </div>
          }
        >
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleOpenForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Aggiungi Giocatore
          </Button>
        </PageHeader>

        <Card>
          <CardContent className="p-0">
            {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : players.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg m-6">
                    <h3 className="text-lg font-semibold text-foreground">Nessun giocatore in rosa</h3>
                    <p className="mt-2">Inizia a costruire il tuo team aggiungendo il primo giocatore.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 text-center">#</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Cognome</TableHead>
                      <TableHead>Ruolo</TableHead>
                      <TableHead className="text-center">Presenze</TableHead>
                      <TableHead className="text-center">Min/Gara</TableHead>
                      <TableHead className="text-center">Gol</TableHead>
                      <TableHead className="text-center">Assist</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map((player) => {
                      const { firstName, lastName } = splitName(player.name);
                      return (
                        <TableRow key={player.id}>
                          <TableCell className="font-bold text-center text-muted-foreground">{player.number}</TableCell>
                          <TableCell className="font-medium">{firstName}</TableCell>
                          <TableCell className="font-medium">{lastName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">{player.role}</Badge>
                          </TableCell>
                          <TableCell className="text-center">{player.stats.appearances}</TableCell>
                          <TableCell className="text-center text-muted-foreground">0'</TableCell>
                          <TableCell className="text-center font-bold text-green-600">{player.stats.goals}</TableCell>
                          <TableCell className="text-center font-bold text-blue-600">{player.stats.assists}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleOpenForm(player)}>
                                  <Edit className="mr-2 h-4 w-4" /> Modifica
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteConfirm(player)}
                                  className="text-destructive focus:bg-destructive/90 focus:text-destructive-foreground"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Elimina
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <PlayerFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSave={handleSavePlayer} 
        player={selectedPlayer}
      />
      
      <AlertDialog open={!!playerToDelete} onOpenChange={() => setPlayerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Il giocatore Verrà eliminato definitivamente dalla rosa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPlayerToDelete(null)}>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlayer} className="bg-destructive hover:bg-destructive/90">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
