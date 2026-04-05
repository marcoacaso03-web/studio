
"use client";

import * as React from "react";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MatchEventType, MatchEvent } from "@/lib/types";

const periodOrder: Record<string, number> = {
  '1T': 1,
  '2T': 2,
  '1TS': 3,
  '2TS': 4
};

type UIEventType = 'goal' | 'yellow_card' | 'red_card' | 'substitution';

interface MatchEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchEventDialog({ open, onOpenChange }: MatchEventDialogProps) {
  const { allPlayers, events: allEvents, lineup, addEvents, match } = useMatchDetailStore();
  
  const [uiType, setUiType] = React.useState<UIEventType>('goal');
  const [team, setTeam] = React.useState<'home' | 'away'>('home');
  
  const [playerId, setPlayerId] = React.useState<string>("");
  const [playerName, setPlayerName] = React.useState<string>("");
  const [assistPlayerId, setAssistPlayerId] = React.useState<string>("");
  const [assistPlayerName, setAssistPlayerName] = React.useState<string>("");
  
  const [subInPlayerId, setSubInPlayerId] = React.useState<string>("");
  const [subInPlayerName, setSubInPlayerName] = React.useState<string>("");
  const [subOutPlayerId, setSubOutPlayerId] = React.useState<string>("");
  const [subOutPlayerName, setSubOutPlayerName] = React.useState<string>("");

  const [minute, setMinute] = React.useState<number>(0);
  const [period, setPeriod] = React.useState<'1T' | '2T' | '1TS' | '2TS'>('1T');

  const maxMinutes = (period === '1T' || period === '2T') ? 60 : 20;

  const isPitchManSide = match?.isHome ? team === 'home' : team === 'away';

  const playersStatus = React.useMemo(() => {
    if (!isPitchManSide || !lineup) return { onPitch: allPlayers, onBench: [] };

    let currentPitch = new Set<string>(lineup.starters.map(p => typeof p === "string" ? p : p.playerId).filter(id => id !== ""));
    let currentBench = new Set<string>(lineup.substitutes.map(p => typeof p === "string" ? p : p.playerId).filter(id => id !== ""));

    const sortedEvents = [...allEvents].sort((a, b) => {
      if (periodOrder[a.period] !== periodOrder[b.period]) {
        return periodOrder[a.period] - periodOrder[b.period];
      }
      return a.minute - b.minute;
    });

    for (const event of sortedEvents) {
      const isBefore = 
        periodOrder[event.period] < periodOrder[period] || 
        (event.period === period && event.minute < minute);
      
      if (!isBefore) break;

      if (event.team === (match?.isHome ? 'home' : 'away')) {
        if (event.type === 'substitution') {
           if (event.subOutPlayerId) currentPitch.delete(event.subOutPlayerId);
           if (event.subOutPlayerId) currentBench.add(event.subOutPlayerId);
           if (event.playerId) currentBench.delete(event.playerId);
           if (event.playerId) currentPitch.add(event.playerId);
        }
      }
    }

    return {
      onPitch: allPlayers.filter(p => currentPitch.has(p.id)),
      onBench: allPlayers.filter(p => currentBench.has(p.id))
    };
  }, [allPlayers, allEvents, lineup, minute, period, team, isPitchManSide, match?.isHome]);

  React.useEffect(() => {
    if (minute > maxMinutes) setMinute(maxMinutes);
  }, [period, minute, maxMinutes]);

  const resetForm = () => {
    setPlayerId("");
    setPlayerName("");
    setAssistPlayerId("");
    setAssistPlayerName("");
    setSubInPlayerId("");
    setSubInPlayerName("");
    setSubOutPlayerId("");
    setSubOutPlayerName("");
    setMinute(0);
    setPeriod('1T');
  };

