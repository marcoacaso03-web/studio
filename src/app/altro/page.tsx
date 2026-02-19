"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, Moon, Sun, Plus, CheckCircle2, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { playerRepository } from '@/lib/repositories/player-repository';
import { matchRepository } from '@/lib/repositories/match-repository';
import { statsRepository } from '@/lib/repositories/stats-repository';
import { useThemeStore } from '@/store/useThemeStore';
import { useSeasonsStore } from '@/store/useSeasonsStore';
import { useMatchesStore } from '@/store/useMatchesStore';
import { useStatsStore } from '@/store/useStatsStore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function AltroPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const { toast } = useToast();
  const { theme, toggleTheme } = useThemeStore();
  const { seasons, activeSeason, fetchAll: fetchSeasons, addSeason, setActiveSeason } = useSeasonsStore();
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
    useMatchesStore.getState().fetchAll();
    useStatsStore.getState().loadStats();
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
            if (value === null || value === undefined) {
                value = '';
            } else if (typeof value === 'string') {
                value = `"${value.replace(/"/g, '""')}"`;
            }
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
      
      toast({
        title: "Esportazione completata",
        description: "I file CSV sono stati scaricati.",
      });

    } catch (error) {
      console.error("Export failed:", error);
      toast({
        variant: "destructive",
        title: "Esportazione fallita",
        description: "Non è stato possibile esportare i dati.",
      });
    } finally {
      setIsExporting(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="pb-8">
      <PageHeader title="Impostazioni" />
      <div className="space-y-6">
        
        {/* Gestione Stagioni */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle>Archivio Stagioni</CardTitle>
            </div>
            <CardDescription>
              Gestisci le tue stagioni sportive. I dati di ogni stagione sono isolati.
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
            <CardDescription>
              Scegli tra il tema chiaro per l'uso diurno o scuro per le sessioni serali.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-accent" />}
                <div className="space-y-0.5">
                  <Label htmlFor="theme-switch" className="text-sm font-black uppercase tracking-tight">Modalità Notte</Label>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Ottimizzata per l'uso serale</p>
                </div>
              </div>
              <Switch 
                id="theme-switch" 
                checked={theme === 'dark'} 
                onCheckedChange={toggleTheme} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Esporta Dati</CardTitle>
            <CardDescription>
              Scarica tutti i dati dell'applicazione in formato CSV per backup o analisi esterne.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">Verranno generati 3 file:</p>
            <ul className="mb-6 list-disc list-inside text-sm space-y-1">
              <li><code className="font-mono bg-muted px-1 py-0.5 rounded">pitchman_players.csv</code></li>
              <li><code className="font-mono bg-muted px-1 py-0.5 rounded">pitchman_matches.csv</code></li>
              <li><code className="font-mono bg-muted px-1 py-0.5 rounded">pitchman_player_match_stats.csv</code></li>
            </ul>
             <Button onClick={handleExport} disabled={isExporting} className="w-full md:w-auto font-black uppercase text-xs">
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Esportazione in corso..." : "Esporta tutti i dati"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
