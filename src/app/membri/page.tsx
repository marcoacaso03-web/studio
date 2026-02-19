
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
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SortConfig = {
  key: string | null;
  direction: 'asc' | 'desc' | null;
};

const roleInitials: Record<Role, string> = {
  'Portiere': 'P',
  'Difensore': 'D',
  'Centrocampista': 'C',
  'Attaccante': 'A'
};

export default function RosaPage() {
  const { players, loading, fetchAll, add, update, remove } = usePlayersStore();
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
        case 'number':
          aValue = a.number;
          bValue = b.number;
          break;
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
        case 'appearances':
          aValue = a.stats.appearances;
          bValue = b.stats.appearances;
          break;
        case 'goals':
          aValue = a.stats.goals;
          bValue = b.stats.goals;
          break;
        case 'assists':
          aValue = a.stats.assists;
          bValue = b.stats.assists;
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
    <TooltipProvider>
      <div className="space-y-4 md:space-y-6">
        <PageHeader 
          title={
            <div className="flex items-center gap-2">
              <span className="text-2xl md:text-3xl">Rosa</span>
              {!loading && (
                <Badge variant="secondary" className="text-sm md:text-lg px-2 py-0">
                  {players.length}
                </Badge>
              )}
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
                    <h3 className="text-sm font-semibold text-foreground">Rosa vuota</h3>
                    <p className="text-xs mt-1">Inizia aggiungendo il primo giocatore.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead 
                          className="w-10 md:w-16 px-2 text-center cursor-pointer"
                          onClick={() => handleSort('number')}
                        >
                          <div className="flex items-center justify-center">
                            # <SortIndicator columnKey="number" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="px-2 cursor-pointer"
                          onClick={() => handleSort('firstName')}
                        >
                          <div className="flex items-center">
                            Nome <SortIndicator columnKey="firstName" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="px-2 cursor-pointer"
                          onClick={() => handleSort('lastName')}
                        >
                          <div className="flex items-center">
                            Cogn. <SortIndicator columnKey="lastName" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="w-10 px-2 text-center cursor-pointer"
                          onClick={() => handleSort('role')}
                        >
                          <div className="flex items-center justify-center">
                            R. <SortIndicator columnKey="role" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="w-10 px-1 text-center cursor-pointer"
                          onClick={() => handleSort('appearances')}
                        >
                          <div className="flex items-center justify-center">
                            P <SortIndicator columnKey="appearances" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="w-10 px-1 text-center cursor-pointer"
                          onClick={() => handleSort('goals')}
                        >
                          <div className="flex items-center justify-center">
                            G <SortIndicator columnKey="goals" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="w-10 px-1 text-center cursor-pointer"
                          onClick={() => handleSort('assists')}
                        >
                          <div className="flex items-center justify-center">
                            A <SortIndicator columnKey="assists" />
                          </div>
                        </TableHead>
                        <TableHead className="w-16 px-2 text-right">Az.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPlayers.map((player) => {
                        const { firstName, lastName } = splitName(player.name);
                        return (
                          <TableRow key={player.id} className="h-12">
                            <TableCell className="px-2 font-bold text-center text-muted-foreground text-xs md:text-sm">
                              {player.number}
                            </TableCell>
                            <TableCell className="px-2 font-medium text-xs md:text-sm truncate max-w-[60px] md:max-w-none">
                              {firstName}
                            </TableCell>
                            <TableCell className="px-2 font-medium text-xs md:text-sm truncate max-w-[60px] md:max-w-none">
                              {lastName}
                            </TableCell>
                            <TableCell className="px-2 text-center">
                              <span className="text-[10px] md:text-xs font-bold bg-muted px-1.5 py-0.5 rounded border">
                                {roleInitials[player.role]}
                              </span>
                            </TableCell>
                            <TableCell className="px-1 text-center text-xs md:text-sm">{player.stats.appearances}</TableCell>
                            <TableCell className="px-1 text-center font-bold text-green-600 text-xs md:text-sm">{player.stats.goals}</TableCell>
                            <TableCell className="px-1 text-center font-bold text-blue-600 text-xs md:text-sm">{player.stats.assists}</TableCell>
                            <TableCell className="px-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                                  onClick={() => handleOpenForm(player)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => setPlayerToDelete(player)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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
      </div>

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
              Questa azione eliminerà definitivamente {playerToDelete?.name} dalla rosa.
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
    </TooltipProvider>
  );
}
