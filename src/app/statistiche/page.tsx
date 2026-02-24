
"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStatsStore } from "@/store/useStatsStore";
import { TeamRecord } from "@/components/statistiche/team-record";
import { PlayerLeaderboard } from "@/components/statistiche/player-leaderboard";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic imports for charts to optimize LCP and bundle size
const VenueStatsCharts = dynamic(() => import("@/components/statistiche/venue-stats-charts").then(mod => mod.VenueStatsCharts), {
  loading: () => <Skeleton className="h-80 w-full" />,
  ssr: false
});
const GoalVenueCharts = dynamic(() => import("@/components/statistiche/goal-venue-charts").then(mod => mod.GoalVenueCharts), {
  loading: () => <Skeleton className="h-80 w-full" />,
  ssr: false
});
const TeamPerformanceChart = dynamic(() => import("@/components/statistiche/team-performance-chart").then(mod => mod.TeamPerformanceChart), {
  loading: () => <Skeleton className="h-80 w-full" />,
  ssr: false
});
const GoalsIntervalChart = dynamic(() => import("@/components/statistiche/goals-interval-chart").then(mod => mod.GoalsIntervalChart), {
  loading: () => <Skeleton className="h-80 w-full" />,
  ssr: false
});

export default function StatistichePage() {
  const { loading, loadStats } = useStatsStore();

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div>
      <PageHeader title="Statistiche" />
      <Tabs defaultValue="record" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="record" className="text-xs font-bold uppercase">Record</TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-xs font-bold uppercase">Giocatori</TabsTrigger>
          <TabsTrigger value="grafici" className="text-xs font-bold uppercase">Grafici</TabsTrigger>
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
        <TabsContent value="grafici">
           {loading ? (
             <div className="space-y-6">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
             </div>
           ) : (
            <div className="space-y-6">
                <VenueStatsCharts />
                <GoalVenueCharts />
                <TeamPerformanceChart />
                <GoalsIntervalChart />
            </div>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
