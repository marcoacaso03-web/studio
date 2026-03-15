"use client";

import { useState, useMemo } from "react";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList, Sparkles, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LineupFormDialog, FORMATION_POSITIONS } from "./lineup-form-dialog";
import { SmartLineupDialog } from "./smart-lineup-dialog";
import { cn } from "@/lib/utils";

// Definizione righe (dall'Attacco al Portiere in basso)
// Indici Left-to-Right basati su FORMATION_POSITIONS
const FORMATION_ROWS: Record<string, number[][]> = {
  "4-4-2": [[9, 10], [5, 6, 7, 8], [1, 2, 3, 4], [0]],
  "4-3-3": [[8, 9, 10], [5, 6, 7], [1, 2, 3, 4], [0]],
  "3-5-2": [[9, 10], [4, 5, 6, 7, 8], [1, 2, 3], [0]],
  "4-2-3-1": [[10], [7, 8, 9], [5, 6], [1, 2, 3, 4], [0]],
  "3-4-2-1": [[10], [8, 9], [4, 5, 6, 7], [1, 2, 3], [0]],
  "3-4-1-2": [[9, 10], [8], [4, 5, 6, 7], [1, 2, 3], [0]],
  "4-3-1-2": [[9, 10], [8], [5, 6, 7], [1, 2, 3, 4], [0]]
};

const formatPlayerName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].toUpperCase();
  const initial = parts[0].charAt(0).toUpperCase();
  const surname = parts.slice(1).join(' ').toUpperCase();
  return `${initial}. ${surname}`;
};

export function MatchLineupTab() {
  const { lineup, allPlayers } = useMatchDetailStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSmartOpen, setIsSmartOpen] = useState(false);

  const activeStarters = useMemo(() => 
    lineup?.starters.map((id, idx) => ({ id, originalIdx: idx })) || [],
    [lineup]
  );
    
  const activeSubstitutes = useMemo(() => 
    lineup?.substitutes
      .filter(id => id !== "")
      .map(id => {
        const p = allPlayers.find(player => player.id === id);
        return p ? formatPlayerName(p.name) : "Sconosciuto";
      }) || [],
    [lineup, allPlayers]
  );

  const activeFormation = lineup?.formation || "4-4-2";
  const rows = FORMATION_ROWS[activeFormation] || FORMATION_ROWS["4-4-2"];
  const currentAcronyms = FORMATION_POSITIONS[activeFormation] || [];

  if (!lineup) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="h-16 w-16 text-muted-foreground mb-6 opacity-20" />
            <h3 className="text-xl font-black uppercase tracking-tight text-primary">Nessuna formazione inserita</h3>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-2 mb-8">Inizia a definire i titolari e le riserve per questa gara.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={() => setIsFormOpen(true)} className="h-12 px-8 bg-primary rounded-2xl font-black uppercase text-xs shadow-lg">
                <PlusCircle className="mr-2 h-4 w-4" />
                Aggiungi Formazione
              </Button>
              <Button onClick={() => setIsSmartOpen(true)} variant="outline" className="h-12 px-8 border-accent text-accent hover:bg-accent/5 rounded-2xl font-black uppercase text-xs">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Smart Mode
              </Button>
            </div>
          </CardContent>
        </Card>
        <LineupFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
        <SmartLineupDialog open={isSmartOpen} onOpenChange={setIsSmartOpen} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-black uppercase tracking-tight">Layout Tattico <span className="text-primary ml-1">{activeFormation}</span></h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsSmartOpen(true)} className="border-accent text-accent hover:bg-accent/5 h-9 rounded-xl font-black uppercase text-[10px]">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Smart
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)} className="h-9 rounded-xl font-black uppercase text-[10px]">
            Modifica
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Campo da Gioco */}
        <div className="lg:col-span-3">
          <div className="relative aspect-[3/4] md:aspect-[4/3] w-full rounded-3xl bg-gradient-to-b from-[#1a237e] to-[#0d1240] overflow-hidden border-4 border-white/5 shadow-2xl flex flex-col p-4 md:p-8">
            {/* Linee del campo */}
            <div className="absolute inset-4 border-2 border-white/10 pointer-events-none rounded-sm">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-16 border-b-2 border-x-2 border-white/10" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-16 border-t-2 border-x-2 border-white/10" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/10 rounded-full" />
            </div>

            {/* Giocatori in Campo (disposti per file) */}
            <div className="flex-1 flex flex-col justify-between relative z-10 py-4">
              {rows.map((rowIndices, rowIdx) => (
                <div key={rowIdx} className="flex justify-around items-center w-full px-4">
                  {rowIndices.map((starterIdx) => {
                    const playerEntry = activeStarters.find(s => s.originalIdx === starterIdx);
                    const p = playerEntry ? allPlayers.find(player => player.id === playerEntry.id) : null;
                    const isPOR = starterIdx === 0;
                    
                    return (
                      <div key={starterIdx} className="flex flex-col items-center gap-1.5 min-w-[80px]">
                        <div className={cn(
                          "w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 shadow-xl transition-transform hover:scale-110",
                          isPOR 
                            ? "bg-[#ff8f00] border-[#ffd54f] text-black" 
                            : "bg-primary border-primary-foreground/20 text-white"
                        )}>
                          <span className="text-[10px] md:text-sm font-black uppercase">
                            {currentAcronyms[starterIdx] || (starterIdx + 1)}
                          </span>
                        </div>
                        <div className="bg-black/40 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 min-w-[60px] text-center">
                          <p className="text-[8px] md:text-[10px] font-black text-white uppercase truncate whitespace-nowrap">
                            {p ? formatPlayerName(p.name) : "---"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panchina (A Disposizione) */}
        <div className="lg:col-span-1">
          <Card className="h-full bg-gradient-to-b from-primary/5 to-transparent border-primary/10 rounded-3xl overflow-hidden shadow-lg">
            <div className="bg-primary p-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">A Disposizione</h4>
            </div>
            <CardContent className="p-4 space-y-3">
              {activeSubstitutes.length > 0 ? (
                activeSubstitutes.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-muted/20 rounded-xl border border-muted transition-all hover:bg-muted/40">
                    <span className="text-[9px] font-black text-muted-foreground w-4">{idx + 12}</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-foreground truncate">{name}</span>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Nessuna Riserva</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <LineupFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} />
      <SmartLineupDialog open={isSmartOpen} onOpenChange={setIsSmartOpen} />
    </div>
  );
}
