"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";
import { Badge } from "@/components/ui/badge";
import { Goal, Info, ShieldAlert, Zap } from "lucide-react";
import { MatchStatsTab } from "./match-stats-tab";

export function MatchEventsTab() {
  const { stats, allPlayers, match } = useMatchDetailStore();

  // Aggregate events from stats
  const events = stats.flatMap(stat => {
    const player = allPlayers.find(p => p.id === stat.playerId);
    if (!player) return [];
    
    const playerEvents = [];
    for (let i = 0; i < stat.goals; i++) {
        playerEvents.push({ type: 'goal', player: player.name, time: 'N/D' });
    }
    for (let i = 0; i < stat.yellowCards; i++) {
        playerEvents.push({ type: 'yellow', player: player.name, time: 'N/D' });
    }
    for (let i = 0; i < stat.redCards; i++) {
        playerEvents.push({ type: 'red', player: player.name, time: 'N/D' });
    }
    return playerEvents;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            <CardTitle>Cronaca Partita</CardTitle>
          </div>
          <CardDescription>Riepilogo degli eventi principali della gara.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
                <Info className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Nessun evento registrato per questa partita.</p>
                <p className="text-xs text-muted-foreground mt-1">Inserisci le statistiche per generare gli eventi.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="flex items-center gap-3">
                    {event.type === 'goal' && <Goal className="h-5 w-5 text-green-500" />}
                    {event.type === 'yellow' && <div className="h-5 w-4 bg-yellow-400 rounded-sm border" />}
                    {event.type === 'red' && <div className="h-5 w-4 bg-red-600 rounded-sm border" />}
                    <div>
                        <p className="font-semibold">{event.player}</p>
                        <p className="text-xs text-muted-foreground uppercase">{event.type}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{event.time}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MatchStatsTab />
    </div>
  );
}
