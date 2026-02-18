
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

// Definiamo i tipi di evento per la UI (unificati)
type UIEventType = 'goal' | 'yellow_card' | 'red_card' | 'substitution';

interface MatchEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchEventDialog({ open, onOpenChange }: MatchEventDialogProps) {
  const { allPlayers, addEvents, match } = useMatchDetailStore();
  
  const [uiType, setUiType] = React.useState<UIEventType>('goal');
  const [team, setTeam] = React.useState<'home' | 'away'>('home');
  
  // Campi per Goal
  const [playerId, setPlayerId] = React.useState<string>("");
  const [playerName, setPlayerName] = React.useState<string>("");
  const [assistPlayerId, setAssistPlayerId] = React.useState<string>("");
  const [assistPlayerName, setAssistPlayerName] = React.useState<string>("");
  
  // Campi per Sostituzione
  const [subInPlayerId, setSubInPlayerId] = React.useState<string>("");
  const [subInPlayerName, setSubInPlayerName] = React.useState<string>("");
  const [subOutPlayerId, setSubOutPlayerId] = React.useState<string>("");
  const [subOutPlayerName, setSubOutPlayerName] = React.useState<string>("");

  const [minute, setMinute] = React.useState<number>(0);
  const [period, setPeriod] = React.useState<'1T' | '2T' | '1TS' | '2TS'>('1T');

  const maxMinutes = (period === '1T' || period === '2T') ? 60 : 20;

