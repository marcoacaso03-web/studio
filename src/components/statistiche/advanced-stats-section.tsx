"use client";

import { useState } from "react";
import { useStatsStore } from "@/store/useStatsStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Zap,
    ShieldCheck,
    Target,
    Users
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AdvancedStatsSection() {
    const { advancedLeaderboard, playerLeaderboard, loading } = useStatsStore();
    const [defenseType, setDefenseType] = useState<'4' | '3'>('4');

    if (loading && !advancedLeaderboard) {
        return <Skeleton className="h-64 w-full rounded-3xl" />;
    }

    if (!advancedLeaderboard) {
        return null; // Don't show anything if no data
    }

    const { bestCbPair, bestCbTrio = [], bestGaPerStarter, decisiveGoalsLeaders, lowestStarterLossRate } = advancedLeaderboard;

    const mainCbPair = bestCbPair[0];
    const mainCbTrio = bestCbTrio[0];
    const bestGaPlayer = bestGaPerStarter[0];
    const topDecisive = decisiveGoalsLeaders[0];
    const bestLossRatePlayer = lowestStarterLossRate[0];

    // Helper to find player name
    const getPlayerName = (id: string) => {
        return playerLeaderboard.find(p => p.playerId === id)?.name || id;
    };

    const currentBestDefense = defenseType === '4' ? mainCbPair : mainCbTrio;

    return (
        <div className="space-y-4 pt-4 border-t border-brand-green/10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary dark:text-brand-green/60 ml-1">Statistiche Pro Advance</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. BEST DEFENSE (Pair or Trio) */}
                <Card className="bg-card dark:bg-black/40 border-border dark:border-brand-green/30 shadow-sm rounded-3xl overflow-hidden transition-all hover:border-brand-green/50 hover:shadow-[0_0_20px_rgba(172,229,4,0.1)] group">
                    <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground group-hover:text-brand-green transition-colors">
                            <ShieldCheck className="h-3 w-3" />
                            Muro Difensivo
                        </CardTitle>
                        <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded-lg border border-white/5">
                            <button
                                onClick={() => setDefenseType('4')}
                                className={`text-[8px] font-black px-1.5 py-0.5 rounded-md transition-all ${defenseType === '4' ? 'bg-brand-green text-black' : 'text-muted-foreground hover:text-white'}`}
                            >DIF A 4</button>
                            <button
                                onClick={() => setDefenseType('3')}
                                className={`text-[8px] font-black px-1.5 py-0.5 rounded-md transition-all ${defenseType === '3' ? 'bg-brand-green text-black' : 'text-muted-foreground hover:text-white'}`}
                            >DIF A 3</button>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                        {currentBestDefense ? (
                            <div className="space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-tight truncate text-foreground dark:text-white">
                                    {currentBestDefense.playerIds.map(id => getPlayerName(id)).join(' + ')}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-brand-green">{currentBestDefense.goalsConcededPerMatch.toFixed(2)}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Subiti/Gara</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-muted-foreground/30">Poche gare</p>
                        )}
                    </CardContent>
                </Card>

                {/* 2. BEST G/A PER STARTER */}
                <Card className="bg-card dark:bg-black/40 border-border dark:border-brand-green/30 shadow-sm rounded-3xl overflow-hidden transition-all hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] group">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground group-hover:text-amber-500 transition-colors">
                            <Zap className="h-3 w-3" />
                            Efficiency Index
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                        {bestGaPlayer ? (
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-tight truncate text-foreground dark:text-white">
                                    {getPlayerName(bestGaPlayer.playerId)}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-amber-500">{bestGaPlayer.gaPerStarter.toFixed(2)}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">G+A / Start</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-muted-foreground/30">Poche gare</p>
                        )}
                    </CardContent>
                </Card>

                {/* 3. MOST DECISIVE GOALS */}
                <Card className="bg-card dark:bg-black/40 border-border dark:border-brand-green/30 shadow-sm rounded-3xl overflow-hidden transition-all hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.1)] group">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground group-hover:text-rose-500 transition-colors">
                            <Target className="h-3 w-3" />
                            RISOLUTORE
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                        {topDecisive ? (
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-tight truncate text-foreground dark:text-white">
                                    {getPlayerName(topDecisive.playerId)}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-rose-500">{topDecisive.decisiveGoals}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Gol decisivi</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-muted-foreground/30">Nessun Goal</p>
                        )}
                    </CardContent>
                </Card>

                {/* 4. LOWEST LOSS RATE */}
                <Card className="bg-card dark:bg-black/40 border-border dark:border-brand-green/30 shadow-sm rounded-3xl overflow-hidden transition-all hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] group">
                    <CardHeader className="pb-1">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-muted-foreground group-hover:text-cyan-500 transition-colors">
                            <Users className="h-3 w-3" />
                            Amuleto Squadra
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                        {bestLossRatePlayer ? (
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase tracking-tight truncate text-foreground dark:text-white">
                                    {getPlayerName(bestLossRatePlayer.playerId)}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-cyan-500">{Math.round(bestLossRatePlayer.lossRate * 100)}%</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">% partite perse</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-muted-foreground/30">Poche gare</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
