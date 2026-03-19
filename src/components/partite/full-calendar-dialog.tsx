"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Calendar, Home, Plane, Globe, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Match, MatchStatus } from "@/lib/types";
import { useMatchesStore } from "@/store/useMatchesStore";
import { useStatsStore } from "@/store/useStatsStore";
import { useSeasonsStore } from "@/store/useSeasonsStore";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImportTuttocampoDialog } from "@/components/partite/import-tuttocampo-dialog";
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

const MatchFormDialog = dynamic(() => import("@/components/partite/match-form-dialog").then(mod => mod.MatchFormDialog), {
  ssr: false
});

interface FullCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FullCalendarDialog({ open, onOpenChange }: FullCalendarDialogProps) {
  const { matches, loading: matchesLoading, add: addMatch, remove: removeMatch } = useMatchesStore();
  const { loadStats } = useStatsStore();
  const { activeSeason } = useSeasonsStore();
  const router = useRouter();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);

  const handleSaveMatch = async (data: any) => {
    const newMatch = await addMatch(data);
    if (newMatch) {
      loadStats();
    }
  };

  const handleDeleteMatch = async () => {
    if (!matchToDelete) return;
    await removeMatch(matchToDelete.id);
    setMatchToDelete(null);
    loadStats();
  };

  const navigateToMatch = (match: Match) => {
    onOpenChange(false);
    router.push(`/calendario/${match.id}?s=${match.seasonId}`);
  };

  const StatusBadge = ({ status }: { status: MatchStatus }) => {
    switch (status) {
      case 'completed': return <div className="h-1.5 w-1.5 rounded-full bg-primary" />;
      case 'scheduled': return <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />;
      case 'canceled': return <div className="h-1.5 w-1.5 rounded-full bg-destructive" />;
      default: return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] h-[90vh] md:max-w-3xl rounded-3xl p-0 overflow-hidden flex flex-col border-none shadow-2xl [&>button]:hidden">
          <DialogHeader className="p-6 bg-primary text-white flex-row items-center justify-between space-y-0 shrink-0">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8" onClick={() => onOpenChange(false)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <DialogTitle className="text-xl font-black uppercase tracking-tight">Calendario</DialogTitle>
                <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-0.5">Stagione {activeSeason?.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 text-[9px] font-black uppercase px-3 rounded-xl"
                size="sm"
                onClick={() => setIsImportOpen(true)}
              >
                <Globe className="mr-1 h-3 w-3" />
                Importa
              </Button>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-8 text-[9px] font-black uppercase px-3 rounded-xl shadow-lg" size="sm" onClick={() => setIsFormOpen(true)}>
                  <PlusCircle className="mr-1 h-3 w-3" />
                  Nuova
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4 bg-background">
            {matchesLoading ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto opacity-20 mb-4" />
                <p className="font-black text-xs uppercase tracking-widest">Nessuna partita registrata</p>
              </div>
            ) : (
              <Table>
                <TableBody>
                  {matches.map((match) => {
                    const mDate = new Date(match.date);
                    const day = mDate.getDate().toString().padStart(2, '0');
                    const month = mDate.toLocaleDateString('it-IT', { month: 'short' }).toUpperCase();
                    
                    return (
                      <TableRow key={match.id} className="h-14 border-b hover:bg-primary/5 transition-all group">
                        <TableCell 
                          className="p-0 px-4 cursor-pointer"
                          onClick={() => navigateToMatch(match)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center min-w-[36px]">
                              <span className="text-xs font-black leading-none text-primary">{day}</span>
                              <span className="text-[9px] font-bold text-muted-foreground">{month}</span>
                            </div>
                            <div className="p-1.5 bg-muted/30 rounded-lg">
                              {match.isHome ? <Home className="h-3.5 w-3.5 text-primary/60" /> : <Plane className="h-3.5 w-3.5 text-accent/60" />}
                            </div>
                            <div className="flex-1 flex items-center justify-between gap-2">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-foreground uppercase tracking-tight truncate max-w-[120px] md:max-w-none">
                                  {match.opponent}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{match.type}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-lg min-w-[40px] text-center">
                                  <span className="text-xs font-black tabular-nums text-primary">
                                    {match.result ? `${match.result.home}-${match.result.away}` : '- : -'}
                                  </span>
                                </div>
                                <StatusBadge status={match.status} />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right p-0 pr-4 w-10">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all" 
                            onClick={(e) => { e.stopPropagation(); setMatchToDelete(match); }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {isFormOpen && (
        <MatchFormDialog 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen} 
          onSave={handleSaveMatch} 
          match={null} 
        />
      )}

      {isImportOpen && (
        <ImportTuttocampoDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
        />
      )}

      <AlertDialog open={!!matchToDelete} onOpenChange={(open) => !open && setMatchToDelete(null)}>
        <AlertDialogContent className="max-w-[90vw] rounded-3xl border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-primary text-2xl font-black uppercase tracking-tight">Elimina Gara</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Questa azione è irreversibile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3 mt-8">
            <AlertDialogCancel className="flex-1 mt-0 rounded-2xl font-black uppercase text-xs h-12 bg-muted/50 border-none">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMatch} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-2xl font-black uppercase text-xs h-12 shadow-lg shadow-destructive/20">
              Conferma
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
