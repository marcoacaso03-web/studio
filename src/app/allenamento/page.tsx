"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, PlusCircle, Trash2, Loader2, Eraser, ClipboardCheck, Target, Users, Filter, CalendarRange, Archive } from "lucide-react";
import { PiTrafficCone } from "react-icons/pi";
import { useTrainingStore } from "@/store/useTrainingStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSeasonsStore } from "@/store/useSeasonsStore";
import { usePlayersStore } from "@/store/usePlayersStore";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { format, startOfWeek, addWeeks, subWeeks, isSameWeek, parseISO, addDays } from "date-fns";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
import { TrainingListDialog } from "@/components/allenamento/training-list-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { parseError, missingSeasonError } from "@/lib/error-utils";

export default function AllenamentoPage() {
  const router = useRouter();
  const { sessions, loading, error: trainingError, fetchAll, generateSessions, deleteSession, deleteSessions, clearAllSessions } = useTrainingStore();
  const { sessionsPerWeek } = useSettingsStore();
  const { activeSeason, error: seasonsError } = useSeasonsStore();
  const { players, fetchAll: fetchPlayers } = usePlayersStore();

  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [genStart, setGenStart] = useState(format(new Date(), "yyyy-MM-dd"));
  const [genEnd, setGenEnd] = useState(format(addWeeks(new Date(), 4), "yyyy-MM-dd"));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [focusFilter, setFocusFilter] = useState<string | null>(null);

  // States for deletions
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [isClearWeekOpen, setIsClearWeekOpen] = useState(false);

  useEffect(() => {
    if (activeSeason) {
      fetchAll();
      fetchPlayers();
    }
  }, [fetchAll, activeSeason, fetchPlayers]);

  const weekSessions = useMemo(() => {
    return sessions.filter(s => {
      try {
        const sessionDate = s.date.includes('T') ? parseISO(s.date) : new Date(s.date);
        const isInWeek = isSameWeek(sessionDate, currentWeekStart, { weekStartsOn: 1 });

        if (!isInWeek) return false;
        if (focusFilter && s.focus !== focusFilter) return false;

        return true;
      } catch (e) {
        return false;
      }
    });
  }, [sessions, currentWeekStart, focusFilter]);

  const uniqueFocuses = useMemo(() => {
    const focuses = new Set<string>();
    sessions.forEach(s => {
      if (s.focus && s.focus.trim() !== "") {
        focuses.add(s.focus);
      }
    });
    return Array.from(focuses).sort();
  }, [sessions]);

  const handleGenerate = async () => {
    setIsGeneratorOpen(false);
    setTimeout(() => {
      const [sy, sm, sd] = genStart.split('-').map(Number);
      const [ey, em, ed] = genEnd.split('-').map(Number);
      generateSessions(new Date(sy, sm - 1, sd), new Date(ey, em - 1, ed), sessionsPerWeek);
    }, 150);
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
    setTimeout(() => clearAllSessions(), 300);
  };

  const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const prevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));

  const hasPageError = seasonsError || trainingError;

  if (!loading && !activeSeason && !seasonsError) {
    return (
      <div className="pb-24 pt-4">
        <PageHeader title="Allenamento" />
        <ErrorState error={missingSeasonError()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <PageHeader title="" className="mb-2 md:mb-4">
        {!hasPageError && (
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
            <Button
              variant="ghost"
              className="rounded-xl px-2 h-9 bg-muted/30 dark:bg-white/5 border border-border/50 dark:border-brand-green/10 hover:bg-muted dark:hover:bg-brand-green/10 flex items-center gap-1 group transition-all active:scale-95 shrink-0"
              onClick={() => router.push('/allenamento/libreria')}
            >
              <PiTrafficCone className="h-3.5 w-3.5 text-primary dark:text-brand-green group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground group-hover:text-primary dark:group-hover:text-brand-green transition-colors">Esercizi</span>
            </Button>

            <Button
              variant="ghost"
              className="rounded-xl px-2 h-9 bg-muted/30 dark:bg-white/5 border border-border/50 dark:border-brand-green/10 hover:bg-muted dark:hover:bg-brand-green/10 flex items-center gap-1 group transition-all active:scale-95 shrink-0"
              onClick={() => setIsStatsOpen(true)}
            >
              <ClipboardCheck className="h-3.5 w-3.5 text-primary dark:text-brand-green group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground group-hover:text-primary dark:group-hover:text-brand-green transition-colors">Report</span>
            </Button>

            <Button
              variant="ghost"
              className="rounded-xl px-2 h-9 bg-muted/30 dark:bg-white/5 border border-border/50 dark:border-brand-green/10 hover:bg-muted dark:hover:bg-brand-green/10 flex items-center gap-1 group transition-all active:scale-95 shrink-0"
              onClick={() => setIsGeneratorOpen(true)}
            >
              <PlusCircle className="h-3.5 w-3.5 text-primary dark:text-brand-green group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground group-hover:text-primary dark:group-hover:text-brand-green transition-colors">Genera</span>
            </Button>

            <Button
              variant="ghost"
              className="rounded-xl px-2 h-9 bg-muted/30 dark:bg-white/5 border border-border/50 dark:border-brand-green/10 hover:bg-muted dark:hover:bg-brand-green/10 flex items-center gap-1 group transition-all active:scale-95 shrink-0"
              onClick={() => setIsArchiveOpen(true)}
            >
              <Archive className="h-3.5 w-3.5 text-primary dark:text-brand-green group-hover:scale-110 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground group-hover:text-primary dark:group-hover:text-brand-green transition-colors">Archivio</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-xl px-2 h-9 bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 flex items-center gap-1 group transition-all active:scale-95 text-rose-500 shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-tighter">Elimina</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl bg-card dark:bg-black border-border dark:border-brand-green/30 backdrop-blur-xl text-foreground dark:text-white p-2">
                <DropdownMenuItem className="text-[10px] font-black uppercase rounded-xl mb-1 focus:bg-primary/20 hover:bg-primary/10 dark:focus:bg-brand-green/20 dark:hover:bg-brand-green/10 transition-colors" onClick={() => setTimeout(() => setIsClearWeekOpen(true), 100)}>
                  <Eraser className="mr-2 h-4 w-4 text-primary dark:text-brand-green" /> Elimina Settimana
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[10px] font-black uppercase rounded-xl text-rose-500 focus:bg-rose-500/20 hover:bg-rose-500/10 transition-colors cursor-pointer" onClick={() => setTimeout(() => setIsClearAllOpen(true), 100)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Elimina Tutto
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </PageHeader>

      {hasPageError ? (
        <ErrorState 
          error={parseError(seasonsError || trainingError)} 
          onRetry={() => {
            useSeasonsStore.getState().fetchAll();
            fetchAll();
          }}
          fullScreen
        />
      ) : (
        <>
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevWeek}
          className="h-10 w-10 text-foreground/50 dark:text-white/50 hover:bg-primary/10 dark:hover:bg-brand-green/10 hover:text-primary dark:hover:text-brand-green rounded-xl transition-all"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="flex flex-col items-center h-auto hover:bg-transparent px-2 transition-opacity active:opacity-70">
              <div className="flex items-center gap-1.5 translate-y-0.5">
                <CalendarRange className="h-3 w-3 text-primary/40 dark:text-brand-green/40" />
                <span className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest leading-tight">Settimana del</span>
              </div>
              <span className="text-sm font-black uppercase text-foreground tracking-tight mt-0.5">
                {format(currentWeekStart, "dd MMM yyyy", { locale: it })}
                <span className="text-muted-foreground mx-1.5 opacity-50">-</span>
                {format(addDays(currentWeekStart, 6), "dd MMM yyyy", { locale: it })}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-2xl bg-card dark:bg-background border-border dark:border-white/10 text-foreground" align="center">
            <Calendar
              mode="single"
              selected={currentWeekStart}
              onSelect={(date) => {
                if (date) {
                  setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
                  setIsCalendarOpen(false);
                }
              }}
              initialFocus
              locale={it}
              className="p-3 bg-card dark:bg-background rounded-2xl"
              classNames={{
                weekday: "text-muted-foreground/30 rounded-md w-9 font-black text-[0.6rem] uppercase tracking-tighter text-center",
                caption_label: "text-sm font-black uppercase tracking-[0.2em] text-foreground dark:text-white",
                day: "h-10 w-10 p-0 m-0 flex items-center justify-center relative",
                day_button: "text-foreground/80 dark:text-white/60 hover:bg-muted dark:hover:bg-black hover:text-foreground dark:hover:text-white hover:border hover:border-primary/30 dark:hover:border-brand-green/30 hover:shadow-sm dark:hover:shadow-[0_0_15px_rgba(172,229,4,0.4)] rounded-xl h-10 w-10 flex items-center justify-center p-0 font-black transition-all cursor-pointer relative z-10",
                selected: "!bg-transparent border-2 border-primary dark:border-brand-green text-primary dark:text-brand-green shadow-sm dark:shadow-[0_0_15px_rgba(172,229,4,0.2)] hover:!bg-muted dark:hover:!bg-black hover:!text-foreground dark:hover:!text-white rounded-xl",
                today: "bg-muted/50 dark:bg-white/5 text-foreground/50 dark:text-white/40 rounded-xl",
                button_previous: "hover:bg-primary/10 dark:hover:bg-brand-green/10 hover:text-primary dark:hover:text-brand-green rounded-lg transition-colors p-1 text-foreground/50 dark:text-white/50",
                button_next: "hover:bg-primary/10 dark:hover:bg-brand-green/10 hover:text-primary dark:hover:text-brand-green rounded-lg transition-colors p-1 text-foreground/50 dark:text-white/50",
              }}
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextWeek}
          className="h-10 w-10 text-foreground/50 dark:text-white/50 hover:bg-primary/10 dark:hover:bg-brand-green/10 hover:text-primary dark:hover:text-brand-green rounded-xl transition-all"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <Loader2 className="h-10 w-10 text-primary dark:text-brand-green animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Sincronizzazione Cloud...</p>
          </div>
        ) : weekSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 border-primary/30 dark:border-brand-green/30 rounded-3xl bg-card/20 hover:bg-card/30">
            <PiTrafficCone className="h-16 w-16 text-primary dark:text-brand-green opacity-40 mb-6" />
            <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Nessuna sessione</h3>
            <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mt-2 max-w-[200px]">
              Usa le opzioni in alto per generare allenamenti.
            </p>
          </div>
        ) : (
          weekSessions.map((session) => {
            const sessionDate = session.date.includes('T') ? parseISO(session.date) : new Date(session.date);
            const dayName = format(sessionDate, "EEE", { locale: it }).toUpperCase();
            const dayNum = format(sessionDate, "dd", { locale: it });
            const monthName = format(sessionDate, "MMM", { locale: it }).toUpperCase();

            const sessionData = session as any;
            const focus = sessionData.focus && sessionData.focus.trim() !== "" ? sessionData.focus : "Nessuno";

            let FocusIcon: any = Target;
            if (focus.toLowerCase().includes('fisic')) FocusIcon = PiTrafficCone;

            const totalPlayers = players.length > 0 ? players.length : 20;
            const presentPlayers = sessionData.attendances && sessionData.attendances.length > 0
              ? sessionData.attendances.filter((a: any) => a.status === 'presente' || a.status === 'ritardo' || a.status === 'present' || a.status === true).length
              : 0;
            const progressPercentage = totalPlayers > 0 ? (presentPlayers / totalPlayers) * 100 : 0;

            return (
              <div
                key={session.id}
                className="relative overflow-hidden border border-border dark:border-brand-green/30 rounded-3xl active:scale-[0.98] transition-transform cursor-pointer group hover:opacity-90 bg-card dark:bg-card/40 backdrop-blur-sm shadow-sm dark:shadow-[0_0_15px_rgba(172,229,4,0.1)]"
                onClick={() => router.push(`/allenamento/${session.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="bg-muted dark:bg-black/60 backdrop-blur-lg px-5 py-2.5 rounded-br-3xl flex items-center gap-1 border-b border-r border-border dark:border-brand-green/30 shadow-none dark:shadow-[0_0_10px_rgba(172,229,4,0.1)]">
                    <span className="text-foreground font-medium text-lg leading-none">{dayName}</span>
                    <span className="text-foreground font-black text-lg leading-none">{dayNum}</span>
                    <span className="text-foreground font-medium text-lg leading-none">{monthName}</span>
                  </div>
                  <div className="p-4 flex gap-2">
                    <Button
                      variant="ghost" 
                      size="icon"
                      className="h-9 w-9 rounded-xl text-rose-500/30 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessionToDelete(session.id);
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="px-5 pt-0 pb-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <FocusIcon className="h-5 w-5 text-primary dark:text-brand-green" />
                    <span className="text-foreground text-[15px] font-medium tracking-wide">Focus: {focus}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-5 flex justify-center">
                        <Users className="h-4 w-4 text-primary dark:text-brand-green" />
                      </div>
                      <span className="text-foreground text-[15px] font-medium tracking-wide">Presenze: {presentPlayers}/{totalPlayers}</span>
                    </div>

                    <div className="w-full bg-muted dark:bg-black border border-border dark:border-white/10 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-primary dark:bg-brand-green h-full rounded-full transition-all duration-1000 ease-out shadow-none dark:shadow-[0_0_10px_rgba(172,229,4,0.5)]"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
        </>
      )}

      {/* Generator Dialog - Mantenuto Funzionale ma stilizzato scuro */}
      <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-3xl bg-card dark:bg-background border-border dark:border-white/10 text-foreground shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase text-foreground">Generatore Sessioni</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase text-muted-foreground/60">
              Pianifica automaticamente {sessionsPerWeek} sessioni a settimana.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground/80">Data Inizio</Label>
              <Input type="date" value={genStart} onChange={e => setGenStart(e.target.value)} className="h-11 rounded-xl font-bold uppercase text-xs bg-background dark:bg-card/20 hover:bg-muted dark:hover:bg-card/30 border-border dark:border-white/10 text-foreground" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest ml-1 text-foreground/80">Data Fine</Label>
              <Input type="date" value={genEnd} onChange={e => setGenEnd(e.target.value)} className="h-11 rounded-xl font-bold uppercase text-xs bg-background dark:bg-card/20 hover:bg-muted dark:hover:bg-card/30 border-border dark:border-white/10 text-foreground" />
            </div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button variant="ghost" className="flex-1 rounded-xl font-black uppercase text-xs h-12 text-foreground/60 hover:bg-muted hover:text-foreground" onClick={() => setIsGeneratorOpen(false)}>Annulla</Button>
            <Button className="flex-1 rounded-xl bg-primary dark:bg-black border border-primary dark:border-brand-green text-white font-black uppercase text-xs h-12 shadow-sm dark:shadow-[0_0_10px_rgba(172,229,4,0.15)] hover:opacity-90 dark:hover:bg-black/80 hover:scale-105 transition-all" onClick={handleGenerate}>Genera</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TrainingStatsDialog
        open={isStatsOpen}
        onOpenChange={setIsStatsOpen}
        currentWeekStart={currentWeekStart}
      />

      <TrainingListDialog 
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        sessions={sessions}
      />

      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent className="rounded-3xl max-w-[90vw] bg-card dark:bg-background border-border dark:border-white/10 text-foreground shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-black text-foreground">Elimina Allenamento?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground/60">
              Questa azione cancellerà definitivamente l'allenamento selezionato e le relative presenze.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-4">
            <AlertDialogCancel className="flex-1 mt-0 rounded-xl font-bold text-xs uppercase h-11 bg-muted hover:bg-muted/80 dark:bg-card/20 dark:hover:bg-card/50 border-none text-foreground">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSingle} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl font-bold text-xs uppercase h-11 border-none">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isClearWeekOpen} onOpenChange={setIsClearWeekOpen}>
        <AlertDialogContent className="rounded-3xl max-w-[90vw] bg-card dark:bg-background border-border dark:border-white/10 text-foreground shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-black text-foreground">Elimina Settimana?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground/60">
              Stai per eliminare tutte le {weekSessions.length} sessioni di questa settimana. Confermi?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-4">
            <AlertDialogCancel className="flex-1 mt-0 rounded-xl font-bold text-xs uppercase h-11 bg-muted hover:bg-muted/80 dark:bg-card/20 dark:hover:bg-card/50 border-none text-foreground">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWeek} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl font-bold text-xs uppercase h-11 border-none">Sì, elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isClearAllOpen} onOpenChange={setIsClearAllOpen}>
        <AlertDialogContent className="rounded-3xl max-w-[90vw] bg-card dark:bg-background border-border dark:border-white/10 text-foreground shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-black text-destructive">RESET TOTALE?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground/60">
              Questa azione cancellerà OGNI allenamento registrato in questa stagione. È un'operazione irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-4">
            <AlertDialogCancel className="flex-1 mt-0 rounded-xl font-bold text-xs uppercase h-11 bg-muted hover:bg-muted/80 dark:bg-card/20 dark:hover:bg-card/50 border-none text-foreground">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAll} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl font-bold text-xs uppercase h-11 border-none">RESET TUTTO</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
