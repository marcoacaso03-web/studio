
"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Tag, Search, Filter, Trash2, Edit, UserPlus, Info } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, deleteDoc } from "firebase/firestore";
import { ScoutPlayerDialog } from "@/components/scout/scout-player-dialog";
import { ScoutCategoryDialog } from "@/components/scout/scout-category-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function ScoutPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);

  // Queries Firestore
  const categoriesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'scoutCategories');
  }, [firestore, user]);

  const playersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'scoutPlayers');
  }, [firestore, user]);

  const { data: categories, isLoading: catLoading } = useCollection(categoriesQuery);
  const { data: players, isLoading: playersLoading } = useCollection(playersQuery);

  const filteredPlayers = useMemo(() => {
    if (!players) return [];
    if (selectedCategoryIds.length === 0) return players;
    return players.filter(p => 
      selectedCategoryIds.every(catId => p.categoryIds?.includes(catId))
    );
  }, [players, selectedCategoryIds]);

  const toggleFilter = (id: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeletePlayer = async (id: string) => {
    if (!user || !firestore) return;
    await deleteDoc(doc(firestore, 'users', user.uid, 'scoutPlayers', id));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader title="Scouting">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-9 text-[10px] font-black uppercase rounded-xl border-primary/20"
            onClick={() => setIsCategoryDialogOpen(true)}
          >
            <Tag className="mr-1.5 h-3.5 w-3.5" /> Etichette
          </Button>
          <Button 
            size="sm" 
            className="h-9 text-[10px] font-black uppercase rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg"
            onClick={() => { setEditingPlayer(null); setIsPlayerDialogOpen(true); }}
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Nuovo
          </Button>
        </div>
      </PageHeader>

      {/* Sezione Filtri */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Filtra per etichetta:</span>
        </div>
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex gap-2">
            <Badge 
              variant={selectedCategoryIds.length === 0 ? "default" : "outline"}
              className={cn(
                "cursor-pointer uppercase font-black text-[9px] px-3 py-1 rounded-lg transition-all",
                selectedCategoryIds.length === 0 ? "bg-primary text-white" : "border-muted-foreground/20 text-muted-foreground"
              )}
              onClick={() => setSelectedCategoryIds([])}
            >
              Tutti
            </Badge>
            {categories?.map((cat) => (
              <Badge 
                key={cat.id}
                style={{ 
                  backgroundColor: selectedCategoryIds.includes(cat.id) ? cat.colorHex : 'transparent',
                  borderColor: cat.colorHex,
                  color: selectedCategoryIds.includes(cat.id) ? 'white' : cat.colorHex
                }}
                className={cn(
                  "cursor-pointer uppercase font-black text-[9px] px-3 py-1 rounded-lg border",
                  !selectedCategoryIds.includes(cat.id) && "opacity-60 hover:opacity-100"
                )}
                onClick={() => toggleFilter(cat.id)}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Lista Giocatori */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {playersLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))
        ) : filteredPlayers.length === 0 ? (
          <Card className="col-span-full border-dashed bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <h3 className="text-sm font-black uppercase text-primary">Nessun giocatore trovato</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                {players?.length === 0 ? "Inizia aggiungendo il primo talento alla tua lista." : "Prova a cambiare i filtri selezionati."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPlayers.map((player) => (
            <Card key={player.id} className="overflow-hidden border shadow-sm rounded-2xl hover:border-primary/30 transition-all group">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-black uppercase tracking-tight text-primary leading-tight">
                      {player.name}
                    </h4>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                      {player.role} • {player.currentTeam}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      onClick={() => { setEditingPlayer(player); setIsPlayerDialogOpen(true); }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeletePlayer(player.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {player.notes && (
                  <p className="text-[10px] text-foreground/70 leading-relaxed mb-3 line-clamp-2 italic">
                    "{player.notes}"
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mt-auto">
                  {player.categoryIds?.map((catId: string) => {
                    const cat = categories?.find(c => c.id === catId);
                    if (!cat) return null;
                    return (
                      <span 
                        key={catId} 
                        style={{ backgroundColor: cat.colorHex + '20', color: cat.colorHex, borderColor: cat.colorHex + '40' }}
                        className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded border"
                      >
                        {cat.name}
                      </span>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialogs */}
      <ScoutPlayerDialog 
        open={isPlayerDialogOpen} 
        onOpenChange={setIsPlayerDialogOpen} 
        player={editingPlayer}
        categories={categories || []}
      />
      <ScoutCategoryDialog 
        open={isCategoryDialogOpen} 
        onOpenChange={setIsCategoryDialogOpen} 
        categories={categories || []}
      />
    </div>
  );
}
