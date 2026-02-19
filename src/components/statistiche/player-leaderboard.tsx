
"use client";

import { useState, useMemo } from "react";
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
import { ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";

type SortKey = 'name' | 'appearances' | 'goals' | 'assists' | 'avgMinutes';
type SortOrder = 'asc' | 'desc' | null;

export function PlayerLeaderboard() {
  const { playerLeaderboard, loading } = useStatsStore();
  const [sortKey, setSortKey] = useState<SortKey>('goals');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedData = useMemo(() => {
    if (!sortKey || !sortOrder) return playerLeaderboard;

    return [...playerLeaderboard].sort((a, b) => {
      let aVal: any = a[sortKey as keyof typeof a] || 0;
      let bVal: any = b[sortKey as keyof typeof b] || 0;

      if (['appearances', 'goals', 'assists', 'avgMinutes'].includes(sortKey)) {
          aVal = a.stats[sortKey as keyof typeof a.stats];
          bVal = b.stats[sortKey as keyof typeof b.stats];
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [playerLeaderboard, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
        if (sortOrder === 'asc') setSortOrder('desc');
        else if (sortOrder === 'desc') setSortOrder(null);
        else setSortOrder('asc');
    } else {
        setSortKey(key);
        setSortOrder('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column || !sortOrder) return <ArrowUpDown className="ml-2 h-3 w-3 opacity-30" />;
    return sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4 text-primary" /> : <ChevronDown className="ml-2 h-4 w-4 text-primary" />;
  };

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
          Classifica stagionale. Clicca sui titoli per ordinare.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 md:p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center">Giocatore <SortIcon column="name" /></div>
                </TableHead>
                <TableHead className="text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('appearances')}>
                  <div className="flex items-center justify-center">Pres. <SortIcon column="appearances" /></div>
                </TableHead>
                <TableHead className="text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('avgMinutes')}>
                  <div className="flex items-center justify-center">Min/G <SortIcon column="avgMinutes" /></div>
                </TableHead>
                <TableHead className="text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('goals')}>
                  <div className="flex items-center justify-center">Gol <SortIcon column="goals" /></div>
                </TableHead>
                <TableHead className="text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSort('assists')}>
                  <div className="flex items-center justify-center">Ass. <SortIcon column="assists" /></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((player, index) => (
                <TableRow key={player.playerId}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium whitespace-nowrap">{player.name}</TableCell>
                  <TableCell className="text-center">{player.stats.appearances}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{player.stats.avgMinutes}&apos;</TableCell>
                  <TableCell className="text-center font-bold text-green-600">{player.stats.goals}</TableCell>
                  <TableCell className="text-center font-bold text-blue-600">{player.stats.assists}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
