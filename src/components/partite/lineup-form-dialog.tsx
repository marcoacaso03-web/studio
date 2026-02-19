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
        // Normalize arrays to fixed lengths (11 starters, 9 substitutes for total 20)
        const s = [...Array(11)].map((_, i) => lineup.starters[i] || "");
        const subs = [...Array(9)].map((_, i) => lineup.substitutes[i] || "");
        setStarters(s);
        setSubstitutes(subs);
      } else {
        setStarters(Array(11).fill(""));
        setSubstitutes(Array(9).fill(""));
      }
    }
  }, [open, lineup]);

  const handleSave = () => {
    saveLineup({
      matchId: "", // Will be set by store
      starters,
      substitutes,
    });
    onOpenChange(false);
  };

  // Get all currently selected player IDs to filter them out of other dropdowns
  const allSelectedIds = React.useMemo(() => {
    return [...starters, ...substitutes].filter(id => id !== "" && id !== "none");
  }, [starters, substitutes]);

  const PlayerRow = ({ 
    num, 
    value, 
    onValueChange, 
  }: { 
    num: number, 
    value: string, 
    onValueChange: (val: string) => void,
    isStarter: boolean 
  }) => {
    // Filter players: show all players NOT selected in other slots, 
    // but keep the one currently selected in THIS slot.
    const availablePlayers = allPlayers.filter(p => 
      !allSelectedIds.includes(p.id) || p.id === value
    );

    return (
      <div className="flex items-center gap-2 border-b py-1 last:border-0">
        <div className="bg-primary/20 text-primary w-8 h-8 flex items-center justify-center font-bold text-sm rounded">
          {num}
        </div>
        <div className="flex-1">
          <Select value={value || "none"} onValueChange={onValueChange}>
            <SelectTrigger className="border-none shadow-none h-8 italic text-muted-foreground focus:ring-0">
              <SelectValue placeholder="-- giocatore --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- nessuno --</SelectItem>
              {availablePlayers.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-full sm:max-w-md p-0 overflow-hidden flex flex-col gap-0 border-none bg-background">
        <DialogHeader className="bg-primary text-primary-foreground p-4 flex-row items-center gap-4 space-y-0">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => onOpenChange(false)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <DialogTitle className="text-xl font-medium">Inserisci formazioni</DialogTitle>
        </DialogHeader>

        <div className="bg-muted text-muted-foreground px-4 py-2 flex items-center justify-between text-xs uppercase font-bold">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary rounded-full" />
            <span className="text-foreground">PITCHMAN</span>
          </div>
          <div className="flex items-center gap-1">
            <span>MODULO</span>
            <Select value={modulo} onValueChange={setModulo}>
                <SelectTrigger className="bg-background text-foreground h-7 text-[10px] w-20 py-0 font-bold border-none shadow-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="4-4-2">4-4-2</SelectItem>
                    <SelectItem value="4-3-3">4-3-3</SelectItem>
                    <SelectItem value="3-5-2">3-5-2</SelectItem>
                    <SelectItem value="4-2-3-1">4-2-3-1</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          <div className="bg-card rounded-lg shadow-sm border p-1">
            {starters.map((s, i) => (
              <PlayerRow 
                key={i} 
                num={i + 1} 
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
            <div className="bg-muted text-muted-foreground px-4 py-2 flex items-center gap-2 text-xs uppercase font-bold rounded-t-lg">
              <div className="w-5 h-5 bg-secondary rounded-full" />
              <span className="text-foreground">Riserve</span>
            </div>
            <div className="bg-card rounded-b-lg shadow-sm border p-1">
              {substitutes.map((s, i) => (
                <PlayerRow 
                  key={i} 
                  num={i + 12} 
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

        <div className="p-4 bg-background border-t">
          <Button 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-black uppercase text-sm h-12"
            onClick={handleSave}
          >
            Invia le formazioni
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
