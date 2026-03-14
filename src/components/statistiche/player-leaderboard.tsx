"use client";

import { useState, useMemo } from "react";
import { useStatsStore } from "@/store/useStatsStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown, ArrowUpDown, Info } from "lucide-react";

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
          <CardTitle>Giocatori</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-10">Nessun dato disponibile. Gioca qualche partita per vedere le statistiche.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl overflow-hidden shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <CardTitle className="text-lg font-black uppercase tracking-tight">Rendimento Giocatori</CardTitle>
        </div>
        <CardDescription className="text-xs font-bold uppercase text-muted-foreground/60">
          Statistiche individuali della stagione corrente.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 transition-colors text-[10px] font-black uppercase tracking-widest px-6" 
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">Giocatore <SortIcon column="name" /></div>
                </TableHead>
                <TableHead 
                  className="w-12 text-center cursor-pointer hover:bg-muted/50 transition-colors text-[10px] font-black uppercase tracking-widest px-2" 
                  onClick={() => handleSort('appearances')}
                >
                  <div className="flex items-center justify-center">P <SortIcon column="appearances" /></div>
                </TableHead>
                <TableHead 
                  className="w-12 text-center cursor-pointer hover:bg-muted/50 transition-colors text-[10px] font-black uppercase tracking-widest px-2" 
                  onClick={() => handleSort('goals')}
                >
                  <div className="flex items-center justify-center">G <SortIcon column="goals" /></div>
                </TableHead>
                <TableHead 
                  className="w-12 text-center cursor-pointer hover:bg-muted/50 transition-colors text-[10px] font-black uppercase tracking-widest px-2" 
                  onClick={() => handleSort('assists')}
                >
                  <div className="flex items-center justify-center">A <SortIcon column="assists" /></div>
                </TableHead>
                <TableHead 
                  className="w-14 text-center cursor-pointer hover:bg-muted/50 transition-colors text-[10px] font-black uppercase tracking-widest px-2" 
                  onClick={() => handleSort('yellowCards')}
                >
                  <div className="flex items-center justify-center">AMM <SortIcon column="yellowCards" /></div>
                </TableHead>
                <TableHead 
                  className="w-14 text-center cursor-pointer hover:bg-muted/50 transition-colors text-[10px] font-black uppercase tracking-widest px-2" 
                  onClick={() => handleSort('redCards')}
                >
                  <div className="flex items-center justify-center">ESP <SortIcon column="redCards" /></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((player) => (
                <TableRow key={player.playerId} className="h-12 hover:bg-primary/5 transition-all">
                  <TableCell className="font-black whitespace-nowrap text-sm px-6 uppercase tracking-tight text-primary">
                    {player.name}
                  </TableCell>
                  <TableCell className="text-center text-xs font-bold px-2">{player.stats.appearances}</TableCell>
                  <TableCell className="text-center font-black text-sm text-primary px-2">{player.stats.goals}</TableCell>
                  <TableCell className="text-center font-bold text-xs text-blue-500 px-2">{player.stats.assists}</TableCell>
                  <TableCell className="text-center px-2">
                    <span className="text-[10px] font-black bg-yellow-400/10 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-400/20 min-w-[24px] inline-block">
                        {player.stats.yellowCards}
                    </span>
                  </TableCell>
                  <TableCell className="text-center px-2">
                    <span className="text-[10px] font-black bg-red-500/10 text-red-700 px-1.5 py-0.5 rounded border border-red-500/20 min-w-[24px] inline-block">
                        {player.stats.redCards}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/10 p-4 border-t">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-muted-foreground uppercase">P:</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">Presenze</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-muted-foreground uppercase">G:</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">Gol</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-muted-foreground uppercase">A:</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">Assist</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-muted-foreground uppercase">AMM:</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">Ammonizioni</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-muted-foreground uppercase">ESP:</span>
            <span className="text-[10px] font-bold uppercase tracking-tight">Espulsioni</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
