
"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchLineupTab } from "@/components/partite/match-lineup-tab";
import { MatchEventsTab } from "@/components/partite/match-events-tab";
import { MatchNotesTab } from "@/components/partite/match-notes-tab";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MatchFormDialog } from "@/components/partite/match-form-dialog";
import { CalendarDays, Settings2, Users, Zap, FileText, Home, Plane, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MatchDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { match, loading, load, updateMatch } = useMatchDetailStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  useEffect(() => {
    if (id) {
        load(id);
    }
  }, [id, load]);
  
  const handleSaveMatch = async (data: any) => {
    await updateMatch(data);
  };

  if (loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  // Mostra 404 SOLO se il caricamento è finito e la partita non esiste
  if (!match && !loading) {
    return notFound();
  }

  // Fallback per sicurezza (non dovrebbe essere mai raggiunto grazie al check sopra)
  if (!match) return null;

  const matchDate = new Date(match.date);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="uppercase">Finita</Badge>;
      case 'scheduled': return <Badge variant="secondary">In Programma</Badge>;
      case 'canceled': return <Badge variant="destructive">Annullata</Badge>;
      default: return null;
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <div className="flex flex-col">
                <PageHeader title={`Vs ${match.opponent}`} />
                <Badge variant="outline" className="w-fit text-[10px] font-black uppercase tracking-widest -mt-4 mb-2">
                  {match.type}
                </Badge>
             </div>
             {getStatusBadge(match.status)}
          </div>

          <Card className="bg-primary text-primary-foreground shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="flex items-center justify-center gap-8 md:gap-16">
                  <div className="text-center">
                    <p className="text-xs opacity-70 mb-1 font-bold uppercase tracking-widest">{match.isHome ? "PITCHMAN" : match.opponent.toUpperCase()}</p>
                    <p className="text-6xl font-black">{match.result?.home ?? "-"}</p>
                  </div>
                  <div className="text-4xl font-light opacity-30">VS</div>
                  <div className="text-center">
                    <p className="text-xs opacity-70 mb-1 font-bold uppercase tracking-widest">{!match.isHome ? "PITCHMAN" : match.opponent.toUpperCase()}</p>
                    <p className="text-6xl font-black">{match.result?.away ?? "-"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-primary-foreground/10">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 opacity-70" />
                    <span>{matchDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {match.isHome ? <Home className="h-4 w-4 opacity-70" /> : <Plane className="h-4 w-4 opacity-70" />}
                    <span className="truncate uppercase font-bold text-[10px] tracking-wider">{match.isHome ? 'In Casa' : 'Trasferta'}</span>
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full mt-2 font-bold uppercase text-xs"
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
          <TabsList className="grid w-full grid-cols-3 mb-4 h-11">
            <TabsTrigger value="eventi" className="flex items-center gap-2 text-xs">
              <Zap className="h-4 w-4" /> Cronaca
            </TabsTrigger>
            <TabsTrigger value="squadra" className="flex items-center gap-2 text-xs">
              <Users className="h-4 w-4" /> Formazione
            </TabsTrigger>
            <TabsTrigger value="note" className="flex items-center gap-2 text-xs">
              <FileText className="h-4 w-4" /> Note Tattiche
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eventi" className="space-y-4">
             <MatchEventsTab />
          </TabsContent>

          <TabsContent value="squadra">
              <MatchLineupTab />
          </TabsContent>

          <TabsContent value="note">
              <MatchNotesTab />
          </TabsContent>
        </Tabs>
      </div>

      <MatchFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveMatch}
        match={match}
      />
    </>
  );
}
