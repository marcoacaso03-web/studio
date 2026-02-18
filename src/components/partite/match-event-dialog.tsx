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
import { MatchEventType, EVENT_TYPES } from "@/lib/types";

interface MatchEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MatchEventDialog({ open, onOpenChange }: MatchEventDialogProps) {
  const { allPlayers, addEvent, match } = useMatchDetailStore();
  
  const [type, setType] = React.useState<MatchEventType>('goal');
  const [team, setTeam] = React.useState<'home' | 'away'>('home');
  const [playerId, setPlayerId] = React.useState<string>("");
  const [playerName, setPlayerName] = React.useState<string>("");
  const [minute, setMinute] = React.useState<number>(0);
  const [period, setPeriod] = React.useState<'1T' | '2T' | 'Rec'>('1T');

  const handleSave = async () => {
    const selectedPlayer = allPlayers.find(p => p.id === playerId);
    await addEvent({
      matchId: "", // setted by store
      type,
      team,
      playerId: team === 'home' ? playerId : undefined,
      playerName: team === 'home' ? selectedPlayer?.name : (playerName || match?.opponent || "Avversario"),
      minute,
      period,
    });
    onOpenChange(false);
    // Reset
    setPlayerId("");
    setPlayerName("");
    setMinute(0);
  };

  const getEventLabel = (t: MatchEventType) => {
    switch(t) {
        case 'goal': return 'Goal';
        case 'assist': return 'Assist';
        case 'yellow_card': return 'Cartellino Giallo';
        case 'red_card': return 'Cartellino Rosso';
        case 'sub_in': return 'Sostituzione (Entrata)';
        case 'sub_out': return 'Sostituzione (Uscita)';
        default: return t;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-md bg-[#0a1a14] border-[#1e3a2f] text-white p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">Inserimento evento</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Evento */}
          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
            <span className="text-gray-400">Evento:</span>
            <Select value={type} onValueChange={(v) => setType(v as MatchEventType)}>
              <SelectTrigger className="w-[180px] bg-transparent border-none text-right font-medium focus:ring-0">
                <SelectValue placeholder="Seleziona" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2a24] text-white border-gray-700">
                {EVENT_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{getEventLabel(t)}</SelectItem>
                ))}
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

          {/* Giocatore */}
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

          {/* Minuto */}
          <div className="flex items-center justify-between border-b border-gray-700 pb-2">
            <span className="text-gray-400">Minuto:</span>
            <div className="flex items-center gap-2">
                <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
                    <SelectTrigger className="w-20 bg-transparent border-none text-right font-medium focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2a24] text-white border-gray-700">
                        <SelectItem value="1T">1T</SelectItem>
                        <SelectItem value="2T">2T</SelectItem>
                        <SelectItem value="Rec">Rec</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={minute.toString()} onValueChange={(v) => setMinute(parseInt(v))}>
                    <SelectTrigger className="w-16 bg-transparent border-none text-right font-medium focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2a24] text-white border-gray-700">
                        {Array.from({length: 121}, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>{i}&apos;</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8">
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
