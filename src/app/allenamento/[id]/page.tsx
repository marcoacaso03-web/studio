
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
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { ArrowLeft, Save, ClipboardList, Users, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrainingSession, TrainingAttendance, TrainingStatus } from "@/lib/types";

export default function TrainingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const user = useAuthStore(state => state.user);
  const { players, fetchAll: fetchPlayers } = usePlayersStore();
  
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [attendance, setAttendance] = useState<TrainingAttendance[]>([]);
  const [notes, setNotes] = useState("");
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
        const att = await trainingRepository.getAttendance(user.id, sessionId);
        setAttendance(att);
      }
      await fetchPlayers();
      setLoading(false);
    };
    load();
  }, [user, sessionId, fetchPlayers]);

  const handleSaveNotes = async () => {
    if (!user || !session) return;
    setSaving(true);
    await trainingRepository.update(user.id, sessionId, { notes });
    setSaving(false);
  };

  const updateAttendance = async (playerId: string, status: TrainingStatus) => {
    if (!user || !session) return;
    setAttendance(prev => {
      const filtered = prev.filter(a => a.playerId !== playerId);
      return [...filtered, { playerId, status }];
    });
    await trainingRepository.setAttendance(user.id, sessionId, playerId, status);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Caricamento Sessione...</p>
      </div>
    );
  }

  if (!session) return <div className="p-8 text-center uppercase font-black">Sessione non trovata</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-muted/50">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-primary leading-none">Allenamento #{session.index.toString().padStart(2, '0')}</h1>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
            {format(parseISO(session.date), "EEEE dd MMMM yyyy", { locale: it })}
          </span>
        </div>
      </div>

      <Tabs defaultValue="programma" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-muted/50 p-1 rounded-2xl border">
          <TabsTrigger value="programma" className="flex items-center gap-2 text-[10px] font-black uppercase rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ClipboardList className="h-4 w-4" /> Programma
          </TabsTrigger>
          <TabsTrigger value="presenze" className="flex items-center gap-2 text-[10px] font-black uppercase rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="h-4 w-4" /> Presenze
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programma" className="space-y-4 outline-none">
          <Card className="rounded-3xl border-none shadow-lg overflow-hidden">
            <CardHeader className="bg-primary text-white p-6 pb-8">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Esercitazioni e Obiettivi</CardTitle>
              <CardDescription className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Definisci il piano tecnico della seduta.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 -mt-4 bg-background rounded-t-3xl border-t">
              <Textarea 
                placeholder="Inserisci qui gli esercizi (es. Riscaldamento tecnico, Possesso palla 4vs4+3, Partitella finale...)"
                className="min-h-[400px] text-sm leading-relaxed border-none focus-visible:ring-0 p-0 resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="pt-6 border-t mt-6">
                <Button 
                  className="w-full h-12 bg-primary rounded-2xl font-black uppercase text-xs shadow-lg shadow-primary/20"
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
          <div className="grid grid-cols-1 gap-3">
            {players.map(player => {
              const currentStatus = attendance.find(a => a.playerId === player.id)?.status;
              
              return (
                <Card key={player.id} className="rounded-2xl shadow-sm border overflow-hidden">
                  <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-black text-xs text-muted-foreground border">
                        {player.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-tight text-primary leading-none">{player.name}</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{player.role}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
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
