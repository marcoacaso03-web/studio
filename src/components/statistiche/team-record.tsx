"use client";

import { useStatsStore } from "@/store/useStatsStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Goal, Handshake, Minus, Plus, ShieldAlert, ShieldOff, Swords } from "lucide-react";

function StatCard({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}


export function TeamRecord() {
    const { teamRecord } = useStatsStore();

    if (!teamRecord) {
        return <p>Nessun dato disponibile.</p>;
    }

    const goalDifference = teamRecord.goalsFor - teamRecord.goalsAgainst;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Record</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="text-2xl font-bold">{teamRecord.matchesPlayed} Partite Giocate</div>
                   <div className="flex items-center space-x-4 text-sm text-muted-foreground pt-2">
                       <div className="flex items-center"><Swords className="mr-1 h-4 w-4 text-green-500"/> V: {teamRecord.wins}</div>
                       <div className="flex items-center"><Handshake className="mr-1 h-4 w-4 text-yellow-500"/> P: {teamRecord.draws}</div>
                       <div className="flex items-center"><ShieldOff className="mr-1 h-4 w-4 text-red-500"/> S: {teamRecord.losses}</div>
                   </div>
                </CardContent>
            </Card>
            <StatCard title="Gol Fatti" value={teamRecord.goalsFor} icon={Goal} />
            <StatCard title="Gol Subiti" value={teamRecord.goalsAgainst} icon={ShieldAlert} />
            <StatCard 
                title="Differenza Reti" 
                value={`${goalDifference > 0 ? '+' : ''}${goalDifference}`} 
                icon={goalDifference >= 0 ? Plus : Minus} 
            />
        </div>
    );
}
