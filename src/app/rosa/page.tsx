'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePlayersStore } from '@/store/usePlayersStore';
import { useSeasonsStore } from '@/store/useSeasonsStore';
import {
  FormationModule,
  FORMATIONS,
  DEFAULT_FORMATION,
  PlayerRole,
  ROLE_LABELS,
} from '@/lib/types';
import { calculateCoverage, getFirstCriticalSlot, FormationCoverage } from '@/lib/rosa-coverage';
import { RosaPitch } from '@/components/squadra/rosa-pitch';
import { RolePlayerList, ObservedPlayersList } from '@/components/squadra/role-player-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type SeasonMode = 'current' | 'next';

export default function RosaOverviewPage() {
  const { players } = usePlayersStore();
  const { activeSeason } = useSeasonsStore();

  const [formation, setFormation] = useState<FormationModule>(DEFAULT_FORMATION);
  const [selectedRole, setSelectedRole] = useState<PlayerRole | null>(null);
  const [seasonMode, setSeasonMode] = useState<SeasonMode>('current');

  // Calculate coverage for current formation
  const coverage: FormationCoverage = useMemo(
    () => calculateCoverage(players, formation),
    [players, formation]
  );

  // Auto-select first critical role or first slot on formation change
  useEffect(() => {
    const autoRole = getFirstCriticalSlot(formation, coverage);
    if (autoRole) setSelectedRole(autoRole);
  }, [formation, coverage]);

  // Mock observed players (would come from a scout store in a real app)
  const observedPlayers: { name: string; role: PlayerRole; note: string }[] = [];

  if (!activeSeason) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm font-black uppercase text-muted-foreground/60">
          Nessuna stagione attiva
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-primary dark:text-brand-green" />
        <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">
          Panoramica Rosa
        </h1>
      </div>

      {/* Coverage Summary Bar */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 dark:bg-card/20 border border-border dark:border-transparent">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Copertura:
        </span>
        <span className="text-xs font-black">
          {coverage.coveredSlots + coverage.warningSlots}/{coverage.totalSlots}
        </span>
        {coverage.criticalSlots > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-500 ml-auto">
            <AlertCircle className="h-3 w-3" />
            {coverage.criticalSlots} emergenze
          </span>
        )}
        {coverage.warningSlots > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase text-yellow-500">
            <AlertTriangle className="h-3 w-3" />
            {coverage.warningSlots} scoperti
          </span>
        )}
      </div>

      {/* Controls Row */}
      <div className="flex items-center gap-2">
        <Select value={formation} onValueChange={(v) => setFormation(v as FormationModule)}>
          <SelectTrigger className="w-32 h-9 text-xs font-bold uppercase bg-background dark:bg-black border border-border dark:border-brand-green/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FORMATIONS.map(f => (
              <SelectItem key={f} value={f} className="text-xs font-bold">{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Season toggle */}
        <div className="flex bg-muted/50 rounded-full p-0.5 ml-auto">
          <button
            onClick={() => setSeasonMode('current')}
            className={cn(
              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
              seasonMode === 'current'
                ? "bg-background dark:bg-black border border-primary dark:border-brand-green text-foreground"
                : "text-muted-foreground/50"
            )}
          >
            Stagione Corrente
          </button>
          <button
            onClick={() => setSeasonMode('next')}
            className={cn(
              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
              seasonMode === 'next'
                ? "bg-background dark:bg-black border border-primary dark:border-brand-green text-foreground"
                : "text-muted-foreground/50"
            )}
          >
            Stagione Prossima
          </button>
        </div>
      </div>

      {/* Next season banner */}
      {seasonMode === 'next' && (
        <div className="p-3 rounded-2xl bg-primary/5 dark:bg-brand-green/5 border border-primary/20 dark:border-brand-green/20">
          <p className="text-[10px] font-bold uppercase text-muted-foreground leading-relaxed">
            La proiezione include tutti i giocatori attualmente in rosa.
            Rimuovi un giocatore dalla rosa per escluderlo dalla stagione prossima.
          </p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: Pitch */}
        <div className="md:w-[40%] shrink-0">
          <RosaPitch
            formation={formation}
            coverage={coverage}
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
          />
        </div>

        {/* Right: Player list */}
        <div className="md:w-[60%] flex-1 min-w-0">
          <ScrollArea className="h-[500px] pr-2">
            {selectedRole ? (
              <div className="space-y-4">
                {/* Season projection header */}
                {seasonMode === 'next' && (
                  <p className="text-[10px] font-black uppercase text-primary dark:text-brand-green tracking-widest">
                    Proiezione {new Date().getFullYear() + 1}/{String(new Date().getFullYear() + 2).slice(2)}
                  </p>
                )}

                <RolePlayerList
                  players={players}
                  selectedRole={selectedRole}
                  isNextSeason={seasonMode === 'next'}
                />

                <ObservedPlayersList
                  observedPlayers={observedPlayers}
                  selectedRole={selectedRole}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs font-black uppercase text-muted-foreground/40">
                  Seleziona un ruolo sul campo
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
