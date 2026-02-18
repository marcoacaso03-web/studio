"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
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
import { cn } from "@/lib/utils";

type SortConfig = {
  key: string | null;
  direction: 'asc' | 'desc' | null;
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
    if (sortConfig.direction === 'asc') return <ChevronUp className="ml-1 h-4 w-4 text-primary" />;
    if (sortConfig.direction === 'desc') return <ChevronDown className="ml-1 h-4 w-4 text-primary" />;
    return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
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
                      <TableHead 
                        className="w-16 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('number')}
                      >
                        <div className="flex items-center justify-center">
                          # <SortIndicator columnKey="number" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('firstName')}
                      >
                        <div className="flex items-center">
                          Nome <SortIndicator columnKey="firstName" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('lastName')}
                      >
                        <div className="flex items-center">
                          Cognome <SortIndicator columnKey="lastName" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('role')}
                      >
                        <div className="flex items-center">
                          Ruolo <SortIndicator columnKey="role" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('appearances')}
                      >
                        <div className="flex items-center justify-center">
                          Presenze <SortIndicator columnKey="appearances" />
                        </div>
                      </TableHead>
                      <TableHead className="text-center text-muted-foreground">Min/Gara</TableHead>
                      <TableHead 
                        className="text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('goals')}
                      >
                        <div className="flex items-center justify-center">
                          Gol <SortIndicator columnKey="goals" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('assists')}
                      >
                        <div className="flex items-center justify-center">
                          Assist <SortIndicator columnKey="assists" />
                        </div>
                      </TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPlayers.map((player) => {
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
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleOpenForm(player); }}>
                                  <Edit className="mr-2 h-4 w-4" /> Modifica
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onSelect={(e) => { e.preventDefault(); handleDeleteConfirm(player); }}
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
