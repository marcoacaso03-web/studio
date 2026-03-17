
"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, ChevronLeft, ChevronRight, PlusCircle, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useTrainingStore } from "@/store/useTrainingStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSeasonsStore } from "@/store/useSeasonsStore";
import { useRouter } from "next/navigation";
import { format, startOfWeek, addWeeks, subWeeks, isSameWeek, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AllenamentoPage() {
  const router = useRouter();
  const { sessions, loading, fetchAll, generateSessions } = useTrainingStore();
  const { sessionsPerWeek } = useSettingsStore();
  const { activeSeason } = useSeasonsStore();
  
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [genStart, setGenStart] = useState(format(new Date(), "yyyy-MM-dd"));
  const [genEnd, setGenEnd] = useState(format(addWeeks(new Date(), 4), "yyyy-MM-dd"));

  useEffect(() => {
    fetchAll();
  }, [fetchAll, activeSeason]);

  const weekSessions = useMemo(() => {
    return sessions.filter(s => isSameWeek(parseISO(s.date), currentWeekStart, { weekStartsOn: 1 }));
  }, [sessions, currentWeekStart]);

  const handleGenerate = async () => {
    await generateSessions(new Date(genStart), new Date(genEnd), sessionsPerWeek);
    setIsGeneratorOpen(false);
  };

  const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const prevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));

  return (
    <div className="space-y-6 pb-20">
      <PageHeader title="Allenamento">
        <Button 
          size="sm" 
          className="bg-accent text-accent-foreground rounded-xl font-black uppercase text-[10px] h-9 px-4"
          onClick={() => setIsGeneratorOpen(true)}
        >
          <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Genera
        </Button>
      </PageHeader>

      <div className="flex items-center justify-between bg-card p-3 rounded-2xl border shadow-sm">
        <Button variant="ghost" size="icon" onClick={prevWeek} className="h-10 w-10 text-primary">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Settimana del</span>
          <span className="text-sm font-black uppercase text-primary">
            {format(currentWeekStart, "dd MMMM yyyy", { locale: it })}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={nextWeek} className="h-10 w-10 text-primary">
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sincronizzazione Cloud...</p>
          </div>
        ) : weekSessions.length === 0 ? (
          <Card className="border-dashed bg-muted/10">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Dumbbell className="h-16 w-16 text-muted-foreground mb-6 opacity-20" />
              <h3 className="text-lg font-black uppercase tracking-tight text-primary">Nessuna sessione</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
                Usa il tasto Genera per pianificare gli allenamenti.
              </p>
            </CardContent>
          </Card>
        ) : (
          weekSessions.map((session) => (
            <Card 
              key={session.id} 
              className="overflow-hidden border shadow-sm rounded-2xl active:scale-[0.98] transition-all cursor-pointer group hover:border-primary/30"
              onClick={() => router.push(`/allenamento/${session.id}`)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center border border-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="text-[10px] font-black uppercase leading-none">#</span>
                    <span className="text-xl font-black leading-none">{session.index.toString().padStart(2, '0')}</span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-black uppercase tracking-tight text-primary">Allenamento #{session.index.toString().padStart(2, '0')}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {format(parseISO(session.date), "EEEE dd MMMM", { locale: it })}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase text-primary">Generatore Sessioni</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase text-muted-foreground">
              Pianifica automaticamente {sessionsPerWeek} sessioni a settimana.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Data Inizio</Label>
              <Input type="date" value={genStart} onChange={e => setGenStart(e.target.value)} className="h-11 rounded-xl font-bold uppercase text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Data Fine</Label>
              <Input type="date" value={genEnd} onChange={e => setGenEnd(e.target.value)} className="h-11 rounded-xl font-bold uppercase text-xs" />
            </div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button variant="ghost" className="flex-1 rounded-xl font-black uppercase text-xs h-12" onClick={() => setIsGeneratorOpen(false)}>Annulla</Button>
            <Button className="flex-1 rounded-xl bg-primary text-white font-black uppercase text-xs h-12" onClick={handleGenerate}>Genera</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
