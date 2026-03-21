
"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, ChevronUp, ChevronDown, ArrowUpDown, Sparkles } from "lucide-react";
import type { Player, Role } from "@/lib/types";
import dynamic from "next/dynamic";

const PlayerFormDialog = dynamic(() => import("@/components/squadra/player-form-dialog").then(mod => mod.PlayerFormDialog), { ssr: false });
const SmartPlayerDialog = dynamic(() => import("@/components/giocatori/smart-player-dialog").then(mod => mod.SmartPlayerDialog), { ssr: false });
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
    <div className="space-y-3 md:space-y-6">
      <PageHeader 
        title={
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-3xl">Rosa</span>
              {!loading && (
                <Badge variant="secondary" className="text-xs md:text-lg px-1.5 py-0">
                  {players.length}
                </Badge>
              )}
            </div>
            <span className="text-[8px] md:text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
              {activeSeason?.name || '...'}
            </span>
          </div>
        }
      >
        <div className="flex gap-1.5">
            <Button size="sm" variant="outline" className="border-accent text-accent hover:bg-accent/5 h-8 md:h-9 text-[9px] font-black uppercase rounded-lg" onClick={() => setIsSmartFormOpen(true)} disabled={loading}>
              <Sparkles className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Smart
            </Button>
            <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 h-8 md:h-9 text-[9px] font-black uppercase rounded-lg" onClick={() => handleOpenForm(null)} disabled={loading}>
              <PlusCircle className="mr-1 h-3 w-3 md:h-4 md:w-4" /> Nuovo
            </Button>
        </div>
      </PageHeader>

      <Card className="rounded-xl overflow-hidden border shadow-sm">
        <CardContent className="p-0">
          {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : players.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg m-3">
                  <h3 className="text-xs font-semibold text-foreground">Rosa vuota</h3>
                  <p className="text-[10px] mt-1">Aggiungi il primo giocatore.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none h-9">
                      <TableHead 
                        className="px-3 h-9 cursor-pointer text-[9px] font-black uppercase tracking-widest"
                        onClick={() => handleSort('firstName')}
                      >
                        <div className="flex items-center">
                          Nome <SortIndicator columnKey="firstName" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="px-3 h-9 cursor-pointer text-[9px] font-black uppercase tracking-widest"
                        onClick={() => handleSort('lastName')}
                      >
                        <div className="flex items-center">
                          Cognome <SortIndicator columnKey="lastName" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="w-16 h-9 px-1 text-center cursor-pointer text-[9px] font-black uppercase tracking-widest"
                        onClick={() => handleSort('role')}
                      >
                        <div className="flex items-center justify-center">
                          Pos <SortIndicator columnKey="role" />
                        </div>
                      </TableHead>
                      <TableHead className="w-16 h-9 px-3 text-right text-[9px] font-black uppercase tracking-widest">Azione</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPlayers.map((player) => {
                      const { firstName, lastName } = splitName(player.name);
                      return (
                        <TableRow key={player.id} className="h-10 border-muted/50 hover:bg-primary/5 transition-colors">
                          <TableCell className="px-3 py-0 font-bold text-xs uppercase tracking-tight truncate max-w-[80px]">
                            {firstName}
                          </TableCell>
                          <TableCell className="px-3 py-0 font-bold text-xs uppercase tracking-tight truncate max-w-[100px]">
                            {lastName}
                          </TableCell>
                          <TableCell className="px-1 py-0 text-center">
                            <span className="text-[8px] font-black bg-primary/5 text-primary px-1.5 py-0.5 rounded border border-primary/10 min-w-[32px] inline-block">
                              {roleInitials[player.role] || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell className="px-3 py-0 text-right">
                            <div className="flex items-center justify-end gap-0.5">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                onClick={() => handleOpenForm(player)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => setPlayerToDelete(player)}
                              >
                                <Trash2 className="h-3 w-3" />
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
        <AlertDialogContent className="max-w-[90vw] rounded-2xl p-5">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary font-black uppercase text-base">Rimuovi Giocatore</AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium leading-relaxed">
              Eliminare definitivamente <strong>{playerToDelete?.name}</strong> dalla rosa?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-2 mt-4">
            <AlertDialogCancel className="mt-0 text-[10px] font-bold uppercase rounded-lg flex-1 h-9">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlayer} className="bg-destructive hover:bg-destructive/90 text-[10px] font-bold uppercase rounded-lg flex-1 h-9">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
