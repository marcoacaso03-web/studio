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
import { ChevronLeft, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface LineupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LineupFormDialog({ open, onOpenChange }: LineupFormDialogProps) {
  const { allPlayers, lineup, saveLineup, match } = useMatchDetailStore();
  const [starters, setStarters] = React.useState<string[]>(Array(11).fill(""));
  const [substitutes, setSubstitutes] = React.useState<string[]>(Array(4).fill(""));
  const [modulo, setModulo] = React.useState("4-4-2");

  React.useEffect(() => {
    if (open && lineup) {
      setStarters(lineup.starters);
      setSubstitutes(lineup.substitutes);
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

  const PlayerRow = ({ 
    num, 
    value, 
    onValueChange, 
    isStarter 
  }: { 
    num: number, 
    value: string, 
    onValueChange: (val: string) => void,
    isStarter: boolean 
  }) => (
    <div className="flex items-center gap-2 border-b py-1 last:border-0">
      <div className="bg-gray-600 text-white w-8 h-8 flex items-center justify-center font-bold text-sm rounded">
        {num}
      </div>
      <div className="flex-1">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="border-none shadow-none h-8 italic text-muted-foreground focus:ring-0">
            <SelectValue placeholder="-- giocatore --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- nessuno --</SelectItem>
            {allPlayers.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-5 h-7 bg-yellow-100/50 border border-yellow-200 rounded-sm" />
        <div className="w-5 h-7 bg-red-100/50 border border-red-200 rounded-sm" />
        <div className="w-6 h-6 flex items-center justify-center">
          {isStarter ? (
            <ArrowDown className="h-4 w-4 text-red-600" />
          ) : (
            <ArrowUp className="h-4 w-4 text-green-600" />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-full sm:max-w-md p-0 overflow-hidden flex flex-col gap-0 border-none bg-gray-50">
        <DialogHeader className="bg-[#052d1d] text-white p-4 flex-row items-center gap-4 space-y-0">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => onOpenChange(false)}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <DialogTitle className="text-xl font-medium">Inserisci formazioni</DialogTitle>
        </DialogHeader>

        <div className="bg-[#4a4a4a] text-white px-4 py-2 flex items-center justify-between text-xs uppercase font-bold">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <div className="bg-primary w-full h-full" />
            </div>
            <span>{match?.isHome ? "SQUADRA+" : (match?.opponent || "SQUADRA+")}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>MODULO</span>
            <Select value={modulo} onValueChange={setModulo}>
                <SelectTrigger className="bg-white text-black h-7 text-[10px] w-20 py-0 font-bold border-none">
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
          <div className="bg-white rounded shadow-sm">
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
            <div className="bg-[#4a4a4a] text-white px-4 py-2 flex items-center gap-2 text-xs uppercase font-bold rounded-t">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <div className="bg-primary w-full h-full" />
              </div>
              <span>Riserve</span>
            </div>
            <div className="bg-white rounded-b shadow-sm">
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

        <div className="p-4 bg-white border-t">
          <Button 
            className="w-full bg-[#24a148] hover:bg-[#1e8a3d] text-white font-black uppercase text-sm h-12"
            onClick={handleSave}
          >
            Invia le formazioni
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
