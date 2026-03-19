"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Badge } from "@/components/ui/badge";
import { Goal, Info, Zap, Plus, Trash2, ArrowRightLeft } from "lucide-react";
import { MatchEventDialog } from "./match-event-dialog";
import { Button } from "@/components/ui/button";
import { MatchEventType } from "@/lib/types";

export function MatchEventsTab() {
  const { events, deleteEvent, match } = useMatchDetailStore();
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const getEventIcon = (type: MatchEventType) => {
    switch(type) {
      case 'goal': return <Goal className="h-5 w-5 text-green-500" />;
      case 'assist': return <Zap className="h-5 w-5 text-blue-400" />;
      case 'yellow_card': return <div className="h-5 w-4 bg-yellow-400 rounded-sm border" />;
      case 'red_card': return <div className="h-5 w-4 bg-red-600 rounded-sm border" />;
      case 'substitution':
      case 'sub_in':
      case 'sub_out': return <ArrowRightLeft className="h-5 w-5 text-orange-400" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getEventLabel = (event: any) => {
    if (event.type === 'goal') {
      return event.assistPlayerName 
        ? `GOAL (ASSIST: ${event.assistPlayerName.toUpperCase()})` 
        : 'GOAL';
    }
    if (event.type === 'substitution') {
      return 'SOSTITUZIONE';
    }
    switch(event.type) {
      case 'assist': return 'ASSIST';
      case 'yellow_card': return 'AMMONIZIONE';
      case 'red_card': return 'ESPULSIONE';
      case 'sub_in': return 'ENTRATA';
      case 'sub_out': return 'USCITA';
      default: return event.type.toUpperCase();
    }
  };

  return (
    <div className="space-y-6 relative">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              <CardTitle className="uppercase font-black">Cronaca Partita</CardTitle>
            </div>
            <CardDescription className="uppercase text-[10px] font-bold">Riepilogo degli eventi principali della gara.</CardDescription>
          </div>
          <Button 
            size="icon" 
            className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => setIsEventDialogOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
                <Info className="h-10 w-10 text-muted-foreground mb-3 opacity-20" />
                <p className="text-xs font-black uppercase text-muted-foreground">Nessun evento registrato</p>
                <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase">Usa il tasto + per aggiungere gol o cartellini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const isPitchMan = match?.isHome ? event.team === 'home' : event.team === 'away';
                const mainName = event.playerName || (isPitchMan ? 'GIOCATORE' : (match?.opponent || 'AVVERSARIO'));
                
                return (
                  <div key={event.id} className="flex items-center justify-between border-b border-muted pb-3 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">
                          {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                          <div className="flex items-center gap-2">
                              {event.type === 'substitution' ? (
                                <div className="flex flex-col">
                                   <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black text-green-500 uppercase">Entra:</span>
                                      <p className="font-black leading-none uppercase text-sm">{event.playerName}</p>
                                   </div>
                                   <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] font-black text-red-500 uppercase">Esce:</span>
                                      <p className="text-[11px] font-bold opacity-70 leading-none uppercase">{event.subOutPlayerName}</p>
                                   </div>
                                </div>
                              ) : (
                                <p className="font-black leading-none uppercase text-sm">{mainName.toUpperCase()}</p>
                              )}
                              <Badge variant="outline" className="text-[9px] py-0 px-1 font-black opacity-70 border-primary/20">
                                  {isPitchMan ? 'PITCHMAN' : 'AVVERSARIO'}
                              </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 font-black tracking-widest">{getEventLabel(event)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                          <span className="text-sm font-black tabular-nums">{event.minute}&apos;</span>
                          <span className="text-[9px] font-bold text-muted-foreground block leading-none">{event.period}</span>
                      </div>
                      <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive opacity-20 hover:opacity-100 transition-opacity"
                          onClick={() => deleteEvent(event.id)}
                      >
                          <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <MatchEventDialog 
        open={isEventDialogOpen} 
        onOpenChange={setIsEventDialogOpen} 
      />
    </div>
  );
}
