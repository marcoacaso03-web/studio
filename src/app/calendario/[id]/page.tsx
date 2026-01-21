"use client";

import { useEffect } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { notFound, useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchLineup } from "@/components/partite/match-lineup";
import { MatchStatsTab } from "@/components/partite/match-stats-tab";
import { MatchAttendanceTab } from "@/components/partite/match-attendance-tab";
import { useMatchDetailStore } from '@/store/useMatchDetailStore';
import { Skeleton } from '@/components/ui/skeleton';

export default function MatchDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { match, loading, load } = useMatchDetailStore();
  
  useEffect(() => {
    if (id) {
        load(id);
    }
  }, [id, load]);

  if (loading) {
    return (
        <div>
            <PageHeader title="Caricamento..." />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  if (!match) {
    return notFound();
  }

  const matchDate = new Date(match.date);

  return (
    <div>
      <PageHeader title={`Partita vs ${match.opponent}`} />
      
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">Info Partita</TabsTrigger>
          <TabsTrigger value="convocati">Convocati</TabsTrigger>
          <TabsTrigger value="formazione">Formazione</TabsTrigger>
          <TabsTrigger value="statistiche">Statistiche</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Dettagli Partita</CardTitle>
              <CardDescription>Informazioni generali sulla partita.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Data</p>
                  <p>{matchDate.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="font-semibold">Orario</p>
                  <p>{matchDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div>
                  <p className="font-semibold">Luogo</p>
                  <p>{match.location}</p>
                </div>
                <div>
                  <p className="font-semibold">Casa/Trasferta</p>
                  <p>{match.isHome ? "Partita in casa" : "Partita in trasferta"}</p>
                </div>
                 <div>
                  <p className="font-semibold">Risultato Finale</p>
                  <p className="text-2xl font-bold">{match.result ? `${match.result.home} - ${match.result.away}` : "Da giocare"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="convocati">
            <MatchAttendanceTab />
        </TabsContent>

        <TabsContent value="formazione">
            <MatchLineup />
        </TabsContent>

        <TabsContent value="statistiche">
          <MatchStatsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
