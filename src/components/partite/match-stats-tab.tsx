"use client";

import { useState, useEffect } from "react";
import type { Player } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PlayerStats = {
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
}

export function MatchStatsTab({ players }: { players: Player[] }) {
    const [playerStats, setPlayerStats] = useState<Record<string, PlayerStats>>({});

    useEffect(() => {
        const stats: Record<string, PlayerStats> = {};
        players.slice(0, 5).forEach(player => {
            stats[player.id] = {
                goals: Math.floor(Math.random() * 2),
                assists: Math.floor(Math.random() * 2),
                yellowCards: Math.random() > 0.8 ? 1 : 0,
                redCards: Math.random() > 0.95 ? 1 : 0,
            };
        });
        setPlayerStats(stats);
    }, [players]);


    return (
        <Card>
            <CardHeader>
              <CardTitle>Statistiche Partita</CardTitle>
              <CardDescription>Riepilogo delle performance individuali.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Giocatore</TableHead>
                    <TableHead className="text-center">Gol</TableHead>
                    <TableHead className="text-center">Assist</TableHead>
                    <TableHead className="text-center">Ammonizioni</TableHead>
                    <TableHead className="text-center">Espulsioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.slice(0, 5).map(player => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell className="text-center">{playerStats[player.id]?.goals ?? '-'}</TableCell>
                      <TableCell className="text-center">{playerStats[player.id]?.assists ?? '-'}</TableCell>
                      <TableCell className="text-center">{playerStats[player.id]?.yellowCards ?? '-'}</TableCell>
                      <TableCell className="text-center">{playerStats[player.id]?.redCards ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
    )
}
