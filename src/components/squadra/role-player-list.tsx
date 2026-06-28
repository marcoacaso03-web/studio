'use client';

import { Player, PlayerRole, ROLE_LABELS, ROLE_CATEGORY_COLORS, getRoleCategory } from '@/lib/types';
import { getPlayersForRole } from '@/lib/rosa-coverage';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Eye } from 'lucide-react';

interface RolePlayerListProps {
  players: Player[];
  selectedRole: PlayerRole;
  isNextSeason?: boolean;
}

export function RolePlayerList({ players, selectedRole, isNextSeason }: RolePlayerListProps) {
  const rolePlayers = getPlayersForRole(players, selectedRole);
  const roleLabel = ROLE_LABELS[selectedRole];
  const category = getRoleCategory(selectedRole);
  const catColor = ROLE_CATEGORY_COLORS[category];

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
      </div>

      {/* Player list */}
      {rolePlayers.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <p className="text-xs font-black uppercase text-muted-foreground/60">
            Nessun giocatore per questo ruolo
          </p>
          <p className="text-[10px] text-muted-foreground/40">
            Aggiungi giocatori con ruolo {selectedRole} ({roleLabel})
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rolePlayers.map((player) => {
            const isPrimary = player.roles?.[0] === selectedRole;
            const appearances = player.stats?.appearances ?? 0;

            return (
              <Link
                key={player.id}
                href={`/membri/${player.id}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                  "bg-muted/30 dark:bg-card/20 border-transparent",
                  "hover:bg-muted/50 dark:hover:bg-card/50 hover:border-border",
                  isPrimary && "border-l-2"
                )}
                style={{ borderLeftColor: isPrimary ? catColor : undefined }}
              >
                {/* Player avatar / initials */}
                <div className="w-10 h-10 rounded-xl bg-background dark:bg-black border border-border dark:border-brand-green/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-black uppercase text-foreground">
                    {player.firstName?.[0]}{player.lastName?.[0]}
                  </span>
                </div>

                {/* Player info */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-black uppercase tracking-tight block truncate">
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
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <span className="text-sm font-black">
                    {isNextSeason ? '—' : appearances}
                  </span>
                  <p className="text-[8px] font-bold uppercase text-muted-foreground/60">
                    {isNextSeason ? 'stag.' : 'pres.'}
                  </p>
                </div>
              </Link>
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
