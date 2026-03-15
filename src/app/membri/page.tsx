"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, ChevronUp, ChevronDown, ArrowUpDown, Sparkles } from "lucide-react";
import type { Player, Role } from "@/lib/types";
import { PlayerFormDialog } from "@/components/squadra/player-form-dialog";
import { SmartPlayerDialog } from "@/components/giocatori/smart-player-dialog";
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
  const { players, loading: playersLoading, fetchAll, add, update, remove, bulkAdd } = usePlayersStore();
  const { activeSeason, loading: seasonsLoading, fetchAll: fetchSeasons } = useSeasonsStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSmartFormOpen, setIsSmartFormOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

  const loading = playersLoading || seasonsLoading;

  useEffect(() => {
    const initialize = async () => {
      await fetchSeasons();
      fetchAll();
    };
    initialize();
  }, [fetchAll, fetchSeasons]);
  
  const handleOpenForm = (player: Player | null) => {
    setSelectedPlayer(player);
    setIsFormOpen(true);
  };
  
  const handleSavePlayer = async (data: {name: string, role: Role}, playerId?: string) => {
    if (playerId) {
      await update(playerId, data);
    } else {
      await add(data);
    }
  };

  const handleSmartSavePlayers = async (playersData: { name: string, role: Role }[]) => {
    await bulkAdd(playersData);
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;
    await remove(playerToDelete.id);
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
        <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent/5 h-9 text-[10px] font-black uppercase rounded-xl" onClick={() => setIsSmartFormOpen(true)} disabled={loading}>
              <Sparkles className="mr-2 h-4 w-4" />
              Smart
            </Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 h-9 text-[10px] font-black uppercase rounded-xl" onClick={() => handleOpenForm(null)} disabled={loading}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuovo
            </Button>
        </div>
      </PageHeader>

      <Card className="rounded-2xl overflow-hidden border shadow-sm">
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
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead 
                        className="px-4 cursor-pointer text-[10px] font-black uppercase tracking-widest"
                        onClick={() => handleSort('firstName')}
                      >
                        <div className="flex items-center">
                          Nome <SortIndicator columnKey="firstName" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="px-4 cursor-pointer text-[10px] font-black uppercase tracking-widest"
                        onClick={() => handleSort('lastName')}
                      >
                        <div className="flex items-center">
                          Cognome <SortIndicator columnKey="lastName" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="w-24 px-2 text-center cursor-pointer text-[10px] font-black uppercase tracking-widest"
                        onClick={() => handleSort('role')}
                      >
                        <div className="flex items-center justify-center">
                          Ruolo <SortIndicator columnKey="role" />
                        </div>
                      </TableHead>
                      <TableHead className="w-24 px-4 text-right text-[10px] font-black uppercase tracking-widest">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPlayers.map((player) => {
                      const { firstName, lastName } = splitName(player.name);
                      return (
                        <TableRow key={player.id} className="h-14 border-muted/50">
                          <TableCell className="px-4 font-bold text-sm uppercase tracking-tight">
                            {firstName}
                          </TableCell>
                          <TableCell className="px-4 font-bold text-sm uppercase tracking-tight">
                            {lastName}
                          </TableCell>
                          <TableCell className="px-2 text-center">
                            <span className="text-[9px] font-black bg-primary/5 text-primary px-2 py-0.5 rounded border border-primary/10 min-w-[36px] inline-block">
                              {roleInitials[player.role] || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => handleOpenForm(player)}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
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

      <PlayerFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onSave={handleSavePlayer} 
        player={selectedPlayer}
      />

      <SmartPlayerDialog
        open={isSmartFormOpen}
        onOpenChange={setIsSmartFormOpen}
        onSave={handleSmartSavePlayers}
      />
      
      <AlertDialog open={!!playerToDelete} onOpenChange={(open) => !open && setPlayerToDelete(null)}>
        <AlertDialogContent className="max-w-[90vw] rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary font-black uppercase">Rimuovi Giocatore</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium">
              Sei sicuro di voler eliminare definitivamente <strong>{playerToDelete?.name}</strong> dalla rosa? Questa azione è irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-2 mt-4">
            <AlertDialogCancel className="mt-0 text-xs font-bold uppercase rounded-xl flex-1">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlayer} className="bg-destructive hover:bg-destructive/90 text-xs font-bold uppercase rounded-xl flex-1">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
