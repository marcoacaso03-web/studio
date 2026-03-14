
"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, Moon, Sun, Plus, CheckCircle2, History, AlertTriangle, RefreshCw, LogOut, User, Trash2, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { playerRepository } from '@/lib/repositories/player-repository';
import { matchRepository } from '@/lib/repositories/match-repository';
import { seasonRepository } from '@/lib/repositories/season-repository';
import { useThemeStore } from '@/store/useThemeStore';
import { useSeasonsStore } from '@/store/useSeasonsStore';
import { useMatchesStore } from '@/store/useMatchesStore';
import { usePlayersStore } from '@/store/usePlayersStore';
import { useStatsStore } from '@/store/useStatsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [isResetting, setIsResetting] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const [seasonToDelete, setSeasonToDelete] = useState<{id: string, name: string} | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { theme, toggleTheme } = useThemeStore();
  const { seasons, activeSeason, fetchAll: fetchSeasons, addSeason, setActiveSeason, removeSeason } = useSeasonsStore();
  const { defaultDuration, setDefaultDuration } = useSettingsStore();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchSeasons();
  }, [fetchSeasons]);

  const handleAddSeason = async () => {
    if (!newSeasonName.trim()) return;
    await addSeason(newSeasonName);
    setNewSeasonName('');
  };

  const handleSwitchSeason = async (id: string) => {
    await setActiveSeason(id);
    await Promise.all([
        useMatchesStore.getState().fetchAll(id),
        usePlayersStore.getState().fetchAll(id),
        useStatsStore.getState().loadStats()
    ]);
  };

  const handleDeleteSeason = async () => {
    if (!seasonToDelete) return;
    await removeSeason(seasonToDelete.id);
    setSeasonToDelete(null);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
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
    if (!user) return;
    setIsExporting(true);
    try {
      const players = await playerRepository.getAll(user.id, activeSeason?.id);
      const playersCSV = convertToCSV(players.map(({avatarUrl, imageHint, ...p}) => p));
      downloadCSV(playersCSV, `pitchman_players_${user.username}.csv`);
      
      const matches = await matchRepository.getAll(user.id, activeSeason?.id);
      const matchesCSV = convertToCSV(matches);
      downloadCSV(matchesCSV, `pitchman_matches_${user.username}.csv`);
    } catch (error) {
      toast({ variant: "destructive", title: "Esportazione fallita" });
    } finally {
      setIsExporting(false);
    }
  }

  const handleResetSeason = async () => {
    if (!user || !activeSeason) return;
    setIsResetting(true);
    try {
      // Recupera tutti i dati della stagione corrente
      const players = await playerRepository.getAll(user.id, activeSeason.id);
      const matches = await matchRepository.getAll(user.id, activeSeason.id);
      
      // Elimina tutti i giocatori e le partite (e le relative sotto-collezioni tramite repository)
      const deletePromises = [
        ...players.map(p => playerRepository.delete(p.id, activeSeason.id)),
        ...matches.map(m => matchRepository.delete(m.id, activeSeason.id))
      ];
      
      await Promise.all(deletePromises);
      
      // Rinfresca lo stato globale
      await Promise.all([
        useMatchesStore.getState().fetchAll(activeSeason.id),
        usePlayersStore.getState().fetchAll(activeSeason.id),
        useStatsStore.getState().loadStats()
      ]);

      toast({ 
        title: "Stagione Resettata", 
        description: `Tutti i dati della stagione ${activeSeason.name} sono stati eliminati.` 
      });
    } catch (e) {
      console.error("Reset error:", e);
      toast({ variant: "destructive", title: "Errore nel reset dei dati" });
    } finally {
      setIsResetting(false);
    }
  };

  if (!mounted) return null;

  // Genera un ID corto leggibile (username + prime 4 cifre del UID)
  const shortId = user ? `${user.username.toLowerCase()}${user.id.substring(0, 4)}` : '';

  return (
    <div className="pb-12 space-y-6">
      <PageHeader title="Impostazioni" />

      {/* Sezione Profilo Utente */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Account</CardTitle>
          </div>
          <CardDescription>
            Informazioni sull'utente attualmente collegato.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-black uppercase">
                {user?.username.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black uppercase tracking-tight">{user?.username}</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">ID: {shortId}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="border-destructive/30 text-destructive hover:bg-destructive/5 font-bold uppercase text-[10px]">
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Esci
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>Preferenze Gare</CardTitle>
          </div>
          <CardDescription>
            Configura i parametri predefiniti per le nuove partite.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
            <Label className="text-sm font-black uppercase tracking-tight">Durata Default</Label>
            <Select value={defaultDuration.toString()} onValueChange={(v) => setDefaultDuration(parseInt(v))}>
              <SelectTrigger className="w-32 h-9 text-xs font-bold uppercase">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="70">70 minuti</SelectItem>
                <SelectItem value="80">80 minuti</SelectItem>
                <SelectItem value="90">90 minuti</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
                  "flex items-center justify-between p-3 rounded-xl border transition-all",
                  s.isActive ? "bg-primary/5 border-primary shadow-sm" : "bg-muted/20 hover:bg-muted/40 cursor-pointer"
                )}
                onClick={() => !s.isActive && handleSwitchSeason(s.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className={cn("text-sm font-black uppercase tracking-tight", s.isActive ? "text-primary" : "text-muted-foreground")}>
                      Stagione {s.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-bold tracking-widest">{s.id}</span>
                  </div>
                  {s.isActive && (
                    <Badge className="text-[8px] bg-primary text-white font-black uppercase py-0 px-1.5">Attiva</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!s.isActive && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSeasonToDelete({ id: s.id, name: s.name });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                  {s.isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                  )}
                </div>
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
          <CardDescription>Azioni irreversibili sui dati della stagione attiva.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full font-black uppercase text-xs">
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Stagione
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="uppercase font-black">Resettare la stagione?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs leading-relaxed">
                  Questa azione cancellerà DEFINITIVAMENTE tutti i giocatori, le partite e le statistiche associate alla stagione <strong>{activeSeason?.name}</strong>. 
                  L'operazione non può essere annullata.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row gap-2 mt-4">
                <AlertDialogCancel className="flex-1 mt-0 rounded-xl font-bold text-xs" disabled={isResetting}>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetSeason} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl font-bold text-xs uppercase" disabled={isResetting}>
                  {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Conferma Reset"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <AlertDialog open={!!seasonToDelete} onOpenChange={(open) => !open && setSeasonToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-black">Elimina Stagione?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Questa azione cancellerà DEFINITIVAMENTE la stagione <strong>{seasonToDelete?.name}</strong> e tutti i relativi dati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-4">
            <AlertDialogCancel className="flex-1 mt-0 rounded-xl font-bold text-xs">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSeason} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl font-bold text-xs uppercase">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
