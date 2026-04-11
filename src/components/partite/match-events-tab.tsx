"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Badge } from "@/components/ui/badge";
import { Info, Plus, Trash2, ArrowRightLeft, XCircle, Target, Zap, Flag, Handshake, Edit2, User, ExternalLink } from "lucide-react";
import { GiSoccerBall } from "react-icons/gi";
import { IoSquare } from "react-icons/io5";
import { MatchEventDialog } from "./match-event-dialog";
import { Button } from "@/components/ui/button";
import { MatchEventType, MatchEvent } from "@/lib/types";
import { GiGloves, GiTargetPoster, GiLightBulb } from "react-icons/gi";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function MatchEventsTab() {
  const { events, deleteEvent, match } = useMatchDetailStore();
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<MatchEvent | undefined>(undefined);
  
  const [selectedEventOptions, setSelectedEventOptions] = useState<MatchEvent | null>(null);

  const getEventIcon = (event: MatchEvent, size: string = "h-4 w-4") => {
    const iconClass = cn(size);
    switch (event.type) {
      case 'goal': 
        if (event.goalType === 'rigore') return <Target className={cn(iconClass, "text-primary dark:text-brand-green")} />;
        if (event.goalType === 'punizione') return <Zap className={cn(iconClass, "text-amber-400")} />;
        if (event.goalType === 'calcio_angolo') return <Flag className={cn(iconClass, "text-blue-400")} />;
        return <GiSoccerBall className={cn(iconClass, "text-primary dark:text-brand-green")} />;
      case 'assist': return <Handshake className={cn(iconClass, "text-primary dark:text-brand-green")} />;
      case 'yellow_card': return <IoSquare className={cn(iconClass, "text-yellow-400 drop-shadow-sm")} />;
      case 'red_card': return <IoSquare className={cn(iconClass, "text-red-600 drop-shadow-sm")} />;
      case 'substitution':
      case 'sub_in':
      case 'sub_out': return <ArrowRightLeft className={cn(iconClass, "text-primary dark:text-brand-green")} />;
      case 'penalty_saved': return <GiGloves className={cn(iconClass, "text-blue-500")} />;
      case 'penalty_missed': return <XCircle className={cn(iconClass, "text-orange-500")} />;
      case 'chance': return <GiLightBulb className={cn(iconClass, "text-purple-500")} />;
      case 'woodwork': return <GiTargetPoster className={cn(iconClass, "text-emerald-500")} />;
      case 'note': return <Info className={cn(iconClass, "text-muted-foreground")} />;
      default: return <Info className={cn(iconClass, "text-muted-foreground")} />;
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

  const handleEditEvent = (event: MatchEvent) => {
    setEventToEdit(event);
    setSelectedEventOptions(null);
    setIsEventDialogOpen(true);
  };

  const handleAddNewEvent = () => {
    setEventToEdit(undefined);
    setIsEventDialogOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      <Card className="bg-card dark:bg-black/40 border border-border dark:border-brand-green/30 rounded-3xl shadow-sm dark:shadow-[0_0_15px_rgba(172,229,4,0.08)] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <GiSoccerBall className="h-5 w-5 text-primary dark:text-brand-green" />
            <CardTitle className="uppercase font-black text-foreground">Cronaca Partita</CardTitle>
          </div>
          <Button
            size="icon"
            className="rounded-full bg-primary dark:bg-black border border-primary dark:border-brand-green text-white dark:text-brand-green hover:opacity-90 dark:hover:bg-black/80 shadow-md dark:shadow-[0_0_10px_rgba(172,229,4,0.2)]"
            onClick={handleAddNewEvent}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </CardHeader>
        <CardContent className="relative px-2 sm:px-6 pb-8">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border dark:border-brand-green/20 rounded-xl bg-muted/20 dark:bg-transparent">
              <Info className="h-10 w-10 text-primary dark:text-brand-green mb-3 opacity-30" />
              <p className="text-xs font-black uppercase text-foreground/40 dark:text-muted-foreground">Nessun evento registrato</p>
              <p className="text-[10px] font-bold text-foreground/30 dark:text-muted-foreground mt-2 uppercase">Usa il + per aggiungere eventi alla partita.</p>
            </div>
          ) : (
            <div className="relative pt-4">
              <div className="absolute left-1/2 top-4 bottom-0 w-px bg-border dark:bg-brand-green/20 -translate-x-1/2 before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-2 before:h-2 before:rounded-full before:bg-brand-green/30" />

              <div className="space-y-12">
                {timedEvents.length > 0 && (
                  <div className="space-y-8">
                    {timedEvents.map((event) => (
                      <TimelineEvent 
                        key={event.id} 
                        event={event} 
                        match={match} 
                        getEventIcon={getEventIcon} 
                        getEventLabel={getEventLabel} 
                        isHome={event.team === 'home'}
                        onOptionsClick={setSelectedEventOptions}
                      />
                    ))}
                  </div>
                )}

                {unTimedEvents.length > 0 && (
                  <div className="space-y-6 pt-8">
                    <div className="relative flex justify-center mb-8">
                         <span className="bg-card dark:bg-background px-4 py-1 rounded-full border border-border dark:border-brand-green/30 text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 z-10 shadow-sm">
                            Eventi Extra
                         </span>
                    </div>
                    {unTimedEvents.map((event) => (
                      <TimelineEvent 
                        key={event.id} 
                        event={event} 
                        match={match} 
                        getEventIcon={getEventIcon} 
                        getEventLabel={getEventLabel} 
                        isHome={event.team === 'home'}
                        onOptionsClick={setSelectedEventOptions}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <MatchEventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        eventToEdit={eventToEdit}
      />

      {/* Dialog Opzioni Evento */}
      <EventOptionsDialog
        event={selectedEventOptions}
        open={!!selectedEventOptions}
        onOpenChange={(open) => !open && setSelectedEventOptions(null)}
        onEdit={handleEditEvent}
        onDelete={(id) => {
            deleteEvent(id);
            setSelectedEventOptions(null);
        }}
        getEventIcon={getEventIcon}
        getEventLabel={getEventLabel}
      />
    </div>
  );
}

function TimelineEvent({ event, match, getEventIcon, getEventLabel, isHome, onOptionsClick }: any) {
  const isPitchManTeam = match?.isHome ? isHome : !isHome;
  const mainName = event.playerName || (isPitchManTeam ? 'GIOCATORE' : (match?.opponent || 'AVVERSARIO'));
  const alignLeft = isHome;

  return (
    <div className={cn(
      "relative flex items-center group w-full",
      alignLeft ? "flex-row-reverse pr-[50%]" : "pl-[50%]"
    )}>
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
        {/* Minute tag (Side positioned) */}
        {event.minute !== null && (
            <div className={cn(
                "absolute whitespace-nowrap bg-muted/80 dark:bg-black/80 px-2 py-0.5 rounded-full border border-border dark:border-brand-green/10 text-[9px] font-black tabular-nums shadow-sm z-20",
                alignLeft ? "left-full ml-4" : "right-full mr-4"
            )}>
                {event.minute}&apos;{event.period}
            </div>
        )}

        <button 
          onClick={() => onOptionsClick(event)}
          className="bg-card dark:bg-[#0a1103] rounded-full p-2 border-2 border-border dark:border-brand-green/40 shadow-sm hover:scale-110 hover:border-brand-green transition-all duration-200 group/icon"
        >
          {getEventIcon(event, "h-3.5 w-3.5")}
        </button>
      </div>

      <div className={cn(
        "flex-1 px-4 sm:px-8",
        alignLeft ? "text-right" : "text-left"
      )}>
        <div className={cn(
            "inline-flex flex-col",
            alignLeft ? "items-end" : "items-start"
        )}>
          {event.type === 'substitution' ? (
            <div className={cn("flex flex-col", alignLeft ? "items-end text-right" : "items-start text-left")}>
              <div className="flex items-center gap-2">
                {!alignLeft && <span className="text-[9px] font-black text-brand-green uppercase">In:</span>}
                <p className="font-black leading-tight uppercase text-xs sm:text-sm">{event.playerName}</p>
                {alignLeft && <span className="text-[9px] font-black text-brand-green uppercase">In:</span>}
              </div>
              <div className="flex items-center gap-2 mt-0.5 opacity-60">
                {!alignLeft && <span className="text-[9px] font-black text-rose-500 uppercase">Out:</span>}
                <p className="text-[10px] sm:text-[11px] font-bold leading-tight uppercase">{event.subOutPlayerName}</p>
                {alignLeft && <span className="text-[9px] font-black text-rose-500 uppercase">Out:</span>}
              </div>
            </div>
          ) : event.type === 'note' ? (
              <p className="text-[11px] sm:text-xs font-medium tracking-tight text-foreground/80 break-words italic max-w-[140px] sm:max-w-[200px]">
                &quot;{event.notes}&quot;
              </p>
          ) : (
            <div className={cn("flex flex-col", alignLeft ? "items-end" : "items-start")}>
                <p className="font-black leading-tight uppercase text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                    {mainName.toUpperCase()}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    {!alignLeft && (
                        <Badge variant="outline" className="text-[7px] py-0 px-1 font-black opacity-40 border-primary/20 flex-shrink-0">
                            {isPitchManTeam ? 'PITCH' : 'AVV.'}
                        </Badge>
                    )}
                    <p className="text-[9px] text-muted-foreground font-black tracking-widest leading-none">{getEventLabel(event)}</p>
                    {alignLeft && (
                        <Badge variant="outline" className="text-[7px] py-0 px-1 font-black opacity-40 border-primary/20 flex-shrink-0">
                            {isPitchManTeam ? 'PITCH' : 'AVV.'}
                        </Badge>
                    )}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventOptionsDialog({ event, open, onOpenChange, onEdit, onDelete, getEventIcon, getEventLabel }: any) {
    const router = useRouter();
    if (!event) return null;

    const involvedPlayers = [
        { id: event.playerId, name: event.playerName },
        { id: event.assistPlayerId, name: event.assistPlayerName },
        { id: event.subOutPlayerId, name: event.subOutPlayerName }
    ].filter(p => p.id && p.id !== "none");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[90vw] sm:max-w-xs bg-card dark:bg-black border border-border dark:border-brand-green/30 p-6 rounded-[28px] shadow-2xl">
                <DialogHeader className="items-center text-center">
                    <div className="bg-muted/10 dark:bg-brand-green/5 p-4 rounded-full border border-brand-green/20 mb-3">
                        {getEventIcon(event, "h-8 w-8")}
                    </div>
                    <DialogTitle className="text-xl font-black uppercase tracking-tight leading-none mb-1">
                        Gestione Evento
                    </DialogTitle>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{getEventLabel(event)}</p>
                </DialogHeader>

                <div className="space-y-2 mt-6">
                    <button 
                        onClick={() => onEdit(event)}
                        className="w-full flex items-center justify-between p-4 bg-muted/20 dark:bg-white/5 hover:bg-muted/30 dark:hover:bg-white/10 rounded-2xl transition-all group"
                    >
                        <span className="text-xs font-black uppercase tracking-widest">Modifica Evento</span>
                        <Edit2 className="h-4 w-4 text-brand-green opacity-40 group-hover:opacity-100" />
                    </button>

                    <button 
                        onClick={() => onDelete(event.id)}
                        className="w-full flex items-center justify-between p-4 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl transition-all group"
                    >
                        <span className="text-xs font-black uppercase tracking-widest text-rose-500">Elimina Evento</span>
                        <Trash2 className="h-4 w-4 text-rose-500 opacity-40 group-hover:opacity-100" />
                    </button>

                    {involvedPlayers.length > 0 && (
                        <div className="pt-4 space-y-2">
                             <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] ml-2 mb-2">Vai alla scheda</p>
                             {involvedPlayers.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => router.push(`/membri/${p.id}`)}
                                    className="w-full flex items-center justify-between p-4 bg-primary/10 dark:bg-brand-green/10 hover:bg-primary/20 dark:hover:bg-brand-green/20 rounded-2xl transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-primary dark:text-brand-green opacity-40" />
                                        <span className="text-xs font-black uppercase tracking-widest truncate max-w-[150px]">{p.name}</span>
                                    </div>
                                    <ExternalLink className="h-3 w-3 opacity-20 group-hover:opacity-100" />
                                </button>
                             ))}
                        </div>
                    )}
                </div>
                
                <Button 
                    variant="ghost" 
                    className="w-full mt-6 rounded-2xl font-black uppercase text-[10px] tracking-widest py-6"
                    onClick={() => onOpenChange(false)}
                >
                    Chiudi
                </Button>
            </DialogContent>
        </Dialog>
    );
}
