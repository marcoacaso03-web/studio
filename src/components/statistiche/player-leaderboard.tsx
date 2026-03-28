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
    if (sortKey !== column || !sortOrder) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-20" />;
    return sortOrder === 'asc' ? <ChevronUp className="ml-1 h-3 w-3 text-brand-green" /> : <ChevronDown className="ml-1 h-3 w-3 text-brand-green" />;
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
    <Card className="bg-black/40 border-brand-green/30 shadow-[0_0_15px_rgba(172,229,4,0.05)] rounded-3xl overflow-hidden backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-black border border-brand-green flex items-center justify-center shadow-[0_0_10px_rgba(172,229,4,0.15)]">
            <Info className="h-5 w-5 text-brand-green" />
          </div>
          <div>
            <CardTitle className="text-lg font-black uppercase tracking-tight text-white">Rendimento Giocatori</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-wider">
              Statistiche individuali della stagione corrente.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-black/40 border-y border-white/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead 
                  className="cursor-pointer hover:bg-brand-green/5 transition-colors text-[10px] font-black uppercase tracking-widest px-6 text-muted-foreground" 
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">Giocatore <SortIcon column="name" /></div>
                </TableHead>
                <TableHead 
                  className="w-12 text-center cursor-pointer hover:bg-brand-green/5 transition-colors text-[10px] font-black uppercase tracking-widest px-2 text-muted-foreground" 
                  onClick={() => handleSort('appearances')}
                >
                  <div className="flex items-center justify-center">P <SortIcon column="appearances" /></div>
                </TableHead>
                <TableHead 
                  className="w-12 text-center cursor-pointer hover:bg-brand-green/5 transition-colors text-[10px] font-black uppercase tracking-widest px-2 text-muted-foreground" 
                  onClick={() => handleSort('goals')}
                >
                  <div className="flex items-center justify-center">G <SortIcon column="goals" /></div>
                </TableHead>
                <TableHead 
                  className="w-12 text-center cursor-pointer hover:bg-brand-green/5 transition-colors text-[10px] font-black uppercase tracking-widest px-2 text-muted-foreground" 
                  onClick={() => handleSort('assists')}
                >
                  <div className="flex items-center justify-center">A <SortIcon column="assists" /></div>
                </TableHead>
                <TableHead 
                  className="w-14 text-center cursor-pointer hover:bg-brand-green/5 transition-colors text-[10px] font-black uppercase tracking-widest px-2 text-muted-foreground" 
                  onClick={() => handleSort('yellowCards')}
                >
                  <div className="flex items-center justify-center">AMM <SortIcon column="yellowCards" /></div>
                </TableHead>
                <TableHead 
                  className="w-14 text-center cursor-pointer hover:bg-brand-green/5 transition-colors text-[10px] font-black uppercase tracking-widest px-2 text-muted-foreground" 
                  onClick={() => handleSort('redCards')}
                >
                  <div className="flex items-center justify-center">ESP <SortIcon column="redCards" /></div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((player) => (
                <TableRow key={player.playerId} className="h-14 hover:bg-brand-green/5 transition-all border-b border-white/5 last:border-none group">
                  <TableCell className="font-black whitespace-nowrap text-sm px-6 uppercase tracking-tight text-white group-hover:text-brand-green transition-colors">
                    {player.name}
                  </TableCell>
                  <TableCell className="text-center text-xs font-bold px-2 text-white/80">{player.stats.appearances}</TableCell>
                  <TableCell className="text-center font-black text-sm text-brand-green px-2">{player.stats.goals}</TableCell>
                  <TableCell className="text-center font-bold text-xs text-brand-green px-2">{player.stats.assists}</TableCell>
                  <TableCell className="text-center px-2">
                    <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded border border-brand-green/20 min-w-[28px] inline-block shadow-[0_0_8px_rgba(172,229,4,0.05)]">
                        {player.stats.yellowCards}
                    </span>
                  </TableCell>
                  <TableCell className="text-center px-2">
                    <span className="text-[10px] font-black bg-black text-white px-2 py-0.5 rounded border border-brand-green/20 min-w-[28px] inline-block shadow-[0_0_8px_rgba(172,229,4,0.05)]">
                        {player.stats.redCards}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="bg-black/20 p-4 border-t border-white/5">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-brand-green uppercase">P:</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Presenze</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-brand-green uppercase">G:</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Gol</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-brand-green uppercase">A:</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Assist</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-brand-green uppercase">AMM:</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Ammonizioni</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-brand-green uppercase">ESP:</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Espulsioni</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
