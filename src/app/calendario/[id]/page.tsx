"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchLineupTab } from "@/components/partite/match-lineup-tab";
import { MatchEventsTab } from "@/components/partite/match-events-tab";
import { useMatchDetailStore } from '@/store/useMatchDetailStore';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MatchFormDialog } from '@/components/partite/match-form-dialog';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, MapPin, Settings2, Users, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MatchDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { match, loading, load, updateMatch } = useMatchDetailStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (id) {
        load(id);
    }
  }, [id, load]);
  
  const handleSaveMatch = async (data: any) => {
    const updateData = {
        ...data,
        date: data.date.toISOString()
    };
    await updateMatch(updateData);
    toast({
      title: "Partita aggiornata",
      description: `I dettagli della partita contro ${data.opponent} sono stati salvati.`,
    });
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

  if (!match) {
    return notFound();
  }

  const matchDate = new Date(match.date);
  const isCompleted = match.status === 'completed';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default">Completata</Badge>;
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
             <PageHeader title={`Vs ${match.opponent}`} />
             {getStatusBadge(match.status)}
          </div>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="flex items-center justify-center gap-8 md:gap-16">
                  <div className="text-center">
                    <p className="text-sm opacity-80 mb-1">{match.isHome ? "SQUADRA+" : match.opponent.toUpperCase()}</p>
                    <p className="text-5xl font-black">{match.result?.home ?? "-"}</p>
                  </div>
                  <div className="text-3xl font-light opacity-50">-</div>
                  <div className="text-center">
                    <p className="text-sm opacity-80 mb-1">{!match.isHome ? "SQUADRA+" : match.opponent.toUpperCase()}</p>
                    <p className="text-5xl font-black">{match.result?.away ?? "-"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-primary-foreground/20">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 opacity-70" />
                    <span>{matchDate.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 opacity-70" />
                    <span className="truncate">{match.location}</span>
                  </div>
                </div>
                
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => setIsFormOpen(true)}
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  Modifica Dettagli
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="eventi" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="eventi" className="flex items-center gap-2">
              <Zap className="h-4 w-4" /> Cronaca & Eventi
            </TabsTrigger>
            <TabsTrigger value="squadra" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Formazione & Convocati
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eventi" className="space-y-4">
             <MatchEventsTab />
          </TabsContent>

          <TabsContent value="squadra">
              <MatchLineupTab />
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
