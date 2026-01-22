"use client";

import { useStatsStore } from "@/store/useStatsStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function PlayerLeaderboard() {
  const { playerLeaderboard, loading } = useStatsStore();

  if (loading) {
    return <p>Caricamento...</p>
  }
  
  if (!playerLeaderboard || playerLeaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Nessun dato disponibile. Gioca qualche partita per vedere le statistiche.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard Giocatori</CardTitle>
        <CardDescription>
          Classifica dei giocatori basata sulle performance stagionali.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Giocatore</TableHead>
              <TableHead className="text-center">Presenze</TableHead>
              <TableHead className="text-center">Gol</TableHead>
              <TableHead className="text-center">Assist</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playerLeaderboard.map((player, index) => (
              <TableRow key={player.playerId}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell className="text-center">{player.stats.appearances}</TableCell>
                <TableCell className="text-center font-bold">{player.stats.goals}</TableCell>
                <TableCell className="text-center">{player.stats.assists}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
