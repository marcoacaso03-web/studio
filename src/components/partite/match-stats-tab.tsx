"use client";

import { useState, useEffect } from "react";
import type { PlayerMatchStats } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
        toast({ title: "Statistiche salvate", description: "Le statistiche della partita sono state aggiornate." });
    };
    
    const statPlayers = allPlayers.filter(p => localStats.some(s => s.playerId === p.id));

    if (statPlayers.length === 0) {
        return (
             <Card>
                <CardHeader>
                <CardTitle>Statistiche Partita</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Nessun giocatore contrassegnato come 'presente'. Seleziona i convocati nella scheda 'Convocati' per inserire le statistiche.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Statistiche Partita</CardTitle>
                    <CardDescription>Inserisci le performance individuali dei giocatori presenti.</CardDescription>
                </div>
                <Button onClick={handleSaveStats}>Salva Statistiche</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Giocatore</TableHead>
                    <TableHead className="text-center w-24">Gol</TableHead>
                    <TableHead className="text-center w-24">Assist</TableHead>
                    <TableHead className="text-center w-24">Gialli</TableHead>
                    <TableHead className="text-center w-24">Rossi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {localStats.map(stat => {
                    const player = allPlayers.find(p => p.id === stat.playerId);
                    if (!player) return null;
                    
                    return (
                        <TableRow key={stat.playerId}>
                            <TableCell className="font-medium">{player.name}</TableCell>
                            <TableCell>
                                <Input 
                                    type="number" 
                                    className="text-center" 
                                    value={stat.goals} 
                                    onChange={(e) => handleStatChange(stat.playerId, 'goals', e.target.value)}
                                    min={0}
                                />
                            </TableCell>
                            <TableCell>
                                <Input 
                                    type="number" 
                                    className="text-center" 
                                    value={stat.assists}
                                    onChange={(e) => handleStatChange(stat.playerId, 'assists', e.target.value)}
                                    min={0}
                                />
                            </TableCell>
                            <TableCell>
                                <Input 
                                    type="number" 
                                    className="text-center" 
                                    value={stat.yellowCards} 
                                    onChange={(e) => handleStatChange(stat.playerId, 'yellowCards', e.target.value)}
                                    min={0} max={2}
                                />
                            </TableCell>
                            <TableCell>
                                <Input 
                                    type="number" 
                                    className="text-center" 
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
            </CardContent>
        </Card>
    )
}
