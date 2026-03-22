"use client";

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, Moon, Sun, Plus, CheckCircle2, History, AlertTriangle, RefreshCw, LogOut, User, Trash2, Clock, Dumbbell, Loader2, Bell, Shield, ChevronRight, Shirt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { playerRepository } from '@/lib/repositories/player-repository';
import { matchRepository } from '@/lib/repositories/match-repository';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AltroPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const [seasonToDelete, setSeasonToDelete] = useState<{id: string, name: string} | null>(null);
  
  // Dialog states
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSquadraOpen, setIsSquadraOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const { theme, toggleTheme } = useThemeStore();
  const { seasons, activeSeason, fetchAll: fetchSeasons, addSeason, setActiveSeason, removeSeason } = useSeasonsStore();
  const { defaultDuration, setDefaultDuration, sessionsPerWeek, setSessionsPerWeek } = useSettingsStore();
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
    if (!user || !activeSeason) {
      toast({ variant: "destructive", title: "Nessuna stagione attiva", description: "Seleziona una stagione prima di esportare." });
      return;
    }
    setIsExporting(true);
    try {
      const players = await playerRepository.getAll(user.id, activeSeason.id);
      const playersCSV = convertToCSV(players);
      downloadCSV(playersCSV, `pitchman_players_${user.username}.csv`);
      
      const matches = await matchRepository.getAll(user.id, activeSeason.id);
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
      const players = await playerRepository.getAll(user.id, activeSeason.id);
      const matches = await matchRepository.getAll(user.id, activeSeason.id);
      
      const deletePromises = [
        ...players.map(p => playerRepository.delete(p.id, activeSeason.id)),
        ...matches.map(m => matchRepository.delete(m.id, activeSeason.id))
      ];
      
      await Promise.all(deletePromises);
      
      await Promise.all([
        useMatchesStore.getState().fetchAll(activeSeason.id),
        usePlayersStore.getState().fetchAll(activeSeason.id),
        useStatsStore.getState().loadStats()
      ]);

      toast({ 
        title: "Stagione Resettata", 
        description: `Tutti i dati della stagione ${activeSeason.name} sono stati eliminati.` 
      });
      setIsPrivacyOpen(false);
    } catch (e) {
      console.error("Reset error:", e);
      toast({ variant: "destructive", title: "Errore nel reset dei dati" });
    } finally {
      setIsResetting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="pb-24 pt-4 space-y-6">
      <div className="flex items-center gap-2 px-4 mb-2">
        <h1 className="text-2xl font-black text-foreground px-2">Impostazioni</h1>
      </div>

      <div className="flex flex-col space-y-3 px-2">
        {/* Accordion/Menu Items in the style of the screenshot */}
        
        {/* Profilo Allenatore */}
        <div 
          onClick={() => setIsAccountOpen(true)}
          className="flex items-center gap-4 bg-card border-border border border-white/5 rounded-3xl p-3 cursor-pointer hover:bg-card/20 hover:bg-card/30 transition-all shadow-lg active:scale-[0.98]"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-yellow to-brand-green flex items-center justify-center glow-yellow shadow-inner">
            <User className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-foreground font-bold text-lg tracking-wide">Profilo Allenatore</span>
            <span className="text-muted-foreground/60 text-sm">Dettagli account</span>
          </div>
        </div>

        {/* Gestione Squadra (Archivio Stagioni & Allenamenti come richiesto) */}
        <div 
          onClick={() => setIsSquadraOpen(true)}
          className="flex items-center gap-4 bg-card border-border border border-white/5 rounded-3xl p-3 cursor-pointer hover:bg-card/20 hover:bg-card/30 transition-all shadow-lg active:scale-[0.98]"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-green to-brand-cyan flex items-center justify-center glow-neon shadow-inner">
            <Shirt className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-foreground font-bold text-lg tracking-wide">Gestione Squadra</span>
            <span className="text-muted-foreground/60 text-sm">Archivio Stagioni, Allenamenti settimanali</span>
          </div>
        </div>

        {/* Notifiche */}
        <div 
          onClick={() => toast({ title: "Presto disponibile", description: "Le notifiche push arriveranno in futuro."})}
          className="flex items-center gap-4 bg-card border-border border border-white/5 rounded-3xl p-3 cursor-pointer hover:bg-card/20 hover:bg-card/30 transition-all shadow-lg active:scale-[0.98]"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-cyan flex items-center justify-center glow-text-cyan shadow-inner">
            <Bell className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-foreground font-bold text-lg tracking-wide">Notifiche</span>
            <span className="text-muted-foreground/60 text-sm">Preferenze push</span>
          </div>
        </div>

        {/* Tema */}
        <div 
          className="flex items-center gap-4 bg-card border-border border border-white/5 rounded-3xl p-3 shadow-lg"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-green to-brand-yellow flex items-center justify-center glow-icon-green shadow-inner">
            <Moon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-foreground font-bold text-lg tracking-wide">Tema</span>
            <span className="text-muted-foreground/60 text-sm">Chiaro/Scuro</span>
          </div>
          <div className="bg-[#1e293b] rounded-full flex items-center p-1 mr-2 shadow-inner">
             {/* Un toggle visivo custom che mimi quello nel mockup */}
             <div 
               className={cn("px-4 py-1.5 rounded-full flex items-center justify-center cursor-pointer transition-all", theme !== 'dark' ? "bg-card/40 hover:bg-card/50 text-foreground" : "text-foreground/50")}
               onClick={() => theme === 'dark' && toggleTheme()}
             >
               <Sun className="h-4 w-4" />
             </div>
             <div 
               className={cn("px-4 py-1.5 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition-all", theme === 'dark' ? "bg-[#c0ff00] text-primary-foreground shadow-[0_0_15px_rgba(192,255,0,0.5)]" : "text-foreground/50")}
               onClick={() => theme !== 'dark' && toggleTheme()}
             >
               Scuro
             </div>
          </div>
        </div>

        {/* Privacy & Sicurezza */}
        <div 
          onClick={() => setIsPrivacyOpen(true)}
          className="flex items-center gap-4 bg-card border-border border border-white/5 rounded-3xl p-3 cursor-pointer hover:bg-card/20 hover:bg-card/30 transition-all shadow-lg active:scale-[0.98]"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-yellow to-[#f87171] flex items-center justify-center glow-yellow shadow-inner">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-foreground font-bold text-lg tracking-wide">Privacy & Sicurezza</span>
            <span className="text-muted-foreground/60 text-sm">Permessi, Dati</span>
          </div>
        </div>

        {/* Logout */}
        <div 
          onClick={handleLogout}
          className="flex items-center gap-3 bg-transparent p-4 cursor-pointer hover:bg-card/20 hover:bg-card/30 transition-all active:scale-[0.98] mt-4 ml-2 rounded-2xl"
        >
           <LogOut className="h-5 w-5 text-[#f87171]" />
           <span className="text-[#f87171] font-bold text-lg">Logout</span>
        </div>
      </div>

      {/* DIALOGS */}
      
      {/* Account Dialog */}
      <Dialog open={isAccountOpen} onOpenChange={setIsAccountOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-3xl bg-card border-border border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground">Profilo Allenatore</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/20 hover:bg-card/30">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-yellow to-brand-green flex items-center justify-center text-primary-foreground font-black uppercase text-xl">
                  {user?.username.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight">{user?.username}</span>
                  <span className="text-sm text-muted-foreground/60">{user?.email}</span>
                </div>
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gestione Squadra (Archivio Stagioni & Allenamenti) Dialog */}
      <Dialog open={isSquadraOpen} onOpenChange={setIsSquadraOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg rounded-3xl bg-card border-border border-white/10 text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground">Gestione Squadra</DialogTitle>
            <DialogDescription className="text-muted-foreground/60">Configura archivio stagioni e frequenza allenamento.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 pt-4">
            {/* Allenamenti / Gare */}
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-brand-green">Preferenze</h3>
              
              <div className="flex items-center justify-between p-3 rounded-2xl bg-card/20 hover:bg-card/30">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-foreground/60" />
                  <Label className="text-sm font-bold">Durata Partite</Label>
                </div>
                <Select value={defaultDuration.toString()} onValueChange={(v) => setDefaultDuration(parseInt(v))}>
                  <SelectTrigger className="w-32 h-9 text-xs font-bold uppercase bg-black/20 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border border-white/10 text-foreground">
                    <SelectItem value="70">70 min</SelectItem>
                    <SelectItem value="80">80 min</SelectItem>
                    <SelectItem value="90">90 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-card/20 hover:bg-card/30">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-foreground/60" />
                  <Label className="text-sm font-bold">Sessioni (settimana)</Label>
                </div>
                <Select value={sessionsPerWeek.toString()} onValueChange={(v) => setSessionsPerWeek(parseInt(v))}>
                  <SelectTrigger className="w-32 h-9 text-xs font-bold uppercase bg-black/20 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border border-white/10 text-foreground">
                    <SelectItem value="1">1 volta</SelectItem>
                    <SelectItem value="2">2 volte</SelectItem>
                    <SelectItem value="3">3 volte</SelectItem>
                    <SelectItem value="4">4 volte</SelectItem>
                    <SelectItem value="5">5 volte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stagioni */}
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-widest text-brand-cyan">Archivio Stagioni</h3>
              
              <div className="flex gap-2">
                <Input 
                  placeholder="Es: 2025/26" 
                  value={newSeasonName} 
                  onChange={(e) => setNewSeasonName(e.target.value)}
                  className="font-bold uppercase text-xs bg-black/20 border-white/10 h-10 rounded-xl"
                />
                <Button onClick={handleAddSeason} className="bg-emerald-400 text-primary-foreground h-10 rounded-xl font-black uppercase">
                  <Plus className="h-4 w-4 mr-1" /> Crea
                </Button>
              </div>

              <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1">
                {seasons.map((s) => (
                  <div 
                    key={s.id} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-2xl border transition-all",
                      s.isActive ? "bg-brand-cyan/10 border-brand-cyan/50 shadow-sm" : "bg-card/20 hover:bg-card/30 border-transparent cursor-pointer hover:bg-card/40 hover:bg-card/50"
                    )}
                    onClick={() => !s.isActive && handleSwitchSeason(s.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className={cn("text-sm font-black uppercase tracking-tight", s.isActive ? "text-brand-cyan" : "text-foreground")}>
                          Stagione {s.name}
                        </span>
                      </div>
                      {s.isActive && (
                        <Badge className="text-[9px] bg-brand-cyan text-primary-foreground font-black uppercase py-0.5 px-2">Attiva</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!s.isActive && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-foreground/40 hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSeasonToDelete({ id: s.id, name: s.name });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy & Sicurezza (Esporta / Reset) Dialog */}
      <Dialog open={isPrivacyOpen} onOpenChange={setIsPrivacyOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md rounded-3xl bg-card border-border border-white/10 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-foreground">Privacy & Dati</DialogTitle>
            <DialogDescription className="text-muted-foreground/60">Esporta i tuoi dati o formatta l'account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            
            <div className="space-y-2">
              <Button onClick={handleExport} disabled={isExporting} className="w-full font-black uppercase text-xs h-12 bg-card/40 hover:bg-card/50 text-foreground hover:bg-white/20 rounded-xl">
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? "Esportazione..." : "Esporta tutto (CSV)"}
              </Button>
              <p className="text-[10px] text-foreground/40 text-center px-4">Ricevi un file per la squadra e uno per le partite nel tuo dispositivo.</p>
            </div>

            <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <h4 className="font-black uppercase text-sm -mt-0.5">Zona Pericolo</h4>
              </div>
              <p className="text-[11px] text-foreground/60">Cancellare tutti i dati della stagione {activeSeason?.name}? Questa azione è irreversibile.</p>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full font-black uppercase text-xs rounded-xl h-10 mt-2">
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset Stagione
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl bg-background border-white/10 text-foreground max-w-[90vw]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="uppercase font-black text-destructive">Resettare la stagione?</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs leading-relaxed text-foreground/50">
                      Cancellazione DEFINITIVA giocatori, partite e statistiche della stagione <strong>{activeSeason?.name}</strong>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row gap-2 mt-4">
                    <AlertDialogCancel className="flex-1 mt-0 rounded-xl font-bold text-xs bg-card/40 hover:bg-card/50 text-foreground border-none" disabled={isResetting}>Annulla</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetSeason} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl font-bold text-xs uppercase border-none" disabled={isResetting}>
                      {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Conferma Reset"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Season Deletion Confirmation */}
      <AlertDialog open={!!seasonToDelete} onOpenChange={(open) => !open && setSeasonToDelete(null)}>
        <AlertDialogContent className="rounded-3xl bg-background border-white/10 text-foreground max-w-[90vw]">
          <AlertDialogHeader>
            <AlertDialogTitle className="uppercase font-black text-destructive">Elimina Stagione?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-foreground/50">
              Questa azione cancellerà DEFINITIVAMENTE la stagione <strong>{seasonToDelete?.name}</strong> e tutti i relativi dati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2 mt-4">
            <AlertDialogCancel className="flex-1 mt-0 rounded-xl font-bold text-xs bg-card/40 hover:bg-card/50 text-foreground border-none">Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSeason} className="flex-1 bg-destructive hover:bg-destructive/90 rounded-xl font-bold text-xs uppercase border-none">
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
