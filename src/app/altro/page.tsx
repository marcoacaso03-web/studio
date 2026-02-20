"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, Moon, Sun, Plus, CheckCircle2, History, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { playerRepository } from '@/lib/repositories/player-repository';
import { matchRepository } from '@/lib/repositories/match-repository';
import { statsRepository } from '@/lib/repositories/stats-repository';
import { useThemeStore } from '@/store/useThemeStore';
import { useSeasonsStore } from '@/store/useSeasonsStore';
import { useMatchesStore } from '@/store/useMatchesStore';
import { usePlayersStore } from '@/store/usePlayersStore';
import { useStatsStore } from '@/store/useStatsStore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { db } from '@/lib/db';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AltroPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const { toast } = useToast();
  const { theme, toggleTheme } = useThemeStore();
  const { seasons, fetchAll: fetchSeasons, addSeason, setActiveSeason } = useSeasonsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchSeasons();
  }, [fetchSeasons]);

  const handleAddSeason = async () => {
    if (!newSeasonName.trim()) return;
    await addSeason(newSeasonName);
    setNewSeasonName('');
    toast({ title: "Stagione creata", description: `La stagione ${newSeasonName} è stata aggiunta all'archivio.` });
  };

  const handleSwitchSeason = async (id: string, name: string) => {
    await setActiveSeason(id);
    await Promise.all([
        useMatchesStore.getState().fetchAll(id),
        usePlayersStore.getState().fetchAll(id),
        useStatsStore.getState().loadStats()
    ]);
    toast({ title: "Cambio Stagione", description: `Ora stai visualizzando i dati della stagione ${name}.` });
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    const flattenedData = data.map(item => {
        const flatItem: {[key: string]: any} = {};
        for (const key in item) {
            if (typeof item[key] === 'object' && item[key] !== null && !Array.isArray(item[key])) {
                for (const subKey in item[key]) {
                    flatItem[`${key}_${subKey}`] = item[key][subKey];
                }
            } else {
                flatItem[key] = item[key];
            }
        }
        return flatItem;
    });
    const headers = Object.keys(flattenedData[0]);
    const csvRows = [headers.join(',')];
    for (const row of flattenedData) {
        const values = headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) value = '';
            else if (typeof value === 'string') value = `"${value.replace(/"/g, '""')}"`;
            return value;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  }

  const downloadCSV = (csvString: string, filename: string) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const players = await playerRepository.getAll();
      const playersCSV = convertToCSV(players.map(({avatarUrl, imageHint, ...p}) => p));
      downloadCSV(playersCSV, 'pitchman_players.csv');
      
      const matches = await matchRepository.getAll();
      const matchesCSV = convertToCSV(matches);
      downloadCSV(matchesCSV, 'pitchman_matches.csv');
      
      const playerMatchStats = await statsRepository.getAll();
      const playerMatchStatsCSV = convertToCSV(playerMatchStats);
      downloadCSV(playerMatchStatsCSV, 'pitchman_player_match_stats.csv');
      
      toast({ title: "Esportazione completata", description: "I file CSV sono stati scaricati." });
    } catch (error) {
      toast({ variant: "destructive", title: "Esportazione fallita" });
    } finally {
      setIsExporting(false);
    }
  }

  const handleFullReset = async () => {
    try {
      await db.delete();
      window.location.reload();
    } catch (e) {
      toast({ variant: "destructive", title: "Errore nel reset" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="pb-12 space-y-6">
      <PageHeader title="Impostazioni" />
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Archivio Stagioni</CardTitle>
          </div>
          <CardDescription>
            Gestisci le stagioni sportive. I dati sono isolati per ogni annata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Input 
              placeholder="Es: 2025/26" 
              value={newSeasonName} 
              onChange={(e) => setNewSeasonName(e.target.value)}
              className="font-bold uppercase text-xs"
            />
            <Button onClick={handleAddSeason} className="bg-accent text-accent-foreground">
              <Plus className="h-4 w-4 mr-1" /> Crea
            </Button>
          </div>
          <div className="space-y-2">
            {seasons.map((s) => (
              <div 
                key={s.id} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                  s.isActive ? "bg-primary/5 border-primary shadow-sm" : "bg-muted/20 hover:bg-muted/40"
                )}
                onClick={() => !s.isActive && handleSwitchSeason(s.id, s.name)}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("text-sm font-black uppercase tracking-tight", s.isActive ? "text-primary" : "text-muted-foreground")}>
                    Stagione {s.name}
                  </span>
                  {s.isActive && (
                    <Badge className="text-[8px] bg-primary text-white font-black uppercase py-0 px-1.5">Attiva</Badge>
                  )}
                </div>
                {s.isActive ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aspetto</CardTitle>
          <CardDescription>Scegli il tema dell&apos;applicazione.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-accent" />}
              <Label htmlFor="theme-switch" className="text-sm font-black uppercase tracking-tight">Modalità Notte</Label>
            </div>
            <Switch id="theme-switch" checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Esporta Dati</CardTitle>
          <CardDescription>Scarica i backup in formato CSV.</CardDescription>
        </CardHeader>
        <CardContent>
           <Button onClick={handleExport} disabled={isExporting} className="w-full font-black uppercase text-xs">
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Esportazione..." : "Esporta tutto (CSV)"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>Zona Pericolo</CardTitle>
          </div>
          <CardDescription>Azioni irreversibili sul database locale.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full font-black uppercase text-xs">
                <RefreshCw className="mr-2 h-4 w-4" />
                Resetta Applicazione
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="uppercase font-black">Sei assolutamente sicuro?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs">
                  Questa azione cancellerà DEFINITIVAMENTE tutti i giocatori, le partite, le stagioni e le statistiche salvate su questo dispositivo. Non è possibile annullare l&apos;operazione.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row gap-2 mt-4">
                <AlertDialogCancel className="flex-1 mt-0 rounded-xl font-bold text-xs">Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={handleFullReset} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl font-bold text-xs uppercase">
                  Resetta Tutto
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
