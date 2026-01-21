"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { getMatchById, getPlayers } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchLineup } from "@/components/partite/match-lineup";
import { MatchStatsTab } from "@/components/partite/match-stats-tab";
import { MatchAttendanceTab } from "@/components/partite/match-attendance-tab";
import type { Player, Match } from '@/lib/types';


export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const [match, setMatch] = useState<Match | undefined>(undefined);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundMatch = getMatchById(params.id);
    const allPlayers = getPlayers();
    setMatch(foundMatch);
    setPlayers(allPlayers);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return <div>Caricamento...</div>;
  }

  if (!match) {
    notFound();
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
            {players.length > 0 && <MatchAttendanceTab matchId={match.id} players={players} />}
        </TabsContent>

        <TabsContent value="formazione">
            <MatchLineup />
        </TabsContent>

        <TabsContent value="statistiche">
          <MatchStatsTab matchId={match.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
