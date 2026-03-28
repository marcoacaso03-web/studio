
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useTrainingStore } from "@/store/useTrainingStore";
import { usePlayersStore } from "@/store/usePlayersStore";
import { useAuthStore } from "@/store/useAuthStore";
import { trainingRepository } from "@/lib/repositories/training-repository";
import { Loader2, ClipboardCheck, ChevronLeft, CalendarRange } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isSameWeek, parseISO } from "date-fns";

interface TrainingStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWeekStart: Date;
}

export function TrainingStatsDialog({ open, onOpenChange, currentWeekStart }: TrainingStatsDialogProps) {
  const { sessions } = useTrainingStore();
  const { players } = usePlayersStore();
  const user = useAuthStore(state => state.user);
  
  const [loading, setLoading] = useState(false);
  const [allAttendance, setAllAttendance] = useState<{ sessionId: string, attendance: any[] }[]>([]);

  useEffect(() => {
    if (open && user && sessions.length > 0) {
      const load = async () => {
        setLoading(true);
        const data = await trainingRepository.getAllAttendanceForSeason(user.id, sessions.map(s => s.id));
        setAllAttendance(data);
        setLoading(false);
      };
      load();
    }
  }, [open, user, sessions]);

  const stats = useMemo(() => {
    return players.map(player => {
      let totalPresent = 0;
      let weeklyPresent = 0;
      let weeklyLate = 0;

      allAttendance.forEach(sessionData => {
        const session = sessions.find(s => s.id === sessionData.sessionId);
        if (!session) return;

        const record = sessionData.attendance.find(a => a.playerId === player.id);
        const isInCurrentWeek = isSameWeek(parseISO(session.date), currentWeekStart, { weekStartsOn: 1 });

        if (record) {
          if (record.status === 'presente' || record.status === 'ritardo') {
            totalPresent++;
            if (isInCurrentWeek) weeklyPresent++;
          }
          if (record.status === 'ritardo' && isInCurrentWeek) {
            weeklyLate++;
          }
        }
      });

      return {
        id: player.id,
        name: player.name,
        totalPresent,
        weeklyPresent,
        weeklyLate
      };
    }).sort((a, b) => b.totalPresent - a.totalPresent);
  }, [players, allAttendance, sessions, currentWeekStart]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] h-[90vh] md:max-w-2xl rounded-3xl p-0 overflow-hidden flex flex-col border border-brand-green/30 shadow-[0_0_25px_rgba(172,229,4,0.15)] [&>button]:hidden">
        <DialogHeader className="p-6 bg-black border-b border-brand-green/30 text-foreground flex-row items-center gap-4 space-y-0 shrink-0">
          <Button variant="ghost" size="icon" className="text-brand-green hover:bg-black/60 h-8 w-8" onClick={() => onOpenChange(false)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black border border-brand-green/30 rounded-xl shadow-[0_0_10px_rgba(172,229,4,0.1)]">
              <ClipboardCheck className="h-5 w-5 text-brand-green" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">Report Presenze</DialogTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Analisi Rendimento Allenamenti</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-background overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 text-foreground animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Calcolo Statistiche...</p>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="p-4">
                <Table>
                  <TableHeader className="bg-black/60">
                    <TableRow className="hover:bg-transparent border-b border-brand-green/20 h-10">
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-brand-green px-3">Giocatore</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-center text-brand-green px-1">Sett (P)</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-center text-brand-green px-1">Sett (R)</TableHead>
                      <TableHead className="text-[9px] font-black uppercase tracking-widest text-center px-1 text-brand-green">Totale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.map((row) => (
                      <TableRow key={row.id} className="h-12 border-b border-brand-green/10 hover:bg-black/40 transition-all">
                        <TableCell className="px-3 py-0">
                          <span className="text-xs font-black uppercase text-foreground leading-tight block truncate max-w-[120px]">
                            {row.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-center px-1 py-0">
                          <span className="text-xs font-bold text-muted-foreground">
                            {row.weeklyPresent}
                          </span>
                        </TableCell>
                        <TableCell className="text-center px-1 py-0">
                          <span className="text-xs font-bold text-foreground">
                            {row.weeklyLate}
                          </span>
                        </TableCell>
                        <TableCell className="text-center px-1 py-0">
                          <div className="bg-black border border-brand-green/30 px-2 py-1 rounded-lg inline-block min-w-[32px]">
                            <span className="text-sm font-black text-brand-green tabular-nums">
                              {row.totalPresent}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="p-4 bg-black border-t border-brand-green/20 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-brand-green shadow-[0_0_6px_rgba(172,229,4,0.5)]" />
            <span className="text-[8px] font-black text-muted-foreground uppercase">Sett (P): Presenze Settimana</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-[8px] font-black text-muted-foreground uppercase">Sett (R): Ritardi Settimana</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
