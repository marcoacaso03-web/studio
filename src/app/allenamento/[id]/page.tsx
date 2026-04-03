
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTrainingStore } from "@/store/useTrainingStore";
import { trainingRepository } from "@/lib/repositories/training-repository";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlayersStore } from "@/store/usePlayersStore";
import { ArrowLeft, Save, ClipboardList, Users, CheckCircle2, Clock, XCircle, Loader2, Target, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { TrainingSession, TrainingAttendance, TrainingStatus } from "@/lib/types";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { parseISO } from "date-fns";

export default function TrainingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const user = useAuthStore(state => state.user);
  const { players, fetchAll: fetchPlayers } = usePlayersStore();
  
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [attendance, setAttendance] = useState<TrainingAttendance[]>([]);
  const [notes, setNotes] = useState("");
  const [focus, setFocus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !sessionId) return;

    const load = async () => {
      setLoading(true);
      const s = await trainingRepository.getById(user.id, sessionId);
      if (s) {
        setSession(s);
        setNotes(s.notes || "");
        setFocus(s.focus || "");
        const att = await trainingRepository.getAttendance(user.id, sessionId);
        setAttendance(att);
        useTrainingStore.getState().updateSessionLocally(sessionId, { notes: s.notes, focus: s.focus, ...s });
      }
      await fetchPlayers();
      setLoading(false);
    };
    load();
  }, [user, sessionId, fetchPlayers]);

  const handleSaveNotes = async () => {
    if (!user || !session) return;
    setSaving(true);
    await trainingRepository.update(user.id, sessionId, { notes, focus });
    useTrainingStore.getState().updateSessionLocally(sessionId, { notes, focus });
    setSaving(false);
  };

  const updateAttendance = async (playerId: string, status: TrainingStatus) => {
    if (!user || !session) return;
    const nextAtt = attendance.filter(a => a.playerId !== playerId).concat({ playerId, status });
    setAttendance(nextAtt);
    // update store sync
    useTrainingStore.getState().updateSessionLocally(sessionId, { attendances: nextAtt } as any);
    await trainingRepository.setAttendance(user.id, sessionId, playerId, status);
  };

  const markAllAsPresent = async () => {
    if (!user || !session) return;
    setSaving(true);
    try {
      // Find players not yet marked exactly as present
      const playersToUpdate = players.filter(p => {
         const current = attendance.find(a => a.playerId === p.id);
         return !current || current.status !== 'presente';
      });
      
      if (playersToUpdate.length === 0) {
         setSaving(false);
         return; // Già tutti presenti
      }

      // Costruire il nuovo stato locale
      let currentAtt = [...attendance];
      
      // Update locally immediately
      for (const p of playersToUpdate) {
         currentAtt = currentAtt.filter(a => a.playerId !== p.id).concat({ playerId: p.id, status: 'presente' });
      }
      setAttendance(currentAtt);
      useTrainingStore.getState().updateSessionLocally(sessionId, { attendances: currentAtt } as any);
      
      // Eseguire le chiamate Firestore
      // N.b.: questo potrebbe essere un batch in futuro, ma per compatibilità con l'architettura attuale usiamo Promise.all
      await Promise.all(
        playersToUpdate.map(p => trainingRepository.setAttendance(user.id, sessionId, p.id, 'presente'))
      );
      
    } catch(e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-primary dark:text-brand-green animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Caricamento Sessione...</p>
      </div>
    );
  }

  if (!session) return <div className="p-8 text-center uppercase font-black">Sessione non trovata</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-muted dark:bg-black/40 border border-border dark:border-brand-green/30 hover:bg-muted/80 dark:hover:bg-black/60 shadow-none dark:shadow-[0_0_10px_rgba(172,229,4,0.05)] transition-all">
          <ArrowLeft className="h-5 w-5 text-primary dark:text-brand-green" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-none flex items-center gap-2">
            <span>Allenamento #{session.index.toString().padStart(2, '0')}</span>
            <span className="text-primary dark:text-brand-green opacity-40">/</span>
            <span className="text-lg opacity-80">{format(session.date.includes('T') ? parseISO(session.date) : new Date(session.date), "dd MMM yyyy", { locale: it })}</span>
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
            Programma Tecnico & Presenze
          </span>
        </div>
      </div>

      <Tabs defaultValue="programma" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-muted dark:bg-black/40 p-1 rounded-2xl border border-border dark:border-brand-green/30 shadow-none dark:shadow-[0_0_10px_rgba(172,229,4,0.1)]">
          <TabsTrigger value="programma" className="flex items-center gap-2 text-[10px] font-black uppercase rounded-xl data-[state=active]:bg-card dark:data-[state=active]:bg-black data-[state=active]:border data-[state=active]:border-primary/30 dark:data-[state=active]:border-brand-green data-[state=active]:text-foreground dark:data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:shadow-[0_0_10px_rgba(172,229,4,0.15)] transition-all">
            <ClipboardList className="h-4 w-4 text-primary dark:text-brand-green" /> Programma
          </TabsTrigger>
          <TabsTrigger value="presenze" className="flex items-center gap-2 text-[10px] font-black uppercase rounded-xl data-[state=active]:bg-card dark:data-[state=active]:bg-black data-[state=active]:border data-[state=active]:border-primary/30 dark:data-[state=active]:border-brand-green data-[state=active]:text-foreground dark:data-[state=active]:text-white data-[state=active]:shadow-sm dark:data-[state=active]:shadow-[0_0_10px_rgba(172,229,4,0.15)] transition-all">
            <Users className="h-4 w-4 text-primary dark:text-brand-green" /> Presenze
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programma" className="space-y-4 outline-none">
          <Card className="rounded-3xl border border-border dark:border-brand-green/30 shadow-sm dark:shadow-[0_0_15px_rgba(172,229,4,0.1)] overflow-hidden">
            <CardHeader className="bg-muted dark:bg-black/60 border-b border-border dark:border-brand-green/30 p-6 pb-8">
              <CardTitle className="text-lg font-black uppercase tracking-tight text-foreground">Esercitazioni e Obiettivi</CardTitle>
              <CardDescription className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Definisci il piano tecnico della seduta.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 -mt-4 bg-card dark:bg-background rounded-t-3xl border-t border-border dark:border-brand-green/30 space-y-6">
              <div className="space-y-3 pb-6 border-b border-border dark:border-brand-green/20">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary dark:text-brand-green" />
                  <Label className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-brand-green">Focus:</Label>
                </div>
                <Input 
                  placeholder="Es. Tecnico, Tattico, Fisico..."
                  className="h-11 rounded-xl bg-background dark:bg-black border border-primary/50 dark:border-brand-green shadow-sm dark:shadow-[0_0_10px_rgba(172,229,4,0.15)] text-foreground font-bold text-sm focus-visible:ring-1 focus-visible:ring-primary dark:focus-visible:ring-brand-green"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                />
                <div className="flex flex-wrap gap-2">
                  {['Tecnico', 'Tattico', 'Fisico', 'Portieri', 'Partita', 'Recupero'].map(f => (
                    <button
                      key={f}
                      onClick={() => setFocus(f)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all",
                        focus === f ? "bg-primary dark:bg-black border border-primary dark:border-brand-green text-white shadow-sm dark:shadow-[0_0_10px_rgba(172,229,4,0.15)]" : "bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea 
                placeholder="Inserisci qui gli esercizi (es. Riscaldamento tecnico, Possesso palla 4vs4+3, Partitella finale...)"
                className="min-h-[400px] text-sm leading-relaxed bg-background dark:bg-black/40 border border-border dark:border-brand-green/30 rounded-2xl p-4 focus-visible:ring-1 focus-visible:ring-primary dark:focus-visible:ring-brand-green resize-none shadow-sm dark:shadow-[0_0_10px_rgba(172,229,4,0.05)] text-foreground dark:text-white"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="pt-6 border-t border-border dark:border-brand-green/20 mt-6">
                <Button 
                  className="w-full h-12 bg-primary dark:bg-black border border-primary dark:border-brand-green text-white rounded-2xl font-black uppercase text-xs shadow-sm dark:shadow-[0_0_10px_rgba(172,229,4,0.15)] hover:opacity-90 dark:hover:bg-black/80 transition-all"
                  onClick={handleSaveNotes}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salva Programma
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presenze" className="space-y-4 outline-none">
          <div className="flex items-center justify-between mb-4 mt-2">
             <h3 className="text-[12px] font-black uppercase text-foreground/80 tracking-widest pl-2">Lista Convocati</h3>
             <Button 
               size="sm" 
               className="h-9 rounded-xl font-black uppercase text-[10px] bg-primary dark:bg-black border border-primary dark:border-brand-green text-white hover:opacity-90 dark:hover:bg-black/80 shadow-sm dark:shadow-[0_0_10px_rgba(172,229,4,0.15)] hover:scale-105 transition-all"
               onClick={markAllAsPresent}
               disabled={saving || players.length === 0}
             >
               {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1.5 text-white dark:text-brand-green" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-white dark:text-brand-green" />}
               Tutti Presenti
             </Button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {players.map(player => {
              const currentStatus = attendance.find(a => a.playerId === player.id)?.status;
              
              return (
                <Card key={player.id} className="rounded-2xl border border-border dark:border-brand-green/20 overflow-hidden bg-card dark:bg-card/40 backdrop-blur-sm shadow-sm dark:shadow-[0_0_10px_rgba(172,229,4,0.05)]">
                  <CardContent className="p-4 flex flex-row items-center justify-between gap-4">
                    <div className="flex flex-col justify-center sm:pl-2 flex-1">
                      <span className="text-[15px] font-black uppercase tracking-tight text-foreground">{player.name}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{player.role}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 w-auto">
                      <Button 
                        size="sm" 
                        variant={currentStatus === 'presente' ? 'default' : 'outline'}
                        className={cn(
                          "h-10 rounded-xl font-black uppercase text-[9px] px-2 transition-all",
                          currentStatus === 'presente' ? "bg-green-500 hover:bg-green-600 text-white border-none" : "border-green-500/30 text-green-600 hover:bg-green-50"
                        )}
                        onClick={() => updateAttendance(player.id, 'presente')}
                      >
                        <CheckCircle2 className={cn("h-3.5 w-3.5 mr-1.5", currentStatus === 'presente' ? "block" : "hidden")} />
                        Presente
                      </Button>
                      <Button 
                        size="sm" 
                        variant={currentStatus === 'ritardo' ? 'default' : 'outline'}
                        className={cn(
                          "h-10 rounded-xl font-black uppercase text-[9px] px-2 transition-all",
                          currentStatus === 'ritardo' ? "bg-yellow-500 hover:bg-yellow-600 text-white border-none" : "border-yellow-500/30 text-yellow-600 hover:bg-yellow-50"
                        )}
                        onClick={() => updateAttendance(player.id, 'ritardo')}
                      >
                        <Clock className={cn("h-3.5 w-3.5 mr-1.5", currentStatus === 'ritardo' ? "block" : "hidden")} />
                        Ritardo
                      </Button>
                      <Button 
                        size="sm" 
                        variant={currentStatus === 'assente' ? 'default' : 'outline'}
                        className={cn(
                          "h-10 rounded-xl font-black uppercase text-[9px] px-2 transition-all",
                          currentStatus === 'assente' ? "bg-red-500 hover:bg-red-600 text-white border-none" : "border-red-500/30 text-red-600 hover:bg-red-50"
                        )}
                        onClick={() => updateAttendance(player.id, 'assente')}
                      >
                        <XCircle className={cn("h-3.5 w-3.5 mr-1.5", currentStatus === 'assente' ? "block" : "hidden")} />
                        Assente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
