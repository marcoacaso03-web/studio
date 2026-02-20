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

type SortKey = 'name' | 'appearances' | 'goals' | 'assists' | 'avgMinutes' | 'yellowCards' | 'redCards';
type SortOrder = 'asc' | 'desc' | null;

export function PlayerLeaderboard() {
  const { playerLeaderboard, loading } = useStatsStore();
  const [sortKey, setSortKey] = useState<SortKey>('goals');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const sortedData = useMemo(() => {
    if (!sortKey || !sortOrder) return playerLeaderboard;

    return [...playerLeaderboard].sort((a, b) => {
      let aVal: any = 0;
      let bVal: any = 0;

      if (sortKey === 'name') {
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
      } else {
        aVal = a.stats[sortKey as keyof typeof a.stats] || 0;
        bVal = b.stats[sortKey as keyof typeof b.stats] || 0;
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
    if (sortKey !== column || !sortOrder) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-30" />;
    return sortOrder === 'asc' ? <ChevronUp className="ml-1 h-3 w-3 text-primary" /> : <ChevronDown className="ml-1 h-3 w-3 text-primary" />;
  };

  if (loading) {
    return <p className="p-4 text-center">Caricamento...</p>
  }
  
  if (!playerLeaderboard || playerLeaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Classifica Giocatori</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-10">Nessun dato disponibile. Gioca qualche partita per vedere le statistiche.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classifica Giocatori</CardTitle>
        <CardDescription>
          Rendimento stagionale. Clicca sulle intestazioni per ordinare.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40px] text-[10px] font-bold uppercase text-center">#</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 transition-colors text-[10px] font-bold uppercase" 
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">Giocatore <SortIcon column="name" /></div>
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer hover:bg-muted/50 transition-colors text-[10px] font-bold uppercase" 
                  onClick={() => handleSort('appearances')}
                >
                  <div className="flex items-center justify-center">Pres. <SortIcon column="appearances" /></div>
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer hover:bg-muted/50 transition-colors text-[10px] font-bold uppercase" 
                  onClick={() => handleSort('goals')}
                >
                  <div className="flex items-center justify-center">Gol <SortIcon column="goals" /></div>
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer hover:bg-muted/50 transition-colors text-[10px] font-bold uppercase" 
                  onClick={() => handleSort('assists')}
                >
                  <div className="flex items-center justify-center">Ass. <SortIcon column="assists" /></div>
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer hover:bg-muted/50 transition-colors text-[10px] font-bold uppercase" 
                  onClick={() => handleSort('yellowCards')}
                >
                  <div className="flex items-center justify-center">Amm. <SortIcon column="yellowCards" /></div>
                </TableHead>
                <TableHead 
                  className="text-center cursor-pointer hover:bg-muted/50 transition-colors text-[10px] font-bold uppercase" 
                  onClick={() => handleSort('redCards')}
                >
                  <div className="flex items-center justify-center">Esp. <SortIcon column="redCards" /></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((player, index) => (
                <TableRow key={player.playerId} className="h-12">
                  <TableCell className="text-center text-xs font-bold text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-bold whitespace-nowrap text-sm">{player.name}</TableCell>
                  <TableCell className="text-center text-xs">{player.stats.appearances}</TableCell>
                  <TableCell className="text-center font-black text-sm text-primary">{player.stats.goals}</TableCell>
                  <TableCell className="text-center font-bold text-xs text-blue-500">{player.stats.assists}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-[10px] font-bold bg-yellow-400/20 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-400/30">
                        {player.stats.yellowCards}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-[10px] font-bold bg-red-500/20 text-red-700 px-1.5 py-0.5 rounded border border-red-500/30">
                        {player.stats.redCards}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
