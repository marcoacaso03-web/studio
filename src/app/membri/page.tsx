"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { PlayerCard } from "@/components/squadra/player-card";
import { getPlayers, addPlayer, updatePlayer, deletePlayer } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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

export default function MembriPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setPlayers(getPlayers());
  }, []);
  
  const handleOpenForm = (player: Player | null) => {
    setSelectedPlayer(player);
    setIsFormOpen(true);
  };
  
  const handleSavePlayer = (data: {name: string, number: number, role: Role}, playerId?: string) => {
    if (playerId) {
      const updated = updatePlayer(playerId, data);
      if(updated) {
        toast({ title: "Giocatore aggiornato", description: `I dati di ${updated.name} sono stati modificati.` });
      }
    } else {
      const newPlayer = addPlayer(data);
      toast({ title: "Giocatore aggiunto", description: `${newPlayer.name} è stato aggiunto alla squadra.` });
    }
    setPlayers(getPlayers());
  };

  const handleDeleteConfirm = (player: Player) => {
    setPlayerToDelete(player);
  };

  const handleDeletePlayer = () => {
    if (!playerToDelete) return;
    const success = deletePlayer(playerToDelete.id);
    if(success) {
        setPlayers(players.filter(p => p.id !== playerToDelete.id));
        toast({ title: "Giocatore eliminato", description: `${playerToDelete.name} è stato rimosso dalla squadra.`, variant: "destructive" });
    }
    setPlayerToDelete(null);
  };

  return (
    <>
      <div>
        <PageHeader title="Membri">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleOpenForm(null)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Aggiungi Giocatore
          </Button>
        </PageHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {players.map((player) => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              onEdit={() => handleOpenForm(player)}
              onDelete={() => handleDeleteConfirm(player)}
            />
          ))}
        </div>
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
              Questa azione non può essere annullata. Il giocatore Verrà eliminato definitivamente.
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
