"use client";

import { useState } from "react";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LineupFormDialog } from "./lineup-form-dialog";
import { SmartLineupDialog } from "./smart-lineup-dialog";

export function MatchLineupTab() {
  const { lineup, allPlayers } = useMatchDetailStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSmartOpen, setIsSmartOpen] = useState(false);

  // Filtriamo i titolari e le riserve che hanno un ID giocatore valido
  const activeStarters = lineup?.starters
    .map((id, idx) => ({ id, displayNum: idx + 1 }))
    .filter(item => item.id !== "") || [];
    
  const activeSubstitutes = lineup?.substitutes
    .map((id, idx) => ({ id, displayNum: idx + 12 }))
    .filter(item => item.id !== "") || [];

  return (
    <div className="space-y-6">
      {!lineup ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">Nessuna formazione inserita</h3>
            <p className="text-sm text-muted-foreground mb-6">Inizia a definire i titolari e le riserve per questa gara.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => setIsFormOpen(true)} className="rounded-xl font-black uppercase text-xs">
                <PlusCircle className="mr-2 h-4 w-4" />
                Aggiungi Formazione
              </Button>
              <Button onClick={() => setIsSmartOpen(true)} variant="outline" className="border-accent text-accent hover:bg-accent/5 rounded-xl font-black uppercase text-xs">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Smart Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Formazione Salvata</h3>
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
          <Card>
            <CardContent className="p-4 space-y-6">
                {activeStarters.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Titolari</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {activeStarters.map((item) => {
                            const p = allPlayers.find(player => player.id === item.id);
                            return (
                                <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm">
                                    <span className="font-bold w-5 text-muted-foreground">{item.displayNum}</span>
                                    <span className="font-medium">{p ? p.name : 'Giocatore non trovato'}</span>
                                </div>
                            );
                        })}
                    </div>
                  </div>
                )}
                
                {activeSubstitutes.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Riserve</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {activeSubstitutes.map((item) => {
                            const p = allPlayers.find(player => player.id === item.id);
                            return (
                                <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm">
                                    <span className="font-bold w-5 text-muted-foreground">{item.displayNum}</span>
                                    <span className="font-medium">{p ? p.name : 'Giocatore non trovato'}</span>
                                </div>
                            );
                        })}
                    </div>
                  </div>
                )}

                {activeStarters.length === 0 && activeSubstitutes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nessun giocatore selezionato nella formazione.
                  </p>
                )}
            </CardContent>
          </Card>
        </div>
      )}

      <LineupFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
      />

      <SmartLineupDialog
        open={isSmartOpen}
        onOpenChange={setIsSmartOpen}
      />
    </div>
  );
}
