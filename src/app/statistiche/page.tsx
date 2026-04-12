
"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStatsStore } from "@/store/useStatsStore";
import { TeamRecord } from "@/components/statistiche/team-record";
import { PlayerLeaderboard } from "@/components/statistiche/player-leaderboard";
import { useSeasonsStore } from "@/store/useSeasonsStore";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { parseError, missingSeasonError } from "@/lib/error-utils";

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
  const { loading, error: statsError, loadDetailedStats } = useStatsStore();
  const { activeSeason, error: seasonsError, fetchAll: fetchSeasons } = useSeasonsStore();

  useEffect(() => {
    const initialize = async () => {
      const seasons = await fetchSeasons();
      const activeId = useSeasonsStore.getState().activeSeason?.id;
      if (activeId) {
        await loadDetailedStats(activeId);
      }
    };
    initialize();
  }, [loadDetailedStats, fetchSeasons]);

  const hasPageError = seasonsError || statsError;

  if (!loading && !activeSeason && !seasonsError) {
    return (
      <div className="pb-24 pt-4">
        <ErrorState error={missingSeasonError()} />
      </div>
    );
  }

  return (
    <div>
      {hasPageError ? (
        <ErrorState 
          error={parseError(seasonsError || statsError)} 
          onRetry={() => {
            fetchSeasons().then(() => {
              const activeId = useSeasonsStore.getState().activeSeason?.id;
              if (activeId) {
                loadDetailedStats(activeId);
              }
            });
          }}
          fullScreen
        />
      ) : (
        <Tabs defaultValue="record" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 h-12 bg-muted dark:bg-black/40 border border-border dark:border-brand-green/20 p-1 rounded-2xl transition-colors">
          <TabsTrigger value="record" className="text-[10px] font-black uppercase rounded-xl data-[state=active]:bg-background dark:data-[state=active]:bg-black data-[state=active]:text-primary dark:data-[state=active]:text-brand-green data-[state=active]:border data-[state=active]:border-primary/50 dark:data-[state=active]:border-brand-green data-[state=active]:shadow-sm dark:data-[state=active]:shadow-[0_0_10px_rgba(172,229,4,0.15)] text-muted-foreground transition-all">Record</TabsTrigger>
          <TabsTrigger value="leaderboard" className="text-[10px] font-black uppercase rounded-xl data-[state=active]:bg-background dark:data-[state=active]:bg-black data-[state=active]:text-primary dark:data-[state=active]:text-brand-green data-[state=active]:border data-[state=active]:border-primary/50 dark:data-[state=active]:border-brand-green data-[state=active]:shadow-sm dark:data-[state=active]:shadow-[0_0_10px_rgba(172,229,4,0.15)] text-muted-foreground transition-all">Giocatori</TabsTrigger>
          <TabsTrigger value="grafici" className="text-[10px] font-black uppercase rounded-xl data-[state=active]:bg-background dark:data-[state=active]:bg-black data-[state=active]:text-primary dark:data-[state=active]:text-brand-green data-[state=active]:border data-[state=active]:border-primary/50 dark:data-[state=active]:border-brand-green data-[state=active]:shadow-sm dark:data-[state=active]:shadow-[0_0_10px_rgba(172,229,4,0.15)] text-muted-foreground transition-all">Grafici</TabsTrigger>
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
      )}
    </div>
  );
}
