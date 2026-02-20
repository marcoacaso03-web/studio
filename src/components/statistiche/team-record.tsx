"use client";

import { useStatsStore } from "@/store/useStatsStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Goal, ShieldAlert, Swords, TrendingUp, TrendingDown } from "lucide-react";

export function TeamRecord() {
    const { teamRecord } = useStatsStore();

    if (!teamRecord) {
        return <p className="text-center py-10 text-muted-foreground">Nessun dato disponibile.</p>;
    }

    const goalDifference = teamRecord.goalsFor - teamRecord.goalsAgainst;
    const total = teamRecord.matchesPlayed;

    const winPct = total > 0 ? Math.round((teamRecord.wins / total) * 100) : 0;
    const drawPct = total > 0 ? Math.round((teamRecord.draws / total) * 100) : 0;
    const lossPct = total > 0 ? Math.round((teamRecord.losses / total) * 100) : 0;

    return (
        <div className="grid gap-4 md:grid-cols-2">
             {/* Card Record Partite */}
             <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Swords className="h-4 w-4 text-primary" />
                        Andamento Stagione
                    </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="text-3xl font-black text-primary mb-4">{teamRecord.matchesPlayed} <span className="text-sm font-normal text-muted-foreground">Gare totali</span></div>
                   <div className="grid grid-cols-3 gap-2">
                       <div className="flex flex-col items-center p-2 bg-primary/10 rounded-lg border border-primary/20">
                           <span className="text-[9px] font-black text-primary uppercase tracking-tighter mb-1">VITTORIA</span>
                           <div className="flex items-baseline gap-0.5">
                               <span className="text-xl font-black text-primary">{teamRecord.wins}</span>
                               <span className="text-[10px] font-bold text-primary/70">({winPct}%)</span>
                           </div>
                       </div>
                       <div className="flex flex-col items-center p-2 bg-muted/40 rounded-lg border border-muted">
                           <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter mb-1">PAREGGIO</span>
                           <div className="flex items-baseline gap-0.5">
                               <span className="text-xl font-black text-muted-foreground">{teamRecord.draws}</span>
                               <span className="text-[10px] font-bold text-muted-foreground/70">({drawPct}%)</span>
                           </div>
                       </div>
                       <div className="flex flex-col items-center p-2 bg-accent/10 rounded-lg border border-accent/20">
                           <span className="text-[9px] font-black text-accent uppercase tracking-tighter mb-1">SCONFITTA</span>
                           <div className="flex items-baseline gap-0.5">
                               <span className="text-xl font-black text-accent">{teamRecord.losses}</span>
                               <span className="text-[10px] font-bold text-accent/70">({lossPct}%)</span>
                           </div>
                       </div>
                   </div>
                </CardContent>
            </Card>

            {/* Card Bilancio Reti */}
            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Goal className="h-4 w-4 text-accent" />
                        Bilancio Reti
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between mb-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Differenza Reti</p>
                            <div className="flex items-center gap-2">
                                <span className={`text-4xl font-black ${goalDifference > 0 ? 'text-primary' : goalDifference < 0 ? 'text-accent' : 'text-primary'}`}>
                                    {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
                                </span>
                                {goalDifference > 0 ? <TrendingUp className="h-6 w-6 text-primary" /> : goalDifference < 0 ? <TrendingDown className="h-6 w-6 text-accent" /> : null}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Goal className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Gol Fatti</p>
                                <p className="text-xl font-black text-foreground">{teamRecord.goalsFor}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-accent/10 rounded-full">
                                <ShieldAlert className="h-4 w-4 text-accent" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Gol Subiti</p>
                                <p className="text-xl font-black text-foreground">{teamRecord.goalsAgainst}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
