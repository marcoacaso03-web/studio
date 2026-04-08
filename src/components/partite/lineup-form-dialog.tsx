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
import { getJerseyNumber, getSubstituteNumber, FORMATION_POSITIONS, getPositionAcronym } from "@/lib/lineup-mapping";


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
        const s = [...Array(11)].map((_, i) => {
          const p = lineup.starters[i];
          return (typeof p === "string" ? p : p?.playerId) || "";
        });
        const subs = [...Array(9)].map((_, i) => {
          const p = lineup.substitutes[i];
          return (typeof p === "string" ? p : p?.playerId) || "";
        });
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
      <div className="flex items-center gap-2 border-b border-border dark:border-white/10 py-1.5 last:border-0 hover:bg-muted dark:hover:bg-white/10 transition-all px-2">
        <div className="bg-muted dark:bg-black/50 text-foreground dark:text-white w-14 h-8 flex items-center justify-center font-black text-[10px] uppercase rounded border border-border dark:border-white/20 shadow-none dark:shadow-[0_0_10px_rgba(0,0,0,0.5)]">
          {label}
        </div>
        <div className="flex-1">
          <Select value={value || "none"} onValueChange={onValueChange}>
            <SelectTrigger className="border-none shadow-none h-8 text-foreground/70 dark:text-white/70 focus:ring-0 text-xs font-bold uppercase hover:text-foreground dark:hover:text-white transition-colors">
              <SelectValue placeholder="-- GIOCATORE --" />
            </SelectTrigger>
            <SelectContent className="bg-card dark:bg-black border-border dark:border-white/20 text-foreground dark:text-white">
              <SelectItem value="none" className="text-xs uppercase font-bold text-muted-foreground dark:text-white/50">-- nessuno --</SelectItem>
              {availablePlayers.map(p => (
                <SelectItem key={p.id} value={p.id} className="text-xs uppercase font-black text-foreground dark:text-white">{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-full sm:max-w-md p-0 overflow-hidden flex flex-col gap-0 border-none bg-background dark:bg-black text-foreground dark:text-white transition-colors duration-300">
        <DialogHeader className="bg-muted dark:bg-black text-foreground dark:text-white p-4 flex-row items-center gap-4 space-y-0 border-b border-border dark:border-brand-green/30 shrink-0">
          <Button variant="ghost" size="icon" className="text-primary dark:text-brand-green hover:bg-primary/10 dark:hover:bg-white/10" onClick={() => onOpenChange(false)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter">Inserisci formazioni</DialogTitle>
        </DialogHeader>

        <div className="bg-card dark:bg-card/50 border-b border-border dark:border-white/10 px-4 py-3 flex items-center justify-between text-[10px] uppercase font-black tracking-widest shadow-inner shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary dark:bg-brand-green rounded-full shadow-sm dark:shadow-[0_0_8px_rgba(172,229,4,0.4)]" />
            <span className="text-foreground dark:text-white font-black">PITCHMAN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground dark:text-white/60">MODULO</span>
            <Select value={modulo} onValueChange={setModulo}>
              <SelectTrigger className="bg-background dark:bg-black text-foreground dark:text-white h-8 text-[11px] w-28 py-0 font-black border border-primary/50 dark:border-brand-green/50 shadow-sm uppercase focus:ring-1 focus:ring-primary dark:focus:ring-brand-green">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card dark:bg-black border-border dark:border-brand-green/50 text-foreground dark:text-white">
                <SelectItem value="4-4-2" className="text-[11px] font-black">4-4-2</SelectItem>
                <SelectItem value="4-3-3" className="text-[11px] font-black">4-3-3</SelectItem>
                <SelectItem value="3-5-2" className="text-[11px] font-black">3-5-2</SelectItem>
                <SelectItem value="4-2-3-1" className="text-[11px] font-black">4-2-3-1</SelectItem>
                <SelectItem value="3-4-2-1" className="text-[11px] font-black">3-4-2-1</SelectItem>
                <SelectItem value="3-4-1-2" className="text-[11px] font-black">3-4-1-2</SelectItem>
                <SelectItem value="4-3-1-2" className="text-[11px] font-black">4-3-1-2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-background dark:bg-black p-3 space-y-4">
          <div className="bg-card dark:bg-card/50 rounded-xl shadow-sm dark:shadow-lg border border-border dark:border-white/10 py-1">
            {starters.map((s, i) => (
              <PlayerRow
                key={i}
                label={getPositionAcronym(modulo, i)}
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

          <div className="space-y-0">
            <div className="bg-muted dark:bg-card/50 text-muted-foreground dark:text-white/50 px-4 py-3 flex items-center gap-2 text-[10px] uppercase font-black tracking-widest rounded-t-xl border-t border-x border-border dark:border-white/10">
              <div className="w-4 h-4 bg-background dark:bg-black border border-border dark:border-white/20 rounded-full" />
              <span className="text-foreground dark:text-white text-xs font-black">Panchina</span>
            </div>
            <div className="bg-card dark:bg-card/50 rounded-b-xl shadow-sm dark:shadow-lg border border-border dark:border-white/10 py-1 border-t-0">
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

        <div className="p-4 bg-muted dark:bg-card/50 border-t border-border dark:border-brand-green/30 shrink-0">
          <Button
            className="w-full bg-primary dark:bg-black border-2 border-primary dark:border-brand-green text-white hover:opacity-90 dark:hover:bg-brand-green dark:hover:text-black font-black uppercase text-sm h-14 rounded-2xl shadow-sm dark:shadow-[0_0_15px_rgba(172,229,4,0.2)] transition-all"
            onClick={handleSave}
          >
            Invia le formazioni
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
