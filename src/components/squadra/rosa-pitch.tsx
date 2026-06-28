'use client';

import { FormationModule, ROLE_LABELS, getRoleCategory, ROLE_CATEGORY_COLORS, PlayerRole, FORMATION_POSITIONS, FORMATION_ROLES, Player } from '@/lib/types';
import { FormationCoverage, CoverageLevel, getPlayersForRole } from '@/lib/rosa-coverage';
import { cn } from '@/lib/utils';

interface RosaPitchProps {
  formation: FormationModule;
  coverage: FormationCoverage;
  selectedRole: PlayerRole | null;
  onSelectRole: (role: PlayerRole) => void;
  orderedPlayerIds: Record<PlayerRole, string[]>;
  players: Player[];
}

const COVERAGE_COLORS: Record<CoverageLevel, { bg: string; border: string; glow: string }> = {
  covered: { bg: '#22c55e', border: '#22c55e', glow: 'rgba(34,197,94,0.4)' },
  warning: { bg: '#eab308', border: '#eab308', glow: 'rgba(234,179,8,0.4)' },
  critical: { bg: '#ef4444', border: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
};

export function RosaPitch({ formation, coverage, selectedRole, onSelectRole, orderedPlayerIds, players }: RosaPitchProps) {
  const positions = FORMATION_POSITIONS[formation];
  const rolesInFormation = FORMATION_ROLES[formation];

  // Get the first player's last name for a role slot
  const getTopPlayerName = (role: PlayerRole): string | null => {
    const ordered = orderedPlayerIds[role];
    if (ordered && ordered.length > 0) {
      const topPlayer = players.find(p => p.id === ordered[0]);
      if (topPlayer) return topPlayer.lastName;
    }
    // Fallback: any player with this role
    const rolePlayers = getPlayersForRole(players, role);
    if (rolePlayers.length > 0) return rolePlayers[0].lastName;
    return null;
  };

  return (
    <div className="relative w-full mx-auto" style={{ aspectRatio: '9/16', maxHeight: '500px' }}>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-800 to-emerald-900 border-2 border-white/20 overflow-hidden">
        {/* Field lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-[4%] border border-white/20 rounded-xl" />
          <div className="absolute top-1/2 left-[4%] right-[4%] h-px bg-white/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28%] aspect-square border border-white/20 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full" />
          <div className="absolute top-0 left-[25%] right-[25%] h-[16%]" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', borderLeft: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)' }} />
          <div className="absolute bottom-0 left-[25%] right-[25%] h-[16%]" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', borderLeft: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)' }} />
        </div>

        {/* Role slots */}
        {rolesInFormation.map((role, idx) => {
          const pos = positions[idx];
          const cov = coverage.roleCoverage.get(role);
          const level = cov?.level ?? 'critical';
          const count = cov?.count ?? 0;
          const colors = COVERAGE_COLORS[level];
          const isSelected = selectedRole === role;
          const topName = getTopPlayerName(role);

          return (
            <button
              key={`${role}-${idx}`}
              type="button"
              onClick={() => onSelectRole(role)}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all duration-150',
                'border-2 text-[9px] font-black uppercase cursor-pointer',
                'hover:scale-110 active:scale-95',
                isSelected && 'ring-2 ring-[#00e5a0] ring-offset-2 ring-offset-emerald-900'
              )}
              style={{
                top: pos.top,
                left: pos.left,
                backgroundColor: colors.bg,
                borderColor: isSelected ? '#00e5a0' : colors.border,
                boxShadow: `0 0 12px ${colors.glow}`,
              }}
            >
              <span className="text-white drop-shadow-md leading-none">{role}</span>
              <span className="text-[7px] text-white/80 leading-none mt-0.5">{count}</span>
              {topName && (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] font-black text-white/80 whitespace-nowrap drop-shadow-md max-w-[80px] truncate">
                  {topName}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
