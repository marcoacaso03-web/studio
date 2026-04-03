"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Badge } from "@/components/ui/badge";
import { Info, Plus, Trash2, ArrowRightLeft } from "lucide-react";
import { GiSoccerBall, GiSoccerKick } from "react-icons/gi";
import { IoSquare } from "react-icons/io5";
import { MatchEventDialog } from "./match-event-dialog";
import { Button } from "@/components/ui/button";
import { MatchEventType } from "@/lib/types";

export function MatchEventsTab() {
  const { events, deleteEvent, match } = useMatchDetailStore();
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const getEventIcon = (type: MatchEventType) => {
    switch(type) {
      case 'goal': return <GiSoccerBall className="h-5 w-5 text-primary dark:text-brand-green" />;
      case 'assist': return <GiSoccerKick className="h-5 w-5 text-primary dark:text-brand-green" />;
      case 'yellow_card': return <IoSquare className="h-5 w-5 text-yellow-400 drop-shadow-sm" />;
      case 'red_card': return <IoSquare className="h-5 w-5 text-red-600 drop-shadow-sm" />;
      case 'substitution':
      case 'sub_in':
      case 'sub_out': return <ArrowRightLeft className="h-5 w-5 text-primary dark:text-brand-green" />;
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
      <Card className="bg-card dark:bg-black/40 border border-border dark:border-brand-green/30 rounded-3xl shadow-sm dark:shadow-[0_0_15px_rgba(172,229,4,0.08)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <div className="flex items-center gap-2">
              <GiSoccerBall className="h-5 w-5 text-primary dark:text-brand-green" />
              <CardTitle className="uppercase font-black text-foreground">Cronaca Partita</CardTitle>
            </div>
            <CardDescription className="uppercase text-[10px] font-bold text-muted-foreground">Riepilogo degli eventi principali della gara.</CardDescription>
          </div>
          <Button 
            size="icon" 
            className="rounded-full bg-primary dark:bg-black border border-primary dark:border-brand-green text-white dark:text-brand-green hover:opacity-90 dark:hover:bg-black/80 shadow-md dark:shadow-[0_0_10px_rgba(172,229,4,0.2)]"
            onClick={() => setIsEventDialogOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border dark:border-brand-green/20 rounded-xl bg-muted/20 dark:bg-transparent">
                <Info className="h-10 w-10 text-primary dark:text-brand-green mb-3 opacity-30" />
                <p className="text-xs font-black uppercase text-foreground/40 dark:text-muted-foreground">Nessun evento registrato</p>
                <p className="text-[10px] font-bold text-foreground/30 dark:text-muted-foreground mt-2 uppercase">Usa il tasto + per aggiungere gol o cartellini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => {
                const isPitchMan = match?.isHome ? event.team === 'home' : event.team === 'away';
                const mainName = event.playerName || (isPitchMan ? 'GIOCATORE' : (match?.opponent || 'AVVERSARIO'));
                
                return (
                  <div key={event.id} className="flex items-center justify-between border-b border-brand-green/10 pb-3 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8">
                          {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1">
                          <div className="flex items-center gap-2">
                              {event.type === 'substitution' ? (
                                <div className="flex flex-col">
                                   <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-black text-foreground uppercase">Entra:</span>
                                      <p className="font-black leading-none uppercase text-sm">{event.playerName}</p>
                                   </div>
                                   <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] font-black text-foreground uppercase">Esce:</span>
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
                          <span className="text-sm font-black tabular-nums text-foreground">{event.minute}&apos;</span>
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
