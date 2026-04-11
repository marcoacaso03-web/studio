"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Badge } from "@/components/ui/badge";
import { Info, Plus, Trash2, ArrowRightLeft, XCircle, Target, Zap, Flag, Handshake } from "lucide-react";
import { GiSoccerBall } from "react-icons/gi";
import { IoSquare } from "react-icons/io5";
import { MatchEventDialog } from "./match-event-dialog";
import { Button } from "@/components/ui/button";
import { MatchEventType, MatchEvent } from "@/lib/types";
import { GiGloves, GiTargetPoster, GiLightBulb } from "react-icons/gi";

export function MatchEventsTab() {
  const { events, deleteEvent, match } = useMatchDetailStore();
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const getEventIcon = (event: MatchEvent) => {
    switch (event.type) {
      case 'goal': 
        if (event.goalType === 'rigore') return <Target className="h-5 w-5 text-primary dark:text-brand-green" />;
        if (event.goalType === 'punizione') return <Zap className="h-5 w-5 text-amber-400" />;
        if (event.goalType === 'calcio_angolo') return <Flag className="h-5 w-5 text-blue-400" />;
        return <GiSoccerBall className="h-5 w-5 text-primary dark:text-brand-green" />;
      case 'assist': return <Handshake className="h-5 w-5 text-primary dark:text-brand-green" />;
      case 'yellow_card': return <IoSquare className="h-5 w-5 text-yellow-400 drop-shadow-sm" />;
      case 'red_card': return <IoSquare className="h-5 w-5 text-red-600 drop-shadow-sm" />;
      case 'substitution':
      case 'sub_in':
      case 'sub_out': return <ArrowRightLeft className="h-5 w-5 text-primary dark:text-brand-green" />;
      case 'penalty_saved': return <GiGloves className="h-5 w-5 text-blue-500" />;
      case 'penalty_missed': return <XCircle className="h-5 w-5 text-orange-500" />;
      case 'chance': return <GiLightBulb className="h-5 w-5 text-purple-500" />;
      case 'woodwork': return <GiTargetPoster className="h-5 w-5 text-emerald-500" />;
      case 'note': return <Info className="h-5 w-5 text-muted-foreground" />;
      default: return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getEventLabel = (event: any) => {
    if (event.type === 'goal') {
      const typeLabel = event.goalType ? ` (${event.goalType.replace('_', ' ').toUpperCase()})` : '';
      return event.assistPlayerName
        ? `GOAL${typeLabel} (ASSIST: ${event.assistPlayerName.toUpperCase()})`
        : `GOAL${typeLabel}`;
    }
    if (event.type === 'substitution') {
      return 'SOSTITUZIONE';
    }
    switch (event.type) {
      case 'assist': return 'ASSIST';
      case 'yellow_card': return 'AMMONIZIONE';
      case 'red_card': return 'ESPULSIONE';
      case 'sub_in': return 'ENTRATA';
      case 'sub_out': return 'USCITA';
      case 'penalty_saved': return 'RIGORE PARATO';
      case 'penalty_missed': return 'RIGORE SBAGLIATO';
      case 'chance': return 'OCCASIONE';
      case 'woodwork': return 'PALO / TRAVERSA';
      case 'note': return 'NOTA / ALTRO';
      default: return event.type.toUpperCase();
    }
  };

  const timedEvents = events.filter(e => e.minute !== null).sort((a, b) => {
    const periodOrder: Record<string, number> = { '1T': 1, '2T': 2, '1TS': 3, '2TS': 4 };
    if (periodOrder[a.period] !== periodOrder[b.period]) return periodOrder[a.period] - periodOrder[b.period];
    return (a.minute ?? 0) - (b.minute ?? 0);
  });
  const unTimedEvents = events.filter(e => e.minute === null);

  return (
    <div className="space-y-6 relative">
      <Card className="bg-card dark:bg-black/40 border border-border dark:border-brand-green/30 rounded-3xl shadow-sm dark:shadow-[0_0_15px_rgba(172,229,4,0.08)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <GiSoccerBall className="h-5 w-5 text-primary dark:text-brand-green" />
            <CardTitle className="uppercase font-black text-foreground">Cronaca Partita</CardTitle>
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
              <p className="text-[10px] font-bold text-foreground/30 dark:text-muted-foreground mt-2 uppercase">Usa il + per modificare il risultato e aggiungere eventi alla partita.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Cronaca Temporale */}
              {timedEvents.length > 0 && (
                <div className="space-y-4">
                  {timedEvents.map((event) => (
                    <EventRow key={event.id} event={event} match={match} deleteEvent={deleteEvent} getEventIcon={getEventIcon} getEventLabel={getEventLabel} />
                  ))}
                </div>
              )}

              {/* Eventi senza minutaggio */}
              {unTimedEvents.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-brand-green/10">
                  <div className="flex items-center gap-2 mb-4">
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Eventi senza minutaggio</span>
                  </div>
                  {unTimedEvents.map((event) => (
                    <EventRow key={event.id} event={event} match={match} deleteEvent={deleteEvent} getEventIcon={getEventIcon} getEventLabel={getEventLabel} />
                  ))}
                </div>
              )}
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

function EventRow({ event, match, deleteEvent, getEventIcon, getEventLabel }: any) {
  const isPitchMan = match?.isHome ? event.team === 'home' : event.team === 'away';
  const mainName = event.playerName || (isPitchMan ? 'GIOCATORE' : (match?.opponent || 'AVVERSARIO'));

  return (
    <div className="flex items-center justify-between border-b border-brand-green/5 pb-3 last:border-0 group">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center justify-center w-8">
          {getEventIcon(event)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
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
            ) : event.type === 'note' ? (
                <p className="text-sm font-medium tracking-tight text-foreground/80 break-words italic">&quot;{event.notes}&quot;</p>
            ) : (
              <p className="font-black leading-none uppercase text-sm truncate">{mainName.toUpperCase()}</p>
            )}
            {event.type !== 'note' && (
                <Badge variant="outline" className="text-[8px] py-0 px-1 font-black opacity-50 border-primary/20 flex-shrink-0">
                    {isPitchMan ? 'PITCHMAN' : 'AVV.'}
                </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] text-muted-foreground font-black tracking-widest">{getEventLabel(event)}</p>
            {event.notes && event.type !== 'note' && (
                <span className="text-[10px] text-muted-foreground/50 font-medium truncate max-w-[150px]">- {event.notes}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 ml-4">
        {event.minute !== null ? (
            <div className="text-right min-w-[35px]">
                <span className="text-sm font-black tabular-nums text-foreground">{event.minute}&apos;</span>
                <span className="text-[9px] font-bold text-muted-foreground block leading-none">{event.period}</span>
            </div>
        ) : (
            <div className="text-right min-w-[35px]">
                <span className="text-[10px] font-black text-muted-foreground opacity-30">N.D.</span>
            </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => deleteEvent(event.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
