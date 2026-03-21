
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
      </div>
    );
  }

  if (!match) return null;

  const matchDate = new Date(match.date);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-primary text-primary-foreground font-black uppercase text-[10px] px-2">Finita</Badge>;
      case 'scheduled': return <Badge variant="secondary" className="font-black uppercase text-[10px] px-2">Programmata</Badge>;
      case 'canceled': return <Badge variant="destructive" className="font-black uppercase text-[10px] px-2">Annullata</Badge>;
      default: return null;
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
           <div className="flex flex-col">
              <PageHeader title={`Vs ${match.opponent}`} />
              <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-widest -mt-4 mb-1 border-primary/20 text-primary">
                {match.type}
              </Badge>
           </div>
           {getStatusBadge(match.status)}
        </div>

        <Card className="bg-primary text-primary-foreground shadow-xl border-none overflow-hidden rounded-3xl">
          <CardContent className="p-5 md:p-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="flex items-center justify-center gap-6 md:gap-20">
                <div className="text-center">
                  <p className="text-[9px] opacity-60 mb-1 font-black uppercase tracking-widest">{match.isHome ? "PITCHMAN" : match.opponent.toUpperCase()}</p>
                  <p className="text-5xl md:text-7xl font-black tabular-nums">{match.result?.home ?? "-"}</p>
                </div>
                <div className="text-3xl md:text-5xl font-thin opacity-20">VS</div>
                <div className="text-center">
                  <p className="text-[9px] opacity-60 mb-1 font-black uppercase tracking-widest">{!match.isHome ? "PITCHMAN" : match.opponent.toUpperCase()}</p>
                  <p className="text-5xl md:text-7xl font-black tabular-nums">{match.result?.away ?? "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full pt-5 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <CalendarDays className="h-3.5 w-3.5 opacity-70" />
                  </div>
                  <span>{matchDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    {match.isHome ? <Home className="h-3.5 w-3.5 opacity-70" /> : <Plane className="h-3.5 w-3.5 opacity-70" />}
                  </div>
                  <span className="truncate uppercase tracking-wider">{match.isHome ? 'Casa' : 'Trasferta'}</span>
                </div>
              </div>
              
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full bg-white/90 dark:bg-white/10 text-primary dark:text-primary-foreground hover:bg-white dark:hover:bg-white/15 font-black uppercase text-[10px] h-10 rounded-xl shadow-lg"
                onClick={() => setIsFormOpen(true)}
              >
                <Settings2 className="mr-2 h-3.5 w-3.5" />
                Modifica Gara
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="eventi" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 h-12 bg-muted/50 p-1 rounded-xl border">
          <TabsTrigger value="eventi" className="flex items-center gap-1.5 text-[9px] font-black uppercase rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <Zap className="h-3.5 w-3.5" /> Cronaca
          </TabsTrigger>
          <TabsTrigger value="squadra" className="flex items-center gap-1.5 text-[9px] font-black uppercase rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <Users className="h-3.5 w-3.5" /> Squadra
          </TabsTrigger>
          <TabsTrigger value="note" className="flex items-center gap-1.5 text-[9px] font-black uppercase rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            <FileText className="h-3.5 w-3.5" /> Note
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eventi" className="outline-none">
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
