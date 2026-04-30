"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, Square, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const EVENT_BUTTONS = [
  { type: "goal", label: "GOL", color: "bg-brand-green text-black hover:bg-brand-green/80 border-transparent" },
  { type: "chance", label: "OCCASIONE", color: "bg-muted/50 text-foreground hover:bg-muted border-border" },
  { type: "woodwork", label: "PALO / TRAVERSA", color: "bg-muted/50 text-foreground hover:bg-muted border-border" },
  { type: "yellow_card", label: "AMMONIZIONE", color: "bg-brand-card-yellow text-white hover:opacity-90 border-transparent" },
  { type: "red_card", label: "ESPULSIONE", color: "bg-brand-card-red text-white hover:opacity-90 border-transparent" },
  { type: "substitution", label: "SOSTITUZIONE", color: "bg-muted/50 text-foreground hover:bg-muted border-border" },
];

export function LiveMatchTracker({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const { match, addEvent } = useMatchDetailStore();
  const teamName = useSettingsStore(state => state.teamName) || "PITCHMAN";
  
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [period, setPeriod] = useState<'1T' | '2T'>('1T');
  const [simpleMode, setSimpleMode] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime !== null) {
      interval = setInterval(() => {
        setSeconds(accumulatedSeconds + Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime, accumulatedSeconds]);

  const handleStartPause = () => {
    if (isRunning) {
      if (startTime !== null) {
        setAccumulatedSeconds(prev => prev + Math.floor((Date.now() - startTime) / 1000));
      }
      setIsRunning(false);
      setStartTime(null);
    } else {
      setStartTime(Date.now());
      setIsRunning(true);
    }
  };

  const handleStop = () => { 
    setIsRunning(false); 
    setStartTime(null);
    setAccumulatedSeconds(0);
    setSeconds(0); 
  };

  const handlePeriodToggle = (checked: boolean) => {
    setPeriod(checked ? '2T' : '1T');
    setIsRunning(false);
    setStartTime(null);
    setAccumulatedSeconds(0);
    setSeconds(0);
  };

  const handleEvent = async (type: string, team: 'home' | 'away') => {
    if (!match) return;
    const minute = Math.floor(seconds / 60);
    
    // In simple mode, just add the event. 
    // If we wanted detailed mode, we would maybe open the normal dialog, 
    // but the request asks to record them instantly in simple mode.
    await addEvent({
      matchId: match.id,
      type: type as any,
      team,
      minute,
      period,
      playerName: type === 'own_goal' ? "Autogol" : "",
    });
  };

  if (!match) return null;

  const homeName = match.isHome ? teamName : match.opponent;
  const awayName = !match.isHome ? teamName : match.opponent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md bg-card dark:bg-black border border-border dark:border-brand-green/30 text-foreground p-6 rounded-[32px] shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black uppercase text-center text-foreground dark:text-white tracking-widest leading-none flex items-center justify-center gap-2">
            <Zap className="h-6 w-6 text-primary dark:text-brand-green" />
            LIVE MATCH
          </DialogTitle>
        </DialogHeader>

        {/* Timer Section */}
        <div className="flex items-center justify-between bg-muted/20 dark:bg-black/40 border border-border dark:border-brand-green/20 p-5 rounded-2xl mb-6 shadow-inner">
           <div className="flex flex-col items-center gap-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tempo</span>
             <Switch 
               checked={period === '2T'} 
               onCheckedChange={handlePeriodToggle}
               className="data-[state=checked]:bg-primary dark:data-[state=checked]:bg-brand-green"
             />
             <span className="text-xs font-black uppercase tracking-widest text-primary dark:text-brand-green">{period}</span>
           </div>

           <div className="text-6xl font-black tabular-nums tracking-tighter text-foreground dark:text-white">
             {String(Math.floor(seconds / 60)).padStart(2, '0')}<span className="opacity-50 animate-pulse">:</span>{String(seconds % 60).padStart(2, '0')}
           </div>

           <div className="flex flex-col gap-2">
             <Button size="icon" variant="outline" className="h-10 w-10 rounded-full border-primary dark:border-brand-green text-primary dark:text-brand-green hover:bg-primary/10 dark:hover:bg-brand-green/10" onClick={handleStartPause}>
               {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
             </Button>
             <Button size="icon" variant="outline" className="h-10 w-10 rounded-full border-rose-500 text-rose-500 hover:bg-rose-500/10" onClick={handleStop}>
               <Square className="h-4 w-4" />
             </Button>
           </div>
        </div>

        {/* Simple Mode Toggle */}
        <div className="flex items-center justify-between mb-6 px-4 py-3 bg-muted/10 dark:bg-white/5 rounded-xl border border-border dark:border-white/10">
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70 dark:text-white/70">Registra SOLO gli eventi senza dettagli</span>
          <Switch 
            checked={simpleMode} 
            onCheckedChange={setSimpleMode} 
            className="scale-90"
          />
        </div>

        {/* Teams Tabs */}
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-14 bg-muted/50 dark:bg-black/40 border border-border dark:border-brand-green/20 p-1.5 rounded-2xl">
            <TabsTrigger value="home" className="text-xs font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-card dark:data-[state=active]:bg-black data-[state=active]:text-primary dark:data-[state=active]:text-brand-green data-[state=active]:shadow-sm transition-all truncate">
              {homeName}
            </TabsTrigger>
            <TabsTrigger value="away" className="text-xs font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-card dark:data-[state=active]:bg-black data-[state=active]:text-primary dark:data-[state=active]:text-brand-green data-[state=active]:shadow-sm transition-all truncate">
              {awayName}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="home" className="grid grid-cols-2 gap-3 outline-none">
            {EVENT_BUTTONS.map(btn => (
              <Button key={btn.type} className={cn("h-16 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-sm border-2 active:scale-95 transition-all", btn.color)} onClick={() => handleEvent(btn.type, 'home')}>
                {btn.label}
              </Button>
            ))}
          </TabsContent>
          
          <TabsContent value="away" className="grid grid-cols-2 gap-3 outline-none">
             {EVENT_BUTTONS.map(btn => (
              <Button key={btn.type} className={cn("h-16 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-sm border-2 active:scale-95 transition-all", btn.color)} onClick={() => handleEvent(btn.type, 'away')}>
                {btn.label}
              </Button>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