  const handleSave = async () => {
    const eventsToSave: Omit<MatchEvent, 'id'>[] = [];
    const baseEvent = { matchId: match?.id || "", minute, period, team };

    if (uiType === 'goal') {
      const selectedScorer = allPlayers.find(p => p.id === playerId);
      const selectedAssist = allPlayers.find(p => p.id === assistPlayerId);
      
      const goalEvent: any = {
        ...baseEvent,
        type: 'goal',
      };

      if (isPitchManSide) {
        if (playerId) goalEvent.playerId = playerId;
        goalEvent.playerName = selectedScorer?.name || "Giocatore";
        if (assistPlayerId && assistPlayerId !== "none") {
          goalEvent.assistPlayerId = assistPlayerId;
          if (selectedAssist) goalEvent.assistPlayerName = selectedAssist.name;
        }
      } else {
        goalEvent.playerName = playerName || match?.opponent || "Avversario";
        if (assistPlayerName) goalEvent.assistPlayerName = assistPlayerName;
      }
      eventsToSave.push(goalEvent);
    } else if (uiType === 'substitution') {
      const selectedIn = allPlayers.find(p => p.id === subInPlayerId);
      const selectedOut = allPlayers.find(p => p.id === subOutPlayerId);

      const subEvent: any = {
        ...baseEvent,
        type: 'substitution',
      };

      if (isPitchManSide) {
        if (subInPlayerId) subEvent.playerId = subInPlayerId;
        subEvent.playerName = selectedIn?.name || "Subentrante";
        if (subOutPlayerId) subEvent.subOutPlayerId = subOutPlayerId;
        subEvent.subOutPlayerName = selectedOut?.name || "Uscente";
      } else {
        subEvent.playerName = subInPlayerName || "Subentrante";
        subEvent.subOutPlayerName = subOutPlayerName || "Uscente";
      }
      eventsToSave.push(subEvent);
    } else {
      const selectedPlayer = allPlayers.find(p => p.id === playerId);
      const simpleEvent: any = {
        ...baseEvent,
        type: uiType as MatchEventType,
      };

      if (isPitchManSide) {
        if (playerId) simpleEvent.playerId = playerId;
        simpleEvent.playerName = selectedPlayer?.name || "Giocatore";
      } else {
        simpleEvent.playerName = playerName || match?.opponent || "Avversario";
      }
      eventsToSave.push(simpleEvent);
    }

    addEvents(eventsToSave);
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-sm bg-card dark:bg-black border border-border dark:border-brand-green/30 text-foreground p-6 rounded-[28px] shadow-2xl dark:shadow-[0_0_20px_rgba(172,229,4,0.05)]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black uppercase text-center text-foreground dark:text-white tracking-widest leading-none">
            Evento
          </DialogTitle>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 text-center mt-1">Tempo Reale</p>
        </DialogHeader>

        <div className="space-y-2">
          {/* SQUADRA */}
          <div className="flex items-center justify-between bg-muted/20 dark:bg-black/40 border border-transparent hover:border-brand-green/20 p-3 rounded-xl transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Squadra</span>
            <Select value={team} onValueChange={(v) => { setTeam(v as any); setPlayerId(""); setSubInPlayerId(""); setSubOutPlayerId(""); }}>
              <SelectTrigger className="w-[180px] h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:ring-0">
                <SelectValue placeholder="Seleziona" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border dark:border-brand-green/30 bg-card dark:bg-background">
                <SelectItem value="home" className="text-[10px] font-black uppercase">{match?.isHome ? "Home" : "Away"}</SelectItem>
                <SelectItem value="away" className="text-[10px] font-black uppercase">{!match?.isHome ? "Home" : "Away"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* EVENTO */}
          <div className="flex items-center justify-between bg-muted/20 dark:bg-black/40 border border-transparent hover:border-brand-green/20 p-3 rounded-xl transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Tipo</span>
            <Select value={uiType} onValueChange={(v) => setUiType(v as UIEventType)}>
              <SelectTrigger className="w-[180px] h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:ring-0">
                <SelectValue placeholder="Seleziona" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border dark:border-brand-green/30 bg-card dark:bg-background">
                <SelectItem value="goal" className="text-[10px] font-black uppercase dark:text-white text-brand-green">Goal</SelectItem>
                <SelectItem value="yellow_card" className="text-[10px] font-black uppercase dark:text-white text-amber-500">Ammonizione</SelectItem>
                <SelectItem value="red_card" className="text-[10px] font-black uppercase dark:text-white text-rose-500">Espulsione</SelectItem>
                <SelectItem value="substitution" className="text-[10px] font-black uppercase dark:text-white text-primary">Sostituzione</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* GOAL SECTION */}
          {uiType === 'goal' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center justify-between bg-muted/20 dark:bg-black/40 border border-transparent hover:border-brand-green/20 p-3 rounded-xl transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Scorer</span>
                {isPitchManSide ? (
                  <Select value={playerId} onValueChange={setPlayerId}>
                    <SelectTrigger className="w-[180px] h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:ring-0">
                      <SelectValue placeholder="Giocatore" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border dark:border-brand-green/30 bg-card dark:bg-background">
                      {playersStatus.onPitch.map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input className="w-[180px] h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:outline-none text-foreground dark:text-brand-green" placeholder="Nome" value={playerName} onChange={e => setPlayerName(e.target.value)} />
                )}
              </div>
              <div className="flex items-center justify-between bg-muted/20 dark:bg-black/40 border border-transparent hover:border-brand-green/20 p-3 rounded-xl transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Assist</span>
                {isPitchManSide ? (
                  <Select value={assistPlayerId} onValueChange={setAssistPlayerId}>
                    <SelectTrigger className="w-[180px] h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:ring-0">
                      <SelectValue placeholder="opz." />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border dark:border-brand-green/30 bg-card dark:bg-background">
                      <SelectItem value="none" className="text-[10px] font-black uppercase">-- nessuno --</SelectItem>
                      {playersStatus.onPitch.filter(p => p.id !== playerId).map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input className="w-[180px] h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:outline-none text-foreground dark:text-brand-green" placeholder="Nome" value={assistPlayerName} onChange={e => setAssistPlayerName(e.target.value)} />
                )}
              </div>
            </div>
          )}

          {/* SUBSTITUTION SECTION */}
          {uiType === 'substitution' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center justify-between bg-muted/20 dark:bg-black/40 border border-transparent hover:border-brand-green/20 p-3 rounded-xl transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500/50">Out</span>
                {isPitchManSide ? (
                  <Select value={subOutPlayerId} onValueChange={setSubOutPlayerId}>
                    <SelectTrigger className="w-[180px] h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:ring-0 text-rose-500">
                      <SelectValue placeholder="Esce" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border dark:border-brand-green/30 bg-card dark:bg-background">
                      {playersStatus.onPitch.map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input className="w-[180px] h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:outline-none text-rose-500" placeholder="Esce" value={subOutPlayerName} onChange={e => setSubOutPlayerName(e.target.value)} />
                )}
              </div>
              <div className="flex items-center justify-between bg-muted/20 dark:bg-black/40 border border-transparent hover:border-brand-green/20 p-3 rounded-xl transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-green/50">In</span>
                {isPitchManSide ? (
                  <Select value={subInPlayerId} onValueChange={setSubInPlayerId}>
                    <SelectTrigger className="w-[180px] h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:ring-0 text-brand-green">
                      <SelectValue placeholder="Entra" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border dark:border-brand-green/30 bg-card dark:bg-background">
                      {playersStatus.onBench.map(p => (
                        <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase">{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input className="w-[180px] h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:outline-none text-brand-green" placeholder="Entra" value={subInPlayerName} onChange={e => setSubInPlayerName(e.target.value)} />
                )}
              </div>
            </div>
          )}

          {/* CARDS SECTION */}
          {(uiType === 'yellow_card' || uiType === 'red_card') && (
            <div className="flex items-center justify-between bg-muted/20 dark:bg-black/40 border border-transparent hover:border-brand-green/20 p-3 rounded-xl transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Player</span>
              {isPitchManSide ? (
                <Select value={playerId} onValueChange={setPlayerId}>
                  <SelectTrigger className="w-[180px] h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:ring-0">
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border dark:border-brand-green/30 bg-card dark:bg-background">
                    {allPlayers.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-[10px] font-black uppercase">{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input className="w-[180px] h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:outline-none text-foreground dark:text-brand-green" placeholder="Nome" value={playerName} onChange={e => setPlayerName(e.target.value)} />
              )}
            </div>
          )}

          {/* TIME SECTION */}
          <div className="flex items-center justify-between bg-muted/20 dark:bg-black/40 border border-transparent hover:border-brand-green/20 p-3 rounded-xl transition-all">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 ml-1">Time</span>
            <div className="flex items-center gap-2">
                <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
                    <SelectTrigger className="w-16 h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border dark:border-brand-green/30 bg-card dark:bg-background">
                        <SelectItem value="1T" className="text-[10px] font-black uppercase">1T</SelectItem>
                        <SelectItem value="2T" className="text-[10px] font-black uppercase">2T</SelectItem>
                        <SelectItem value="1TS" className="text-[10px] font-black uppercase">1TS</SelectItem>
                        <SelectItem value="2TS" className="text-[10px] font-black uppercase">2TS</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={minute.toString()} onValueChange={(v) => setMinute(parseInt(v))}>
                    <SelectTrigger className="w-16 h-10 bg-transparent border-none text-right font-black uppercase text-xs focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border dark:border-brand-green/30 bg-card dark:bg-background">
                        {Array.from({length: maxMinutes + 1}, (_, i) => (
                            <SelectItem key={i} value={i.toString()} className="text-[10px] font-black uppercase">{i}&apos;</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 pt-2">
            <Button 
               variant="ghost" 
               className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest h-12 text-muted-foreground hover:bg-muted dark:hover:bg-white/5 transition-all"
               onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button 
               className="flex-1 bg-primary dark:bg-black border-2 border-primary dark:border-brand-green text-white dark:text-brand-green font-black uppercase text-[10px] tracking-widest h-12 shadow-md dark:shadow-[0_0_15px_rgba(172,229,4,0.1)] hover:scale-[1.02] active:scale-95 transition-all"
               onClick={handleSave}
            >
              Salva
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
