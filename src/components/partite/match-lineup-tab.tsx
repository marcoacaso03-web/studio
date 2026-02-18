"use client";

import { useState } from "react";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LineupFormDialog } from "./lineup-form-dialog";
import { MatchAttendanceTab } from "./match-attendance-tab";

export function MatchLineupTab() {
  const { lineup, allPlayers } = useMatchDetailStore();
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      {!lineup ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">Nessuna formazione inserita</h3>
            <p className="text-sm text-muted-foreground mb-6">Inizia a definire i titolari e le riserve per questa gara.</p>
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Aggiungi Formazione
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Formazione Salvata</h3>
            <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)}>
              Modifica Formazione
            </Button>
          </div>
          <Card>
            <CardContent className="p-4 space-y-4">
                <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Titolari</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {lineup.starters.map((id, idx) => {
                            const p = allPlayers.find(player => player.id === id);
                            return (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm">
                                    <span className="font-bold w-5">{idx + 1}</span>
                                    <span>{p ? p.name : '-- giocatore --'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">Riserve</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {lineup.substitutes.map((id, idx) => {
                            const p = allPlayers.find(player => player.id === id);
                            return (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-muted/30 rounded text-sm">
                                    <span className="font-bold w-5">{idx + 12}</span>
                                    <span>{p ? p.name : '-- giocatore --'}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      )}

      <MatchAttendanceTab />

      <LineupFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
      />
    </div>
  );
}
