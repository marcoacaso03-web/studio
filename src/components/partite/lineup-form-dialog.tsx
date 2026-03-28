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
import { ChevronLeft } from "lucide-react";

export const FORMATION_POSITIONS: Record<string, string[]> = {
  "4-4-2": ["POR", "TS", "DC", "DC", "TD", "ES", "CC", "CC", "ED", "ATT", "ATT"],
  "4-3-3": ["POR", "TS", "DC", "DC", "TD", "CC", "MED", "CC", "AS", "ATT", "AD"],
  "3-5-2": ["POR", "DC", "DC", "DC", "ES", "CC", "MED", "CC", "ED", "ATT", "ATT"],
  "4-2-3-1": ["POR", "TS", "DC", "DC", "TD", "MED", "MED", "ES", "TRQ", "ED", "ATT"],
  "3-4-2-1": ["POR", "DC", "DC", "DC", "ES", "CC", "CC", "ED", "TRQ", "TRQ", "ATT"],
  "3-4-1-2": ["POR", "DC", "DC", "DC", "ES", "CC", "CC", "ED", "TRQ", "ATT", "ATT"],
  "4-3-1-2": ["POR", "TS", "DC", "DC", "TD", "CC", "MED", "CC", "TRQ", "ATT", "ATT"]
};

interface LineupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LineupFormDialog({ open, onOpenChange }: LineupFormDialogProps) {
  const { allPlayers, lineup, saveLineup, match } = useMatchDetailStore();
  const [starters, setStarters] = React.useState<string[]>(Array(11).fill(""));
  const [substitutes, setSubstitutes] = React.useState<string[]>(Array(9).fill(""));
  const [modulo, setModulo] = React.useState("4-4-2");

  React.useEffect(() => {
    if (open) {
      if (lineup) {
        const s = [...Array(11)].map((_, i) => lineup.starters[i] || "");
        const subs = [...Array(9)].map((_, i) => lineup.substitutes[i] || "");
        setStarters(s);
        setSubstitutes(subs);
        if (lineup.formation) setModulo(lineup.formation);
      } else {
        setStarters(Array(11).fill(""));
        setSubstitutes(Array(9).fill(""));
      }
    }
  }, [open, lineup]);

  const handleSave = () => {
    saveLineup({
      matchId: "", // Gestito dallo store
      starters,
      substitutes,
      formation: modulo,
    });
    onOpenChange(false);
  };

  const allSelectedIds = React.useMemo(() => {
    return [...starters, ...substitutes].filter(id => id !== "" && id !== "none");
  }, [starters, substitutes]);

  const PlayerRow = ({
    label,
    value,
    onValueChange,
  }: {
    label: string | number,
    value: string,
    onValueChange: (val: string) => void,
    isStarter: boolean
  }) => {
    const availablePlayers = allPlayers.filter(p =>
      !allSelectedIds.includes(p.id) || p.id === value
    );

    return (
      <div className="flex items-center gap-2 border-b border-white/5 py-1 last:border-0 hover:bg-white/5 transition-all">
        <div className="bg-white/5 text-white w-10 h-8 flex items-center justify-center font-black text-[10px] uppercase rounded border border-white/10">
          {label}
        </div>
        <div className="flex-1">
          <Select value={value || "none"} onValueChange={onValueChange}>
            <SelectTrigger className="border-none shadow-none h-8 italic text-white/30 focus:ring-0 text-xs font-bold uppercase hover:text-white transition-colors">
              <SelectValue placeholder="-- giocatore --" />
            </SelectTrigger>
            <SelectContent className="bg-black border-white/10 text-white">
              <SelectItem value="none" className="text-xs uppercase font-bold text-white/30">-- nessuno --</SelectItem>
              {availablePlayers.map(p => (
                <SelectItem key={p.id} value={p.id} className="text-xs uppercase font-black">{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const currentPositions = FORMATION_POSITIONS[modulo] || Array(11).fill("N/A");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-full sm:max-w-md p-0 overflow-hidden flex flex-col gap-0 border-none bg-black">
        <DialogHeader className="bg-black text-white p-4 flex-row items-center gap-4 space-y-0">
          <Button variant="ghost" size="icon" className="text-brand-green hover:bg-white/10" onClick={() => onOpenChange(false)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter">Inserisci formazioni</DialogTitle>
        </DialogHeader>

        <div className="bg-black text-white/40 px-4 py-2 flex items-center justify-between text-[10px] uppercase font-black tracking-widest border-y border-white/5 shadow-inner">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-brand-green rounded-full shadow-[0_0_8px_rgba(172,229,4,0.4)]" />
            <span className="text-white">PITCHMAN</span>
          </div>
          <div className="flex items-center gap-2">
            <span>MODULO</span>
            <Select value={modulo} onValueChange={setModulo}>
              <SelectTrigger className="bg-transparent text-white h-7 text-[10px] w-24 py-0 font-black border border-white/10 shadow-sm uppercase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10 text-white">
                <SelectItem value="4-4-2" className="text-[10px] font-black">4-4-2</SelectItem>
                <SelectItem value="4-3-3" className="text-[10px] font-black">4-3-3</SelectItem>
                <SelectItem value="3-5-2" className="text-[10px] font-black">3-5-2</SelectItem>
                <SelectItem value="4-2-3-1" className="text-[10px] font-black">4-2-3-1</SelectItem>
                <SelectItem value="3-4-2-1" className="text-[10px] font-black">3-4-2-1</SelectItem>
                <SelectItem value="3-4-1-2" className="text-[10px] font-black">3-4-1-2</SelectItem>
                <SelectItem value="4-3-1-2" className="text-[10px] font-black">4-3-1-2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4 bg-black">
          <div className="bg-black rounded-xl shadow-sm border border-white/5 p-1">
            {starters.map((s, i) => (
              <PlayerRow
                key={i}
                label={currentPositions[i]}
                value={s}
                isStarter={true}
                onValueChange={(val) => {
                  const newStarters = [...starters];
                  newStarters[i] = val === "none" ? "" : val;
                  setStarters(newStarters);
                }}
              />
            ))}
          </div>

          <div className="space-y-2">
            <div className="bg-black text-white/40 px-4 py-2 flex items-center gap-2 text-[10px] uppercase font-black tracking-widest rounded-t-xl border border-white/10">
              <div className="w-5 h-5 bg-black border border-white/20 rounded-full" />
              <span className="text-white">Panchina</span>
            </div>
            <div className="bg-black rounded-b-xl shadow-sm border border-white/10 p-1 border-t-0">
              {substitutes.map((s, i) => (
                <PlayerRow
                  key={i}
                  label={`R${i + 1}`}
                  value={s}
                  isStarter={false}
                  onValueChange={(val) => {
                    const newSubs = [...substitutes];
                    newSubs[i] = val === "none" ? "" : val;
                    setSubstitutes(newSubs);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-black border-t border-white/10">
          <Button
            className="w-full bg-black border border-brand-green text-white hover:bg-brand-green/10 font-black uppercase text-sm h-12 rounded-2xl shadow-[0_0_15px_rgba(172,229,4,0.1)] transition-all"
            onClick={handleSave}
          >
            Invia le formazioni
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
