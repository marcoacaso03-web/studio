
"use client";

import { useState, useEffect } from "react";
import type { PlayerMatchStats } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMatchDetailStore } from "@/store/useMatchDetailStore";

export function MatchStatsTab() {
    const { stats: storeStats, allPlayers, saveAllStats } = useMatchDetailStore();
    const [localStats, setLocalStats] = useState<PlayerMatchStats[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        setLocalStats(storeStats);
    }, [storeStats]);

    const handleStatChange = (playerId: string, field: keyof Omit<PlayerMatchStats, 'matchId' | 'playerId'>, value: string) => {
        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue) || numericValue < 0) return;

        setLocalStats(prevStats => 
            prevStats.map(stat => 
                stat.playerId === playerId ? { ...stat, [field]: numericValue } : stat
            )
        );
    }
    
    const handleSaveStats = () => {
        saveAllStats(localStats);
        toast({ title: "Statistiche salvate", description: "Le statistiche individuali sono state aggiornate." });
    };
    
    if (localStats.length === 0) {
        return (
             <Card>
                <CardHeader>
                <CardTitle>Statistiche Individuali</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Nessun giocatore in formazione. Inserisci la formazione per abilitare le statistiche.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle>Performance Individuali</CardTitle>
                    <CardDescription>Minutaggio e altri dati della gara.</CardDescription>
                </div>
                <Button onClick={handleSaveStats}>Salva Dati</Button>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="min-w-[120px]">Giocatore</TableHead>
                        <TableHead className="text-center w-24">Minuti</TableHead>
                        <TableHead className="text-center w-24">Gol</TableHead>
                        <TableHead className="text-center w-24">Ass.</TableHead>
                        <TableHead className="text-center w-20">Amm.</TableHead>
                        <TableHead className="text-center w-20">Esp.</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {localStats.map(stat => {
                        const player = allPlayers.find(p => p.id === stat.playerId);
                        if (!player) return null;
                        
                        return (
                            <TableRow key={stat.playerId}>
                                <TableCell className="font-medium whitespace-nowrap">{player.name}</TableCell>
                                <TableCell>
                                    <Input 
                                        type="number" 
                                        className="text-center h-8" 
                                        value={stat.minutesPlayed} 
                                        onChange={(e) => handleStatChange(stat.playerId, 'minutesPlayed', e.target.value)}
                                        min={0} max={120}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input 
                                        type="number" 
                                        className="text-center h-8" 
                                        value={stat.goals} 
                                        onChange={(e) => handleStatChange(stat.playerId, 'goals', e.target.value)}
                                        min={0}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input 
                                        type="number" 
                                        className="text-center h-8" 
                                        value={stat.assists}
                                        onChange={(e) => handleStatChange(stat.playerId, 'assists', e.target.value)}
                                        min={0}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input 
                                        type="number" 
                                        className="text-center h-8" 
                                        value={stat.yellowCards} 
                                        onChange={(e) => handleStatChange(stat.playerId, 'yellowCards', e.target.value)}
                                        min={0} max={2}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input 
                                        type="number" 
                                        className="text-center h-8" 
                                        value={stat.redCards} 
                                        onChange={(e) => handleStatChange(stat.playerId, 'redCards', e.target.value)}
                                        min={0} max={1}
                                    />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                    </TableBody>
                </Table>
              </div>
            </CardContent>
        </Card>
    )
}
