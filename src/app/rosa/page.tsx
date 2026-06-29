'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { usePlayersStore } from '@/store/usePlayersStore';
import { useSeasonsStore } from '@/store/useSeasonsStore';
import {
  FormationModule,
  FORMATIONS,
  DEFAULT_FORMATION,
  PlayerRole,
  Player,
  ScoutPlayer,
} from '@/lib/types';
import { calculateCoverage, getFirstCriticalSlot, FormationCoverage } from '@/lib/rosa-coverage';
import { RosaPitch } from '@/components/squadra/rosa-pitch';
import { RolePlayerList, ObservedPlayersList } from '@/components/squadra/rosa-player-list';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, AlertCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { ScoutPlayerSchema } from '@/lib/schemas';

interface FormationState {
  orderedPlayerIds: Record<PlayerRole, string[]>;
}

const createEmptyFormationState = (): FormationState => ({
  orderedPlayerIds: {} as Record<PlayerRole, string[]>,
});

export default function RosaOverviewPage() {
  const { players } = usePlayersStore();
  const { activeSeason } = useSeasonsStore();
  const { user } = useUser();
  const firestore = useFirestore();

  const [formation, setFormation] = useState<FormationModule>(DEFAULT_FORMATION);
  const [selectedRole, setSelectedRole] = useState<PlayerRole | null>(null);

  const [formationStates, setFormationStates] = useState<Record<FormationModule, FormationState>>(() => {
    const init: Partial<Record<FormationModule, FormationState>> = {};
    FORMATIONS.forEach(f => { init[f] = createEmptyFormationState(); });
    return init as Record<FormationModule, FormationState>;
  });

  const prevFormationRef = useRef<FormationModule>(formation);

  const currentState = formationStates[formation];
  const { orderedPlayerIds } = currentState;

  const updateFormationState = useCallback((updater: (prev: FormationState) => FormationState) => {
    setFormationStates(prev => ({
      ...prev,
      [formation]: updater(prev[formation]),
    }));
  }, [formation]);

  const activeCoverage: FormationCoverage = useMemo(
    () => calculateCoverage(players, formation),
    [players, formation]
  );

  const scoutPlayersQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'scoutPlayers');
  }, [firestore, user]);

  const { data: scoutPlayers } = useCollection<ScoutPlayer>(
    scoutPlayersQuery,
    ScoutPlayerSchema as any
  );

  const observedPlayers = useMemo(() => {
    if (!scoutPlayers) return [];
    return scoutPlayers.map(sp => ({
      id: sp.id,
      name: sp.name,
      role: (['POR','DC','TD','TS','ADA','ASA','CDC','CC','TRQ','CD','CS','AD','AS','ATT'].includes(sp.role) ? sp.role : 'ATT') as PlayerRole,
      note: sp.notes ?? sp.currentTeam ?? '',
    }));
  }, [scoutPlayers]);

  useEffect(() => {
    if (prevFormationRef.current !== formation) {
      prevFormationRef.current = formation;
      const autoRole = getFirstCriticalSlot(formation, activeCoverage);
      if (autoRole) setSelectedRole(autoRole);
    }
  }, [formation, activeCoverage]);

  const handleReorder = useCallback((role: PlayerRole, playerId: string, direction: 'up' | 'down') => {
    updateFormationState(prev => {
      const current = prev.orderedPlayerIds[role] ? [...prev.orderedPlayerIds[role]] : [];
      const idx = current.indexOf(playerId);
      if (idx === -1) return prev;

      if (direction === 'up' && idx > 0) {
        [current[idx - 1], current[idx]] = [current[idx], current[idx - 1]];
      } else if (direction === 'down' && idx < current.length - 1) {
        [current[idx], current[idx + 1]] = [current[idx + 1], current[idx]];
      }

      return {
        ...prev,
        orderedPlayerIds: { ...prev.orderedPlayerIds, [role]: current },
      };
    });
  }, [updateFormationState]);

  const handleRemove = useCallback((playerId: string) => {
    setFormationStates(prev => {
      const next: Record<FormationModule, FormationState> = { ...prev };
      for (const fm of FORMATIONS) {
        const oids = { ...next[fm].orderedPlayerIds };
        for (const role of Object.keys(oids) as PlayerRole[]) {
          oids[role] = (oids[role] ?? []).filter(id => id !== playerId);
        }
        next[fm] = { ...next[fm], orderedPlayerIds: oids };
      }
      return next;
    });
  }, []);

  const handleAddPlayer = useCallback((player: Player) => {
    if (!selectedRole) return;
    updateFormationState(prev => {
      const current = prev.orderedPlayerIds[selectedRole] ? [...prev.orderedPlayerIds[selectedRole]] : [];
      if (!current.includes(player.id)) {
        current.push(player.id);
      }
      return {
        ...prev,
        orderedPlayerIds: { ...prev.orderedPlayerIds, [selectedRole]: current },
      };
    });
  }, [selectedRole, updateFormationState]);

  const handleAddObservedPlayer = useCallback((observedId: string, name: string, role: PlayerRole) => {
    if (!selectedRole) return;
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] ?? '';
    const lastName = nameParts.slice(1).join(' ');

    usePlayersStore.getState().add({
      name,
      firstName,
      lastName: lastName || firstName,
      roles: [role] as PlayerRole[],
    }).then((newPlayer) => {
      if (newPlayer) {
        handleAddPlayer(newPlayer);
      }
    });
  }, [selectedRole, handleAddPlayer]);

  const handleReset = useCallback(() => {
    setFormationStates(prev => ({
      ...prev,
      [formation]: createEmptyFormationState(),
    }));
  }, [formation]);

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
    <div className="space-y-3 pb-24">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={formation} onValueChange={(v) => setFormation(v as FormationModule)}>
          <SelectTrigger className="w-28 h-8 text-xs font-bold uppercase bg-background dark:bg-black border border-border dark:border-brand-green/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FORMATIONS.map(f => (
              <SelectItem key={f} value={f} className="text-xs font-bold">{f}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border border-border dark:border-brand-green/30 text-muted-foreground dark:hover:border-brand-green transition-all"
          title="Ripristina formazione"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-muted/30 dark:bg-card/20 border border-border dark:border-transparent">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Copertura:
        </span>
        <span className="text-xs font-black">
          {activeCoverage.coveredSlots + activeCoverage.warningSlots}/{activeCoverage.totalSlots}
        </span>
        {activeCoverage.criticalSlots > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase text-red-500 ml-auto">
            <AlertCircle className="h-3 w-3" />
            {activeCoverage.criticalSlots} emergenze
          </span>
        )}
        {activeCoverage.warningSlots > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase text-yellow-500">
            <AlertTriangle className="h-3 w-3" />
            {activeCoverage.warningSlots} scoperti
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-[40%] shrink-0">
          <RosaPitch
            formation={formation}
            coverage={activeCoverage}
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            orderedPlayerIds={orderedPlayerIds}
            players={players}
          />
        </div>

        <div className="md:w-[60%] flex-1 min-w-0">
          <ScrollArea className="h-[500px] pr-2">
            {selectedRole ? (
              <div className="space-y-4">
                <RolePlayerList
                  players={players}
                  selectedRole={selectedRole}
                  isNextSeason={false}
                  orderedPlayerIds={{ [selectedRole]: orderedPlayerIds[selectedRole] ?? [] }}
                  excludedIds={[]}
                  onReorder={handleReorder}
                  onRemove={handleRemove}
                  onAddPlayer={handleAddPlayer}
                  allPlayers={players}
                />

                <ObservedPlayersList
                  observedPlayers={observedPlayers}
                  selectedRole={selectedRole}
                  onAdd={handleAddObservedPlayer}
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
