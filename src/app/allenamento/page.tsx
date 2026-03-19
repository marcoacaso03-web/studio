
"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, ChevronLeft, ChevronRight, PlusCircle, Trash2, Loader2, Eraser, ClipboardCheck } from "lucide-react";
import { useTrainingStore } from "@/store/useTrainingStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSeasonsStore } from "@/store/useSeasonsStore";
import { useRouter } from "next/navigation";
import { format, startOfWeek, addWeeks, subWeeks, isSameWeek, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TrainingStatsDialog } from "@/components/allenamento/training-stats-dialog";

export default function AllenamentoPage() {
  const router = useRouter();
  const { sessions, loading, fetchAll, generateSessions, deleteSession, deleteSessions, clearAllSessions } = useTrainingStore();
  const { sessionsPerWeek } = useSettingsStore();
  const { activeSeason } = useSeasonsStore();
  
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [genStart, setGenStart] = useState(format(new Date(), "yyyy-MM-dd"));
  const [genEnd, setGenEnd] = useState(format(addWeeks(new Date(), 4), "yyyy-MM-dd"));

  // States for deletions
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isClearWeekOpen, setIsClearWeekOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, activeSeason]);

  const weekSessions = useMemo(() => {
    return sessions.filter(s => isSameWeek(parseISO(s.date), currentWeekStart, { weekStartsOn: 1 }));
  }, [sessions, currentWeekStart]);

  const handleGenerate = async () => {
    setIsGeneratorOpen(false);
    // Piccolo delay per permettere la chiusura del dialog prima del caricamento
    setTimeout(() => {
      generateSessions(new Date(genStart), new Date(genEnd), sessionsPerWeek);
    }, 100);
  };

  const handleDeleteSingle = async () => {
    if (sessionToDelete) {
      const id = sessionToDelete;
      setSessionToDelete(null);
      setTimeout(() => deleteSession(id), 150);
    }
  };

  const handleDeleteWeek = async () => {
    const ids = weekSessions.map(s => s.id);
    setIsClearWeekOpen(false);
    setTimeout(() => deleteSessions(ids), 150);
  };

  const handleDeleteAll = async () => {
    setIsClearAllOpen(false);
    // Cruciale: il timeout assicura che Radix UI rimuova l'overlay prima che lo store blocchi il thread con l'async call
    setTimeout(() => clearAllSessions(), 150);
  };

  const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const prevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));

  return (
    <div className="space-y-6 pb-20">
      <PageHeader title="Allenamento">
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="icon" 
            className="rounded-xl h-9 w-9 border-primary/20 text-primary"
            onClick={() => setIsStatsOpen(true)}
          >
            <ClipboardCheck className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline"
                size="icon" 
                className="rounded-xl h-9 w-9 border-primary/20 text-primary"
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem className="text-[10px] font-bold uppercase" onClick={() => setTimeout(() => setIsClearWeekOpen(true), 100)}>
                Elimina Settimana
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[10px] font-bold uppercase text-destructive" onClick={() => setTimeout(() => setIsClearAllOpen(true), 100)}>
                Elimina Tutto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            size="icon" 
            className="bg-accent text-accent-foreground rounded-xl h-9 w-9 shadow-lg"
            onClick={() => setIsGeneratorOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
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
                    <span className="text-[9px] font-bold uppercase text-muted-foreground/60 tracking-widest">Sessione Programmata</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setSessionToDelete(session.id); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Generator Dialog */}
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

      {/* Stats Dialog */}
      <TrainingStatsDialog 
        open={isStatsOpen} 
        onOpenChange={setIsStatsOpen} 
        currentWeekStart={currentWeekStart}
      />

      {/* Single Delete Alert */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent className="rounded-2xl max-w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-black text-primary">Elimina Allenamento?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Questa azione cancellerà definitivamente l'allenamento selezionato e le relative presenze.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-4">
            <AlertDialogCancel className="flex-1 mt-0 rounded-xl font-bold text-xs uppercase h-11">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSingle} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl font-bold text-xs uppercase h-11">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Week Alert */}
      <AlertDialog open={isClearWeekOpen} onOpenChange={setIsClearWeekOpen}>
        <AlertDialogContent className="rounded-2xl max-w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-black text-primary">Elimina Settimana?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Stai per eliminare tutte le {weekSessions.length} sessioni di questa settimana. Confermi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-4">
            <AlertDialogCancel className="flex-1 mt-0 rounded-xl font-bold text-xs uppercase h-11">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWeek} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl font-bold text-xs uppercase h-11">Sì, elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Alert */}
      <AlertDialog open={isClearAllOpen} onOpenChange={setIsClearAllOpen}>
        <AlertDialogContent className="rounded-2xl max-w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-black text-destructive">RESET TOTALE?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Questa azione cancellerà OGNI allenamento registrato in questa stagione. È un'operazione irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-4">
            <AlertDialogCancel className="flex-1 mt-0 rounded-xl font-bold text-xs uppercase h-11">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl font-bold text-xs uppercase h-11">RESET TUTTO</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