  React.useEffect(() => {
    if (minute > maxMinutes) {
      setMinute(maxMinutes);
    }
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
      events.push({
        ...baseEvent,
        type: 'goal',
        playerId: team === 'home' ? playerId : undefined,
        playerName: team === 'home' ? selectedScorer?.name : (playerName || match?.opponent || "Avversario"),
      });

      if (assistPlayerId || assistPlayerName) {
        const selectedAssist = allPlayers.find(p => p.id === assistPlayerId);
        events.push({
          ...baseEvent,
          type: 'assist',
          playerId: team === 'home' ? assistPlayerId : undefined,
          playerName: team === 'home' ? selectedAssist?.name : (assistPlayerName || match?.opponent || "Avversario"),
        });
      }
    } else if (uiType === 'substitution') {
      const selectedIn = allPlayers.find(p => p.id === subInPlayerId);
      const selectedOut = allPlayers.find(p => p.id === subOutPlayerId);

      events.push({
        ...baseEvent,
        type: 'sub_out',
        playerId: team === 'home' ? subOutPlayerId : undefined,
        playerName: team === 'home' ? selectedOut?.name : (subOutPlayerName || match?.opponent || "Avversario"),
      });

      events.push({
        ...baseEvent,
        type: 'sub_in',
        playerId: team === 'home' ? subInPlayerId : undefined,
        playerName: team === 'home' ? selectedIn?.name : (subInPlayerName || match?.opponent || "Avversario"),
      });
    } else {
      // Cartellini
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

  const getUITypeLabel = (t: UIEventType) => {
    switch(t) {
        case 'goal': return 'Goal';
        case 'yellow_card': return 'Cartellino Giallo';
        case 'red_card': return 'Cartellino Rosso';
        case 'substitution': return 'Sostituzione';
        default: return t;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md bg-[#0a1a14] border-[#1e3a2f] text-white p-6 rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">Inserimento evento</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Evento */}
          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
            <span className="text-gray-400">Evento:</span>
            <Select value={uiType} onValueChange={(v) => setUiType(v as UIEventType)}>
              <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-medium focus:ring-0">
                <SelectValue placeholder="Seleziona" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2a24] text-white border-gray-700">
                <SelectItem value="goal">Goal</SelectItem>
                <SelectItem value="yellow_card">Ammonizione</SelectItem>
                <SelectItem value="red_card">Espulsione</SelectItem>
                <SelectItem value="substitution">Sostituzione</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Squadra */}
          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
            <span className="text-gray-400">Squadra:</span>
            <Select value={team} onValueChange={(v) => setTeam(v as 'home' | 'away')}>
              <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-medium focus:ring-0">
                <SelectValue placeholder="Seleziona" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2a24] text-white border-gray-700">
                <SelectItem value="home">Squadra+</SelectItem>
                <SelectItem value="away">{match?.opponent || "Avversario"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logica Condizionale Giocatori */}
          {uiType === 'goal' && (
            <>
              <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">Marcatore:</span>
                {team === 'home' ? (
                  <Select value={playerId} onValueChange={setPlayerId}>
                    <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-medium focus:ring-0">
                      <SelectValue placeholder="Seleziona" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2a24] text-white border-gray-700">
                      {allPlayers.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input 
                    className="w-[180px] bg-transparent border-none text-right font-medium focus:outline-none placeholder:text-gray-600"
                    placeholder="Nome giocatore"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                  />
                )}
              </div>
              <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">Assist:</span>
                {team === 'home' ? (
                  <Select value={assistPlayerId} onValueChange={setAssistPlayerId}>
                    <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-medium focus:ring-0">
                      <SelectValue placeholder="Seleziona (opzionale)" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2a24] text-white border-gray-700">
                      <SelectItem value="none">-- nessuno --</SelectItem>
                      {allPlayers.filter(p => p.id !== playerId).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input 
                    className="w-[180px] bg-transparent border-none text-right font-medium focus:outline-none placeholder:text-gray-600"
                    placeholder="Nome assistman"
                    value={assistPlayerName}
                    onChange={(e) => setAssistPlayerName(e.target.value)}
                  />
                )}
              </div>
            </>
          )}

          {uiType === 'substitution' && (
            <>
              <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">Esce:</span>
                {team === 'home' ? (
                  <Select value={subOutPlayerId} onValueChange={setSubOutPlayerId}>
                    <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-medium focus:ring-0">
                      <SelectValue placeholder="Seleziona" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2a24] text-white border-gray-700">
                      {allPlayers.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input 
                    className="w-[180px] bg-transparent border-none text-right font-medium focus:outline-none placeholder:text-gray-600"
                    placeholder="Giocatore in uscita"
                    value={subOutPlayerName}
                    onChange={(e) => setSubOutPlayerName(e.target.value)}
                  />
                )}
              </div>
              <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">Entra:</span>
                {team === 'home' ? (
                  <Select value={subInPlayerId} onValueChange={setSubInPlayerId}>
                    <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-medium focus:ring-0">
                      <SelectValue placeholder="Seleziona" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2a24] text-white border-gray-700">
                      {allPlayers.filter(p => p.id !== subOutPlayerId).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input 
                    className="w-[180px] bg-transparent border-none text-right font-medium focus:outline-none placeholder:text-gray-600"
                    placeholder="Giocatore in entrata"
                    value={subInPlayerName}
                    onChange={(e) => setSubInPlayerName(e.target.value)}
                  />
                )}
              </div>
            </>
          )}

          {(uiType === 'yellow_card' || uiType === 'red_card') && (
            <div className="flex items-center justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Giocatore:</span>
              {team === 'home' ? (
                <Select value={playerId} onValueChange={setPlayerId}>
                  <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-medium focus:ring-0">
                    <SelectValue placeholder="Seleziona" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2a24] text-white border-gray-700">
                    {allPlayers.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <input 
                  className="w-[180px] bg-transparent border-none text-right font-medium focus:outline-none placeholder:text-gray-600"
                  placeholder="Nome giocatore"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              )}
            </div>
          )}

          {/* Minuto */}
          <div className="flex items-center justify-between border-b border-gray-700 pb-2 pt-2">
            <span className="text-gray-400">Minuto:</span>
            <div className="flex items-center gap-2">
                <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
                    <SelectTrigger className="w-20 bg-transparent border-none text-right font-medium focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2a24] text-white border-gray-700">
                        <SelectItem value="1T">1T</SelectItem>
                        <SelectItem value="2T">2T</SelectItem>
                        <SelectItem value="1TS">1TS</SelectItem>
                        <SelectItem value="2TS">2TS</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={minute.toString()} onValueChange={(v) => setMinute(parseInt(v))}>
                    <SelectTrigger className="w-16 bg-transparent border-none text-right font-medium focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2a24] text-white border-gray-700">
                        {Array.from({length: maxMinutes + 1}, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>{i}&apos;</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8 pt-4">
            <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button className="bg-[#00e676] hover:bg-[#00c853] text-[#0a1a14] font-bold px-8" onClick={handleSave}>
              Invia
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
