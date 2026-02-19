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

// Ordine dei periodi per il calcolo cronologico
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

  // Calcola i giocatori in campo e in panchina al minuto selezionato
  const playersStatus = React.useMemo(() => {
    if (team !== 'home' || !lineup) return { onPitch: allPlayers, onBench: [] };

    let currentPitch = new Set<string>(lineup.starters.filter(id => id !== ""));
    let currentBench = new Set<string>(lineup.substitutes.filter(id => id !== ""));

    // Ordina eventi per tempo per processarli cronologicamente
    const sortedEvents = [...allEvents].sort((a, b) => {
      if (periodOrder[a.period] !== periodOrder[b.period]) {
        return periodOrder[a.period] - periodOrder[b.period];
      }
      return a.minute - b.minute;
    });

    // Processa sostituzioni avvenute PRIMA del minuto selezionato
    for (const event of sortedEvents) {
      const isBefore = 
        periodOrder[event.period] < periodOrder[period] || 
        (event.period === period && event.minute < minute);
      
      if (!isBefore) break;

      if (event.team === 'home') {
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
  }, [allPlayers, allEvents, lineup, minute, period, team]);

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
    const events: Omit<MatchEvent, 'id'>[] = [];
    const baseEvent = { matchId: "", minute, period, team };

    if (uiType === 'goal') {
      const selectedScorer = allPlayers.find(p => p.id === playerId);
      const selectedAssist = allPlayers.find(p => p.id === assistPlayerId);
      
      events.push({
        ...baseEvent,
        type: 'goal',
        playerId: team === 'home' ? playerId : undefined,
        playerName: team === 'home' ? selectedScorer?.name : (playerName || match?.opponent || "Avversario"),
        assistPlayerId: (team === 'home' && assistPlayerId && assistPlayerId !== "none") ? assistPlayerId : undefined,
        assistPlayerName: team === 'home' 
          ? (selectedAssist?.name || undefined) 
          : (assistPlayerName || undefined),
      });
    } else if (uiType === 'substitution') {
      const selectedIn = allPlayers.find(p => p.id === subInPlayerId);
      const selectedOut = allPlayers.find(p => p.id === subOutPlayerId);

      events.push({
        ...baseEvent,
        type: 'substitution',
        playerId: team === 'home' ? subInPlayerId : undefined,
        playerName: team === 'home' ? selectedIn?.name : (subInPlayerName || "Subentrante"),
        subOutPlayerId: team === 'home' ? subOutPlayerId : undefined,
        subOutPlayerName: team === 'home' ? selectedOut?.name : (subOutPlayerName || "Uscente"),
      });
    } else {
      const selectedPlayer = allPlayers.find(p => p.id === playerId);
      events.push({
        ...baseEvent,
        type: uiType as MatchEventType,
        playerId: team === 'home' ? playerId : undefined,
        playerName: team === 'home' ? selectedPlayer?.name : (playerName || match?.opponent || "Avversario"),
      });
    }

    await addEvents(events);
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md bg-background border-border text-foreground p-6 rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6 text-primary">Inserimento evento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-muted pb-2">
            <span className="text-muted-foreground font-medium">Squadra:</span>
            <Select value={team} onValueChange={(v) => { setTeam(v as any); setPlayerId(""); setSubInPlayerId(""); setSubOutPlayerId(""); }}>
              <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-bold focus:ring-0">
                <SelectValue placeholder="Seleziona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Squadra+</SelectItem>
                <SelectItem value="away">{match?.opponent || "Avversario"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between border-b border-muted pb-2">
            <span className="text-muted-foreground font-medium">Evento:</span>
            <Select value={uiType} onValueChange={(v) => setUiType(v as UIEventType)}>
              <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-bold focus:ring-0">
                <SelectValue placeholder="Seleziona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goal">Goal</SelectItem>
                <SelectItem value="yellow_card">Ammonizione</SelectItem>
                <SelectItem value="red_card">Espulsione</SelectItem>
                <SelectItem value="substitution">Sostituzione</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {uiType === 'goal' && (
            <>
              <div className="flex items-center justify-between border-b border-muted pb-2">
                <span className="text-muted-foreground font-medium">Marcatore:</span>
                {team === 'home' ? (
                  <Select value={playerId} onValueChange={setPlayerId}>
                    <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-bold focus:ring-0">
                      <SelectValue placeholder="In campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {playersStatus.onPitch.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input className="w-[180px] bg-transparent border-none text-right font-bold focus:outline-none" placeholder="Nome" value={playerName} onChange={e => setPlayerName(e.target.value)} />
                )}
              </div>
              <div className="flex items-center justify-between border-b border-muted pb-2">
                <span className="text-muted-foreground font-medium">Assist:</span>
                {team === 'home' ? (
                  <Select value={assistPlayerId} onValueChange={setAssistPlayerId}>
                    <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-bold focus:ring-0">
                      <SelectValue placeholder="In campo (opz.)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- nessuno --</SelectItem>
                      {playersStatus.onPitch.filter(p => p.id !== playerId).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input className="w-[180px] bg-transparent border-none text-right font-bold focus:outline-none" placeholder="Nome" value={assistPlayerName} onChange={e => setAssistPlayerName(e.target.value)} />
                )}
              </div>
            </>
          )}

          {uiType === 'substitution' && (
            <>
              <div className="flex items-center justify-between border-b border-muted pb-2">
                <span className="text-muted-foreground font-medium">Esce:</span>
                {team === 'home' ? (
                  <Select value={subOutPlayerId} onValueChange={setSubOutPlayerId}>
                    <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-bold focus:ring-0">
                      <SelectValue placeholder="Dal campo" />
                    </SelectTrigger>
                    <SelectContent>
                      {playersStatus.onPitch.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input className="w-[180px] bg-transparent border-none text-right font-bold focus:outline-none" placeholder="Esce" value={subOutPlayerName} onChange={e => setSubOutPlayerName(e.target.value)} />
                )}
              </div>
              <div className="flex items-center justify-between border-b border-muted pb-2">
                <span className="text-muted-foreground font-medium">Entra:</span>
                {team === 'home' ? (
                  <Select value={subInPlayerId} onValueChange={setSubInPlayerId}>
                    <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-bold focus:ring-0">
                      <SelectValue placeholder="Dalla panchina" />
                    </SelectTrigger>
                    <SelectContent>
                      {playersStatus.onBench.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input className="w-[180px] bg-transparent border-none text-right font-bold focus:outline-none" placeholder="Entra" value={subInPlayerName} onChange={e => setSubInPlayerName(e.target.value)} />
                )}
              </div>
            </>
          )}

          {(uiType === 'yellow_card' || uiType === 'red_card') && (
            <div className="flex items-center justify-between border-b border-muted pb-2">
              <span className="text-muted-foreground font-medium">Giocatore:</span>
              {team === 'home' ? (
                <Select value={playerId} onValueChange={setPlayerId}>
                  <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-bold focus:ring-0">
                    <SelectValue placeholder="In campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {playersStatus.onPitch.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input className="w-[180px] bg-transparent border-none text-right font-bold focus:outline-none" placeholder="Nome" value={playerName} onChange={e => setPlayerName(e.target.value)} />
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-b border-muted pb-2 pt-2">
            <span className="text-muted-foreground font-medium">Tempo & Minuto:</span>
            <div className="flex items-center gap-2">
                <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
                    <SelectTrigger className="w-20 bg-transparent border-none text-right font-bold focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1T">1T</SelectItem>
                        <SelectItem value="2T">2T</SelectItem>
                        <SelectItem value="1TS">1TS</SelectItem>
                        <SelectItem value="2TS">2TS</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={minute.toString()} onValueChange={(v) => setMinute(parseInt(v))}>
                    <SelectTrigger className="w-16 bg-transparent border-none text-right font-bold focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({length: maxMinutes + 1}, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>{i}&apos;</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-black px-8" onClick={handleSave}>
              Salva evento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
