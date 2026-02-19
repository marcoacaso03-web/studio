
"use client";

import { useStatsStore } from "@/store/useStatsStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Goal, Handshake, ShieldAlert, Swords, TrendingUp, TrendingDown } from "lucide-react";

export function TeamRecord() {
    const { teamRecord } = useStatsStore();

    if (!teamRecord) {
        return <p className="text-center py-10 text-muted-foreground">Nessun dato disponibile.</p>;
    }

    const goalDifference = teamRecord.goalsFor - teamRecord.goalsAgainst;

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
                       <div className="flex flex-col items-center p-2 bg-green-50 rounded-lg border border-green-100">
                           <span className="text-[10px] font-bold text-green-700 uppercase">Vinte</span>
                           <span className="text-xl font-black text-green-600">{teamRecord.wins}</span>
                       </div>
                       <div className="flex flex-col items-center p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                           <span className="text-[10px] font-bold text-yellow-700 uppercase">Pari</span>
                           <span className="text-xl font-black text-yellow-600">{teamRecord.draws}</span>
                       </div>
                       <div className="flex flex-col items-center p-2 bg-red-50 rounded-lg border border-red-100">
                           <span className="text-[10px] font-bold text-red-700 uppercase">Perse</span>
                           <span className="text-xl font-black text-red-600">{teamRecord.losses}</span>
                       </div>
                   </div>
                </CardContent>
            </Card>

            {/* Card Bilancio Reti (Accorpata) */}
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
                                <span className={`text-4xl font-black ${goalDifference > 0 ? 'text-green-600' : goalDifference < 0 ? 'text-red-600' : 'text-primary'}`}>
                                    {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
                                </span>
                                {goalDifference > 0 ? <TrendingUp className="h-6 w-6 text-green-500" /> : goalDifference < 0 ? <TrendingDown className="h-6 w-6 text-red-500" /> : null}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-green-100 rounded-full">
                                <Goal className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Gol Fatti</p>
                                <p className="text-xl font-black text-foreground">{teamRecord.goalsFor}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-red-100 rounded-full">
                                <ShieldAlert className="h-4 w-4 text-red-600" />
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
