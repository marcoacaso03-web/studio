"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, ChevronUp, ChevronDown, Sparkles, Search, Plus, ChevronRight } from "lucide-react";
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
import { usePlayersStore } from "@/store/usePlayersStore";
import { useSeasonsStore } from "@/store/useSeasonsStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const rolesList: Role[] = ["Portiere", "Difensore", "Centrocampista", "Attaccante"];
const roleColors: Record<Role, string> = {
  "Portiere": "bg-amber-900/40 border-amber-500/30 text-amber-500", 
  "Difensore": "bg-slate-900/40 border-slate-500/30 text-slate-500",
  "Centrocampista": "bg-blue-900/40 border-blue-500/30 text-blue-500",
  "Attaccante": "bg-red-900/40 border-red-500/30 text-red-500",
};

export default function RosaPage() {
  const router = useRouter();
  const { players, loading: playersLoading, fetchAll, add, update, remove, bulkAdd } = usePlayersStore();
  const { activeSeason, loading: seasonsLoading, fetchAll: fetchSeasons } = useSeasonsStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSmartFormOpen, setIsSmartFormOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Array per tenere traccia delle sezioni aperte (tipo accordion multiplo)
  const [openRoles, setOpenRoles] = useState<string[]>(["Portiere", "Difensore", "Centrocampista", "Attaccante"]);

  const loading = playersLoading || seasonsLoading;

  useEffect(() => {
    const initialize = async () => {
      await fetchSeasons();
      fetchAll();
    };
    initialize();
  }, [fetchAll, fetchSeasons]);

  const toggleRole = (role: string) => {
    setOpenRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };
  
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

  const groupedPlayers = useMemo(() => {
    const filtered = players.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const groups: Record<string, Player[]> = {
      "Portiere": [],
      "Difensore": [],
      "Centrocampista": [],
      "Attaccante": []
    };
    
    filtered.forEach(p => {
      if (groups[p.role]) {
        groups[p.role].push(p);
      }
    });

    Object.keys(groups).forEach(key => {
        groups[key].sort((a,b) => a.name.localeCompare(b.name));
    });

    return groups;
  }, [players, searchTerm]);

  return (
    <div className="pb-24 pt-4 space-y-6">
      <div className="flex flex-col items-center justify-center mb-6">
        <h1 className="text-xl md:text-2xl font-black text-foreground tracking-wide relative after:content-[''] after:absolute after:bottom-[-2px] after:left-1/2 after:-translate-x-1/2 after:w-16 after:h-[2px] after:bg-gradient-to-r after:from-transparent after:via-foreground after:to-transparent">
          Gestione Rosa Squadra
        </h1>
      </div>

      <div className="px-4 flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
          <Input 
            type="text" 
            placeholder="Cerca" 
            className="w-full h-12 pl-12 pr-4 rounded-full bg-card border-border/80 text-foreground placeholder:text-muted-foreground/50 font-medium text-lg focus-visible:ring-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          onClick={() => handleOpenForm(null)}
          className="h-12 w-12 rounded-full p-0 flex-shrink-0 bg-gradient-to-br from-brand-yellow to-brand-green text-white shadow-[0_0_15px_rgba(74,222,128,0.5)] transition-all hover:scale-105 active:scale-95 border-none"
        >
          <Plus className="h-7 w-7" />
        </Button>
      </div>

      <div className="space-y-4 px-3">
        {loading ? (
          <div className="space-y-4 px-2">
            <Skeleton className="h-14 w-full rounded-2xl bg-card/20 hover:bg-card/30" />
            <Skeleton className="h-14 w-full rounded-2xl bg-card/20 hover:bg-card/30" />
            <Skeleton className="h-14 w-full rounded-2xl bg-card/20 hover:bg-card/30" />
          </div>
        ) : (
          rolesList.map(roleKey => {
            const rolePluralMap: Record<string, string> = {
                "Portiere": "Portieri",
                "Difensore": "Difensori",
                "Centrocampista": "Centrocampisti",
                "Attaccante": "Attaccanti"
            };
            const roleName = rolePluralMap[roleKey];
            const playersInRole = groupedPlayers[roleKey];
            const isOpen = openRoles.includes(roleKey);
            
            if (playersInRole.length === 0 && searchTerm) return null; // Hide if searching and none found

            return (
              <div key={roleKey} className="overflow-hidden bg-card/50 rounded-2xl">
                {/* Accordion Header */}
                <div 
                   onClick={() => toggleRole(roleKey)}
                   className={cn(
                     "flex items-center justify-between p-4 cursor-pointer select-none transition-all rounded-t-2xl border-b border-white/5",
                     roleColors[roleKey]
                   )}
                >
                  <span className="font-medium text-[17px] tracking-wide">{roleName}</span>
                  <div className="bg-card rounded-2xl border border-neon-dim shadow-lg overflow-hidden transition-all hover:bg-card/90">
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>

                {/* Accordion Content */}
                {isOpen && (
                  <div className="flex flex-col py-2 border-x border-b border-white/5 rounded-b-2xl">
                    {playersInRole.length === 0 ? (
                      <div className="py-6 text-center text-foreground/30 text-sm italic">Nessun giocatore in questo ruolo</div>
                    ) : (
                      playersInRole.map((player, index) => (
                        <div 
                          key={player.id} 
                          className="flex items-center justify-between p-4 border-b border-white/5 last:border-b-0 group hover:bg-card/20 hover:bg-card/30 transition-colors cursor-pointer"
                          onClick={() => router.push(`/membri/${player.id}`)}
                        >
                          <span className="text-foreground font-medium text-[17px]">{player.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-foreground/60 text-sm font-medium">
                                #{index + 1}
                            </span>
                            {/* Un indicatore online o puntino verde per design */}
                            <div className="w-4 h-4 rounded-full bg-brand-green shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

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
        <AlertDialogContent className="max-w-[90vw] rounded-3xl bg-background border-white/10 text-foreground p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground font-black uppercase text-base">Rimuovi Giocatore</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium leading-relaxed text-foreground/60">
              Vuoi eliminare definitivamente <strong>{playerToDelete?.name}</strong> dalla rosa?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-3 mt-4">
            <AlertDialogCancel className="mt-0 text-[11px] font-bold uppercase rounded-xl flex-1 h-11 bg-card/20 hover:bg-card/30 text-foreground border-none hover:bg-card/40 hover:bg-card/50">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlayer} className="bg-destructive hover:bg-destructive/90 text-[11px] font-bold uppercase rounded-xl flex-1 h-11 border-none shadow-[0_0_15px_rgba(248,113,113,0.3)]">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
