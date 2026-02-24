
"use client";

import { useEffect, useState, Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchLineupTab } from "@/components/partite/match-lineup-tab";
import { MatchEventsTab } from "@/components/partite/match-events-tab";
import { MatchNotesTab } from "@/components/partite/match-notes-tab";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MatchFormDialog } from "@/components/partite/match-form-dialog";
import { CalendarDays, Settings2, Users, Zap, FileText, Home, Plane, AlertCircle, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function MatchDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const urlSeasonId = searchParams.get('s');

  const { match, loading, error, load, updateMatch } = useMatchDetailStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
        // Caricamento forzato dei dettagli usando l'ID della rotta e l'ID stagione opzionale
        load(id, urlSeasonId || undefined);
    }
  }, [id, urlSeasonId, load]);
  
  const handleSaveMatch = async (data: any) => {
    await updateMatch(data);
  };

  if (loading) {
    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 max-w-md mx-auto text-center p-6">
        <div className="p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-2xl font-black uppercase text-primary">Dettagli non disponibili</h2>
        <Card className="border-destructive/20 bg-destructive/5 w-full">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-destructive/80 leading-relaxed">
              {error}
            </p>
          </CardContent>
        </Card>
        <div className="flex gap-3 w-full mt-4">
          <Button variant="outline" className="flex-1 font-bold uppercase text-xs" onClick={() => router.push('/calendario')}>
             <ArrowLeft className="h-4 w-4 mr-2" /> Torna indietro
          </Button>
          <Button className="flex-1 font-bold uppercase text-xs" onClick={() => load(id, urlSeasonId || undefined)}>
             Riprova
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-8">
          ID Partita: {id} | Stagione: {urlSeasonId || "N/A"}
        </p>
      </div>
    );
  }

  if (!match) return null;

  const matchDate = new Date(match.date);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-primary text-white font-black uppercase text-[10px] px-2">Finita</Badge>;
      case 'scheduled': return <Badge variant="secondary" className="font-black uppercase text-[10px] px-2">Programmata</Badge>;
      case 'canceled': return <Badge variant="destructive" className="font-black uppercase text-[10px] px-2">Annullata</Badge>;
      default: return null;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
              <PageHeader title={`Vs ${match.opponent}`} />
              <Badge variant="outline" className="w-fit text-[10px] font-black uppercase tracking-widest -mt-4 mb-2 border-primary/20 text-primary">
                {match.type}
              </Badge>
           </div>
           {getStatusBadge(match.status)}
        </div>

        <Card className="bg-primary text-primary-foreground shadow-xl border-none overflow-hidden rounded-3xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-8">
              <div className="flex items-center justify-center gap-10 md:gap-20">
                <div className="text-center">
                  <p className="text-[10px] opacity-60 mb-2 font-black uppercase tracking-widest">{match.isHome ? "PITCHMAN" : match.opponent.toUpperCase()}</p>
                  <p className="text-7xl font-black tabular-nums">{match.result?.home ?? "-"}</p>
                </div>
                <div className="text-5xl font-thin opacity-20">VS</div>
                <div className="text-center">
                  <p className="text-[10px] opacity-60 mb-2 font-black uppercase tracking-widest">{!match.isHome ? "PITCHMAN" : match.opponent.toUpperCase()}</p>
                  <p className="text-7xl font-black tabular-nums">{match.result?.away ?? "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 w-full pt-8 border-t border-white/10">
                <div className="flex items-center gap-3 text-sm font-bold">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <CalendarDays className="h-4 w-4 opacity-70" />
                  </div>
                  <span>{matchDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold">
                  <div className="p-2 bg-white/10 rounded-xl">
                    {match.isHome ? <Home className="h-4 w-4 opacity-70" /> : <Plane className="h-4 w-4 opacity-70" />}
                  </div>
                  <span className="truncate uppercase tracking-wider">{match.isHome ? 'In Casa' : 'Trasferta'}</span>
                </div>
              </div>
              
              <Button 
                variant="secondary" 
                size="lg" 
                className="w-full bg-white text-primary hover:bg-white/90 font-black uppercase text-xs h-12 rounded-2xl shadow-lg"
                onClick={() => setIsFormOpen(true)}
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Modifica Gara
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="eventi" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 h-14 bg-muted/50 p-1.5 rounded-2xl border">
          <TabsTrigger value="eventi" className="flex items-center gap-2 text-[10px] font-black uppercase rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Zap className="h-4 w-4" /> Cronaca
          </TabsTrigger>
          <TabsTrigger value="squadra" className="flex items-center gap-2 text-[10px] font-black uppercase rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Users className="h-4 w-4" /> Formazione
          </TabsTrigger>
          <TabsTrigger value="note" className="flex items-center gap-2 text-[10px] font-black uppercase rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
            <FileText className="h-4 w-4" /> Note Tattiche
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eventi" className="space-y-4 outline-none">
           <MatchEventsTab />
        </TabsContent>

        <TabsContent value="squadra" className="outline-none">
            <MatchLineupTab />
        </TabsContent>

        <TabsContent value="note" className="outline-none">
            <MatchNotesTab />
        </TabsContent>
      </Tabs>

      <MatchFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveMatch}
        match={match}
      />
    </div>
  );
}

export default function MatchDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center uppercase font-black text-muted-foreground animate-pulse">Inizializzazione Sistema...</div>}>
      <MatchDetailContent />
    </Suspense>
  );
}
