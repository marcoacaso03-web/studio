"use client";

import { useState, useMemo, useEffect } from "react";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  ClipboardList, 
  Sparkles, 
  LayoutGrid, 
  Users, 
  Save, 
  RotateCcw,
  Settings2,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TacticalPitchEditor } from "./tactical-pitch-editor";
import { SmartPlayerSelectDialog } from "./smart-player-select-dialog";
import { SmartLineupDialog } from "./smart-lineup-dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { displayPlayerName, cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/store/useSettingsStore";

export function MatchLineupTab() {
  const { lineup, allPlayers, saveLineup, loading } = useMatchDetailStore();
  const teamName = useSettingsStore((state) => state.teamName);
  const { toast } = useToast();
  
  const [starters, setStarters] = useState<string[]>(Array(11).fill(""));
  const [substitutes, setSubstitutes] = useState<string[]>(Array(9).fill(""));
  const [modulo, setModulo] = useState("4-4-2");
  const [isSmartOpen, setIsSmartOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("starters");
  const [isDirty, setIsDirty] = useState(false);

  // Inizializza lo stato locale dal lineup dello store
  useEffect(() => {
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
      setIsDirty(false);
    }
  }, [lineup]);

  const handleSave = async () => {
    try {
      await saveLineup({
        matchId: "", // Gestito dallo store
        starters,
        substitutes,
        formation: modulo,
      });
      setIsDirty(false);
      toast({
        title: "Formazione Salvata",
        description: "La formazione è stata aggiornata con successo.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile salvare la formazione.",
      });
    }
  };

  const handleReset = () => {
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
      setModulo(lineup.formation || "4-4-2");
    } else {
      setStarters(Array(11).fill(""));
      setSubstitutes(Array(9).fill(""));
      setModulo("4-4-2");
    }
    setIsDirty(false);
  };

  const allSelectedIds = useMemo(() => {
    return [...starters, ...substitutes].filter(id => id !== "" && id !== "none");
  }, [starters, substitutes]);

  const handlePlayerChange = (idx: number, isStarter: boolean, playerId: string) => {
    if (isStarter) {
      const newStarters = [...starters];
      newStarters[idx] = playerId === "none" ? "" : playerId;
      setStarters(newStarters);
    } else {
      const newSubs = [...substitutes];
      newSubs[idx] = playerId === "none" ? "" : playerId;
      setSubstitutes(newSubs);
    }
    setIsDirty(true);
  };

  if (loading && !lineup) {
    return <div className="py-20 text-center text-muted-foreground animate-pulse font-black uppercase text-xs tracking-widest">Caricamento Formazione...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header / Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 dark:bg-brand-green/10 border border-primary/20 dark:border-brand-green/20 rounded-2xl flex items-center justify-center">
            <LayoutGrid className="h-5 w-5 text-primary dark:text-brand-green" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Lineup Editor</h3>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gestisci titolari e panchina</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-muted/50 dark:bg-black/40 p-1.5 rounded-2xl border border-border dark:border-white/5">
            <span className="text-[9px] font-black uppercase text-muted-foreground ml-2 hidden sm:inline">MODULO</span>
            <Select 
              value={modulo} 
              onValueChange={(val) => { setModulo(val); setIsDirty(true); }}
            >
              <SelectTrigger className="bg-background dark:bg-black text-primary dark:text-brand-green h-9 text-xs w-28 font-black border-none shadow-none uppercase focus:ring-0 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card dark:bg-black border-border dark:border-brand-green/50 text-foreground dark:text-white rounded-xl">
                {["4-4-2", "4-3-3", "3-5-2", "4-2-3-1", "3-4-2-1", "3-4-1-2", "4-3-1-2"].map(f => (
                  <SelectItem key={f} value={f} className="text-xs font-black uppercase">{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            onClick={() => setIsSmartOpen(true)}
            className="h-10 px-4 rounded-2xl border-primary/30 dark:border-brand-green/30 text-primary dark:text-brand-green font-black uppercase text-[10px] hover:bg-primary/5 dark:hover:bg-brand-green/5 transition-all"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Smart Mode
          </Button>

          {isDirty && (
            <>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleReset}
                className="h-10 w-10 rounded-2xl text-muted-foreground"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button 
                onClick={handleSave}
                className="h-10 px-6 bg-primary dark:bg-brand-green text-white dark:text-black rounded-2xl font-black uppercase text-[10px] shadow-lg dark:shadow-[0_0_15px_rgba(172,229,4,0.2)] animate-in fade-in slide-in-from-right-4"
              >
                <Save className="mr-2 h-4 w-4" />
                Salva
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Editor Area */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 bg-muted/50 dark:bg-black/40 h-12 p-1 rounded-2xl border border-border dark:border-white/5 mb-4">
              <TabsTrigger value="starters" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background dark:data-[state=active]:bg-black data-[state=active]:text-primary dark:data-[state=active]:text-brand-green data-[state=active]:shadow-sm">
                <LayoutGrid className="w-4 h-4 mr-2" />
                Campo
              </TabsTrigger>
              <TabsTrigger value="substitutes" className="rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-background dark:data-[state=active]:bg-black data-[state=active]:text-primary dark:data-[state=active]:text-brand-green data-[state=active]:shadow-sm">
                <Users className="w-4 h-4 mr-2" />
                Panchina ({substitutes.filter(s => s).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="starters" className="m-0 focus-visible:ring-0">
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <TacticalPitchEditor
                  formation={modulo}
                  starters={starters}
                  allPlayers={allPlayers}
                  onSlotClick={(idx) => setEditingSlot(idx)}
                />
              </div>
            </TabsContent>

            <TabsContent value="substitutes" className="m-0 focus-visible:ring-0">
              <Card className="bg-card dark:bg-black/40 border-border dark:border-white/5 rounded-3xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {substitutes.map((s, i) => {
                    const player = allPlayers.find(p => p.id === s);
                    const availablePlayers = allPlayers.filter(p => !allSelectedIds.includes(p.id) || p.id === s);

                    return (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 dark:bg-white/5 rounded-2xl border border-transparent hover:border-primary/20 dark:hover:border-brand-green/20 transition-all group">
                        <div className="w-8 h-8 rounded-full bg-background dark:bg-black flex items-center justify-center text-[10px] font-black text-muted-foreground border border-border dark:border-white/10">
                          R{i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Select 
                            value={s || "none"} 
                            onValueChange={(val) => handlePlayerChange(i, false, val)}
                          >
                            <SelectTrigger className="border-none shadow-none h-8 p-0 bg-transparent focus:ring-0 text-[11px] font-black uppercase text-foreground dark:text-white">
                              <SelectValue placeholder="-- SELEZIONA --" />
                            </SelectTrigger>
                            <SelectContent className="bg-card dark:bg-black border-border dark:border-brand-green/50">
                              <SelectItem value="none" className="text-[10px] font-bold uppercase text-muted-foreground">-- Nessuno --</SelectItem>
                              {availablePlayers.map(p => (
                                <SelectItem key={p.id} value={p.id} className="text-[11px] font-black uppercase">{displayPlayerName(p)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Info Area */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-card dark:bg-black/40 border-border dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-border dark:border-white/5 bg-muted/30 dark:bg-black/60 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary dark:text-brand-green" />
              <h4 className="text-xs font-black uppercase tracking-widest">Riepilogo</h4>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                <span className="text-muted-foreground">Titolari</span>
                <span className={cn(starters.filter(s => s).length === 11 ? "text-primary dark:text-brand-green" : "text-amber-500")}>
                  {starters.filter(s => s).length} / 11
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary dark:bg-brand-green transition-all duration-500" 
                  style={{ width: `${(starters.filter(s => s).length / 11) * 100}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight pt-2">
                <span className="text-muted-foreground">Panchina</span>
                <span className="text-foreground dark:text-white">
                  {substitutes.filter(s => s).length} / 9
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary/40 dark:bg-brand-green/40 transition-all duration-500" 
                  style={{ width: `${(substitutes.filter(s => s).length / 9) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 dark:bg-brand-green/5 border-dashed border-primary/20 dark:border-brand-green/20 rounded-3xl p-5">
            <div className="flex gap-3">
              <Settings2 className="w-5 h-5 text-primary dark:text-brand-green shrink-0" />
              <div className="space-y-1">
                <h5 className="text-[10px] font-black uppercase tracking-tight">Suggerimento</h5>
                <p className="text-[10px] font-bold text-muted-foreground dark:text-white/40 uppercase leading-relaxed">
                  Usa la <strong>AI Smart Mode</strong> per incollare la formazione da una lista esterna (es. WhatsApp).
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {editingSlot !== null && (
        <SmartPlayerSelectDialog
          open={editingSlot !== null}
          onOpenChange={(open) => !open && setEditingSlot(null)}
          slotIndex={editingSlot}
          formation={modulo}
          allPlayers={allPlayers}
          selectedPlayerIds={[...starters, ...substitutes]}
          onSelect={(playerId) => handlePlayerChange(editingSlot, true, playerId)}
        />
      )}

      <SmartLineupDialog 
        open={isSmartOpen} 
        onOpenChange={setIsSmartOpen} 
      />
    </div>
  );
}
