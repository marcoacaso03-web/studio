"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { PlayerCard } from "@/components/squadra/player-card";
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
import { usePlayersStore } from "@/store/usePlayersStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function MembriPage() {
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
        toast({ title: "Giocatore aggiunto", description: `${newPlayer.name} è stato aggiunto alla squadra.` });
      }
    }
  };

  const handleDeleteConfirm = (player: Player) => {
    setPlayerToDelete(player);
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;
    await remove(playerToDelete.id);
    toast({ title: "Giocatore eliminato", description: `${playerToDelete.name} è stato rimosso dalla squadra.`, variant: "destructive" });
    setPlayerToDelete(null);
  };

  return (
    <>
      <div>
        <PageHeader 
          title={
            <div className="flex items-center gap-3">
              <span>Membri</span>
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
        {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg mt-6">
                <h3 className="text-lg font-semibold text-foreground">Nessun giocatore in squadra</h3>
                <p className="mt-2">Usa il pulsante "Aggiungi Giocatore" per iniziare a costruire il tuo team.</p>
            </div>
          ) : (
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
        )}
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
