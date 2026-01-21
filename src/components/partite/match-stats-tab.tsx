"use client";

import { useState, useEffect } from "react";
import type { Player, PlayerMatchStats } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatsForMatch, getPlayers, updatePlayerStatsForMatch } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";

interface MatchStatsTabProps {
    matchId: string;
}

export function MatchStatsTab({ matchId }: MatchStatsTabProps) {
    const [stats, setStats] = useState<PlayerMatchStats[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const allPlayers = getPlayers();
        const matchStats = getStatsForMatch(matchId);
        
        const attendedPlayerIds = new Set(matchStats.map(s => s.playerId));
        const attendedPlayers = allPlayers.filter(p => attendedPlayerIds.has(p.id));

        setPlayers(attendedPlayers);
        setStats(matchStats);
    }, [matchId]);

    const handleStatChange = (playerId: string, field: keyof Omit<PlayerMatchStats, 'matchId' | 'playerId'>, value: string) => {
        const numericValue = parseInt(value, 10);
        if (isNaN(numericValue) || numericValue < 0) return;

        setStats(prevStats => 
            prevStats.map(stat => 
                stat.playerId === playerId ? { ...stat, [field]: numericValue } : stat
            )
        );
    }
    
    const handleSaveStats = () => {
        stats.forEach(stat => {
            updatePlayerStatsForMatch(matchId, stat.playerId, {
                goals: stat.goals,
                assists: stat.assists,
                yellowCards: stat.yellowCards,
                redCards: stat.redCards,
            });
        });
        toast({ title: "Statistiche salvate", description: "Le statistiche della partita sono state aggiornate." });
    };

    if (players.length === 0) {
        return (
             <Card>
                <CardHeader>
                <CardTitle>Statistiche Partita</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Nessun giocatore presente per inserire le statistiche. Seleziona i convocati nella scheda 'Convocati'.</p>
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
                  {stats.map(stat => {
                    const player = players.find(p => p.id === stat.playerId);
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
