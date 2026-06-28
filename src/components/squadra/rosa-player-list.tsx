'use client';

import { useState } from 'react';
import { Player, PlayerRole, ROLE_LABELS, ROLE_CATEGORY_COLORS, getRoleCategory } from '@/lib/types';
import { getPlayersForRole } from '@/lib/rosa-coverage';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChevronUp, ChevronDown, Minus, Plus, Eye, UserPlus } from 'lucide-react';

interface RolePlayerListProps {
  players: Player[];
  selectedRole: PlayerRole;
  isNextSeason: boolean;
  orderedPlayerIds: Partial<Record<PlayerRole, string[]>>;
  excludedIds: string[];
  onReorder: (role: PlayerRole, playerId: string, direction: 'up' | 'down') => void;
  onRemove: (playerId: string) => void;
  onAddPlayer: (player: Player) => void;
  allPlayers: Player[];
}

export function RolePlayerList({
  players,
  selectedRole,
  isNextSeason,
  orderedPlayerIds,
  excludedIds,
  onReorder,
  onRemove,
  onAddPlayer,
  allPlayers,
}: RolePlayerListProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Get players for this role, ordered by orderedPlayerIds
  const rolePlayersUnordered = getPlayersForRole(players, selectedRole);
  
  // Sort: ordered players first (by their order), then unordered
  const roleOrder = orderedPlayerIds[selectedRole] ?? [];
  const ordered = roleOrder
    .map(id => rolePlayersUnordered.find(p => p.id === id))
    .filter((p): p is Player => p !== undefined);
  const unordered = rolePlayersUnordered.filter(p => !roleOrder.includes(p.id));
  const rolePlayers = [...ordered, ...unordered];

  const roleLabel = ROLE_LABELS[selectedRole];
  const category = getRoleCategory(selectedRole);
  const catColor = ROLE_CATEGORY_COLORS[category];

  // Players not in this role but compatible (same category or has this role)
  const availableToAdd = allPlayers.filter(p => {
    if (rolePlayersUnordered.find(rp => rp.id === p.id)) return false; // già in lista
    if (isNextSeason && excludedIds.includes(p.id)) return false; // escluso
    // Compatible: has this role, or same category
    if (p.roles?.includes(selectedRole)) return true;
    if (p.roles?.some(r => getRoleCategory(r) === category)) return true;
    return false;
  });

  // Find player at index for reorder availability
  const canMoveUp = (idx: number) => idx > 0;
  const canMoveDown = (idx: number) => idx < rolePlayers.length - 1;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
        <span className="text-sm font-black uppercase tracking-tight">
          {roleLabel}
        </span>
        <span className="text-[10px] font-bold uppercase text-muted-foreground/60 ml-auto">
          {rolePlayers.length} {rolePlayers.length === 1 ? 'giocatore' : 'giocatori'}
        </span>
        {/* Add button */}
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="p-1 rounded-lg hover:bg-muted/50 border border-border/50 transition-colors"
          title="Aggiungi giocatore adatto"
        >
          <Plus className="h-3.5 w-3.5 text-primary dark:text-brand-green" />
        </button>
      </div>

      {/* Add player menu */}
      {showAddMenu && (
        <div className="p-3 rounded-2xl bg-muted/20 dark:bg-card/10 border border-border/30 space-y-2">
          <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">
            Aggiungi giocatore compatibile
          </p>
          {availableToAdd.length === 0 ? (
            <p className="text-[10px] text-muted-foreground/40">Nessun giocatore disponibile</p>
          ) : (
            availableToAdd
              .sort((a, b) => {
                // Primary role match first, then same category
                const aPrimary = a.roles?.[0] === selectedRole;
                const bPrimary = b.roles?.[0] === selectedRole;
                if (aPrimary && !bPrimary) return -1;
                if (!aPrimary && bPrimary) return 1;
                return a.lastName.localeCompare(b.lastName);
              })
              .map(p => {
                const isPrimaryMatch = p.roles?.[0] === selectedRole;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onAddPlayer(p);
                      setShowAddMenu(false);
                    }}
                    className="flex items-center gap-2 w-full p-2 rounded-xl bg-background/50 dark:bg-black/30 hover:bg-muted/50 transition-colors text-left"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-primary dark:text-brand-green shrink-0" />
                    <span className="text-xs font-bold flex-1 truncate">
                      {p.firstName} {p.lastName}
                    </span>
                    <div className="flex gap-0.5">
                      {p.roles?.map(r => (
                        <Badge
                          key={r}
                          className={cn(
                            "text-[7px] font-black uppercase py-0 px-1",
                            r === selectedRole && "ring-1 ring-[#00e5a0]"
                          )}
                          style={{ backgroundColor: ROLE_CATEGORY_COLORS[getRoleCategory(r)] }}
                        >
                          {r}
                        </Badge>
                      ))}
                    </div>
                    {isPrimaryMatch && (
                      <span className="text-[7px] font-black uppercase text-[#00e5a0]">primario</span>
                    )}
                  </button>
                );
              })
          )}
        </div>
      )}

      {/* Player list */}
      {rolePlayers.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <p className="text-xs font-black uppercase text-muted-foreground/60">
            Nessun giocatore per questo ruolo
          </p>
          <button
            type="button"
            onClick={() => setShowAddMenu(true)}
            className="text-[10px] font-black uppercase text-primary dark:text-brand-green hover:underline"
          >
            + Aggiungi giocatore
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {rolePlayers.map((player, idx) => {
            const isPrimary = player.roles?.[0] === selectedRole;
            const appearances = player.stats?.appearances ?? 0;
            const playerId = player.id;

            return (
              <div
                key={playerId}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-2xl border transition-all",
                  "bg-muted/30 dark:bg-card/20 border-transparent",
                  "hover:bg-muted/50 dark:hover:bg-card/50 hover:border-border",
                  isPrimary && "border-l-2"
                )}
                style={{ borderLeftColor: isPrimary ? catColor : undefined }}
              >
                {/* Reorder arrows */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    disabled={!canMoveUp(idx)}
                    onClick={() => onReorder(selectedRole, playerId, 'up')}
                    className={cn(
                      "p-0.5 rounded transition-colors",
                      canMoveUp(idx)
                        ? "hover:bg-muted text-muted-foreground hover:text-foreground"
                        : "opacity-20 cursor-not-allowed"
                    )}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={!canMoveDown(idx)}
                    onClick={() => onReorder(selectedRole, playerId, 'down')}
                    className={cn(
                      "p-0.5 rounded transition-colors",
                      canMoveDown(idx)
                        ? "hover:bg-muted text-muted-foreground hover:text-foreground"
                        : "opacity-20 cursor-not-allowed"
                    )}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                {/* Player avatar / initials */}
                <div className="w-10 h-10 rounded-xl bg-background dark:bg-black border border-border dark:border-brand-green/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-black uppercase text-foreground">
                    {player.firstName?.[0]}{player.lastName?.[0]}
                  </span>
                </div>

                {/* Player info */}
                <Link
                  href={`/membri/${playerId}`}
                  className="flex-1 min-w-0"
                >
                  <span className="text-sm font-black uppercase tracking-tight block truncate hover:underline">
                    {player.firstName} {player.lastName}
                  </span>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {(player.roles ?? []).map(role => (
                      <Badge
                        key={role}
                        className={cn(
                          "text-[7px] font-black uppercase py-0 px-1",
                          role === selectedRole && "ring-1 ring-white/50"
                        )}
                        style={{ backgroundColor: ROLE_CATEGORY_COLORS[getRoleCategory(role)] }}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </Link>

                {/* Stats */}
                <div className="text-right shrink-0 mr-1">
                  <span className="text-sm font-black">
                    {isNextSeason ? '—' : appearances}
                  </span>
                  <p className="text-[8px] font-bold uppercase text-muted-foreground/60">
                    {isNextSeason ? 'stag.' : 'pres.'}
                  </p>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(playerId);
                  }}
                  className="p-1 rounded-lg hover:bg-red-500/20 border border-transparent hover:border-red-500/50 transition-colors text-muted-foreground hover:text-red-500"
                  title={isNextSeason ? 'Escludi dalla prossima stagione' : 'Rimuovi dalla rosa'}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ObservedPlayersProps {
  observedPlayers: { name: string; role: PlayerRole; note: string }[];
  selectedRole: PlayerRole;
}

export function ObservedPlayersList({ observedPlayers, selectedRole }: ObservedPlayersProps) {
  const category = getRoleCategory(selectedRole);
  const compatible = observedPlayers.filter(p => getRoleCategory(p.role) === category);

  if (compatible.length === 0) {
    return (
      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase text-muted-foreground/60">
            Nessun osservato per questo ruolo
          </p>
          <Link
            href="/membri"
            className="text-[10px] font-black uppercase text-primary dark:text-brand-green hover:underline"
          >
            Vai alla sezione Scout per aggiungerne
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 pt-4 border-t border-border/50 space-y-2">
      <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest">
        Osservati compatibili
      </p>
      {compatible.map((obs, idx) => (
        <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 dark:bg-card/10">
          <Eye className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
          <span className="text-xs font-bold flex-1 truncate">{obs.name}</span>
          <Badge
            className="text-[7px] font-black uppercase py-0 px-1 shrink-0"
            style={{ backgroundColor: ROLE_CATEGORY_COLORS[getRoleCategory(obs.role)] }}
          >
            {obs.role}
          </Badge>
        </div>
      ))}
    </div>
  );
}
