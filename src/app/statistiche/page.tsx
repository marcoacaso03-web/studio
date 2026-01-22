"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStatsStore } from "@/store/useStatsStore";
import { TeamRecord } from "@/components/statistiche/team-record";
import { PlayerLeaderboard } from "@/components/statistiche/player-leaderboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatistichePage() {
  const { loading, loadStats } = useStatsStore();

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div>
      <PageHeader title="Statistiche" />
      <Tabs defaultValue="record" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="record">Record Squadra</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="record">
          {loading ? (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
          ) : (
            <TeamRecord />
          )}
        </TabsContent>
        <TabsContent value="leaderboard">
           {loading ? (
             <Skeleton className="h-96 w-full" />
           ) : (
            <PlayerLeaderboard />
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
