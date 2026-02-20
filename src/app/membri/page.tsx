
"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
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
import { usePlayersStore } from "@/store/usePlayersStore";
import { useSeasonsStore } from "@/store/useSeasonsStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type SortConfig = {
  key: string | null;
  direction: 'asc' | 'desc' | null;
};

const roleInitials: Record<Role, string> = {
  'Portiere': 'POR',
  'Difensore': 'DIF',
  'Centrocampista': 'CEN',
  'Attaccante': 'ATT'
};

export default function RosaPage() {
  const { players, loading, fetchAll, add, update, remove } = usePlayersStore();
  const { activeSeason } = useSeasonsStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const { toast } = useToast();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  
  const handleOpenForm = (player: Player | null) => {
    setSelectedPlayer(player);
    setIsFormOpen(true);
  };
  
  const handleSavePlayer = async (data: {name: string, role: Role}, playerId?: string) => {
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

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const sortedPlayers = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return players;

    return [...players].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      const aName = splitName(a.name);
      const bName = splitName(b.name);

      switch (sortConfig.key) {
        case 'firstName':
          aValue = aName.firstName.toLowerCase();
          bValue = bName.firstName.toLowerCase();
          break;
        case 'lastName':
          aValue = aName.lastName.toLowerCase();
          bValue = bName.lastName.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [players, sortConfig]);

  const SortIndicator = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
    if (sortConfig.direction === 'asc') return <ChevronUp className="ml-1 h-3 w-3 text-primary" />;
    if (sortConfig.direction === 'desc') return <ChevronDown className="ml-1 h-3 w-3 text-primary" />;
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader 
        title={
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl">Rosa</span>
              {!loading && (
                <Badge variant="secondary" className="text-sm md:text-lg px-2 py-0">
                  {players.length}
                </Badge>
              )}
            </div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
              Stagione {activeSeason?.name || '...'}
            </span>
          </div>
        }
      >
        <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleOpenForm(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Aggiungi</span>
          <span className="md:hidden">Add</span>
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg m-4">
                  <h3 className="text-sm font-semibold text-foreground">Rosa vuota per questa stagione</h3>
                  <p className="text-xs mt-1">Inizia aggiungendo il primo giocatore alla stagione {activeSeason?.name}.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead 
                        className="px-4 cursor-pointer"
                        onClick={() => handleSort('firstName')}
                      >
                        <div className="flex items-center">
                          Nome <SortIndicator columnKey="firstName" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="px-4 cursor-pointer"
                        onClick={() => handleSort('lastName')}
                      >
                        <div className="flex items-center">
                          Cognome <SortIndicator columnKey="lastName" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="w-24 px-2 text-center cursor-pointer"
                        onClick={() => handleSort('role')}
                      >
                        <div className="flex items-center justify-center">
                          Ruolo <SortIndicator columnKey="role" />
                        </div>
                      </TableHead>
                      <TableHead className="w-24 px-4 text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPlayers.map((player) => {
                      const { firstName, lastName } = splitName(player.name);
                      return (
                        <TableRow key={player.id} className="h-14">
                          <TableCell className="px-4 font-medium text-sm md:text-base">
                            {firstName}
                          </TableCell>
                          <TableCell className="px-4 font-medium text-sm md:text-base">
                            {lastName}
                          </TableCell>
                          <TableCell className="px-2 text-center">
                            <span className="text-[10px] font-bold bg-muted px-2 py-1 rounded border min-w-[36px] inline-block">
                              {roleInitials[player.role]}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => handleOpenForm(player)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => setPlayerToDelete(player)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

      <PlayerFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSave={handleSavePlayer} 
        player={selectedPlayer}
      />
      
      <AlertDialog open={!!playerToDelete} onOpenChange={(open) => !open && setPlayerToDelete(null)}>
        <AlertDialogContent className="max-w-[90vw] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Questa azione eliminerà definitivamente {playerToDelete?.name} dalla rosa della stagione {activeSeason?.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-2">
            <AlertDialogCancel className="mt-0 text-xs">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlayer} className="bg-destructive hover:bg-destructive/90 text-xs">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
