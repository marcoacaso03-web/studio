'use client';

import { PlayerRole, ALL_ROLES, ROLE_LABELS, ROLE_CATEGORY_COLORS, ROLE_CATEGORIES, RoleCategory, getRoleCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PitchRoleSelectorProps {
  selectedRoles: PlayerRole[];
  onChange: (roles: PlayerRole[]) => void;
}

interface RolePosition {
  role: PlayerRole;
  top: string;
  left: string;
}

const ROLE_POSITIONS: RolePosition[] = [
  { role: 'POR', top: '88%', left: '50%' },
  { role: 'DC', top: '72%', left: '50%' },
  { role: 'TD', top: '72%', left: '78%' },
  { role: 'TS', top: '72%', left: '22%' },
  { role: 'ADA', top: '58%', left: '88%' },
  { role: 'ASA', top: '58%', left: '12%' },
  { role: 'CDC', top: '50%', left: '50%' },
  { role: 'CD', top: '40%', left: '76%' },
  { role: 'CS', top: '40%', left: '24%' },
  { role: 'TRQ', top: '28%', left: '50%' },
  { role: 'AD', top: '16%', left: '78%' },
  { role: 'AS', top: '16%', left: '22%' },
  { role: 'ATT', top: '10%', left: '50%' },
];

const CATEGORY_LEGEND: { key: RoleCategory; label: string }[] = [
  { key: 'POR', label: 'POR' },
  { key: 'DIF', label: 'DIF' },
  { key: 'CEN', label: 'CEN' },
  { key: 'ATT', label: 'ATT' },
];

export function PitchRoleSelector({ selectedRoles, onChange }: PitchRoleSelectorProps) {
  const toggleRole = (role: PlayerRole) => {
    if (selectedRoles.includes(role)) {
      // Remove role — if it's the primary, promote next
      const filtered = selectedRoles.filter(r => r !== role);
      onChange(filtered);
    } else {
      // Add role
      onChange([...selectedRoles, role]);
    }
  };

  const isSelected = (role: PlayerRole) => selectedRoles.includes(role);
  const isPrimary = (role: PlayerRole) => selectedRoles[0] === role;

  return (
    <div className="space-y-4">
      {/* Pitch Field */}
      <div className="relative w-full mx-auto max-w-[280px]" style={{ aspectRatio: '9/16' }}>
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-emerald-800 to-emerald-900 border-2 border-white/20 overflow-hidden">
          {/* Field lines */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Border */}
            <div className="absolute inset-[4%] border border-white/20 rounded-xl" />
            {/* Center line */}
            <div className="absolute top-1/2 left-[4%] right-[4%] h-px bg-white/20" />
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[28%] aspect-square border border-white/20 rounded-full" />
            {/* Center dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full" />
            {/* Penalty area top */}
            <div className="absolute top-0 left-[25%] right-[25%] h-[16%] border-b border-l-r border-white/15 border-b-white/15 border-l-white/15 border-r-white/15" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)', borderLeft: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)' }} />
            {/* Penalty area bottom */}
            <div className="absolute bottom-0 left-[25%] right-[25%] h-[16%]" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', borderLeft: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)' }} />
          </div>

          {/* Goal at bottom */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[30%] h-[4%] bg-white/10 border border-white/30 border-b-0 rounded-t-md" />

          {/* Role nodes */}
          {ROLE_POSITIONS.map(({ role, top, left }) => {
            const selected = isSelected(role);
            const primary = isPrimary(role);
            const category = getRoleCategory(role);
            const color = ROLE_CATEGORY_COLORS[category];

            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150',
                  'border-2 text-[9px] font-black uppercase',
                  'hover:scale-110 active:scale-95',
                  selected
                    ? 'text-white shadow-lg'
                    : 'bg-transparent border-white/30 text-white/50 hover:border-white/60'
                )}
                style={{
                  top,
                  left,
                  backgroundColor: selected ? color : undefined,
                  borderColor: selected ? color : undefined,
                  boxShadow: selected ? `0 0 12px ${color}66` : undefined,
                }}
                title={ROLE_LABELS[role]}
              >
                {role}
                {primary && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] text-yellow-400">★</span>
                )}
                {selected && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Legend */}
      <div className="flex justify-center gap-2">
        {CATEGORY_LEGEND.map(({ key, label }) => (
          <span
            key={key}
            className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white"
            style={{ backgroundColor: ROLE_CATEGORY_COLORS[key] }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Selected roles badges */}
      {selectedRoles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {selectedRoles.map((role, idx) => {
            const category = getRoleCategory(role);
            const color = ROLE_CATEGORY_COLORS[category];
            return (
              <span
                key={role}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-white"
                style={{ backgroundColor: color }}
              >
                {idx === 0 && <span className="text-[8px]">★</span>}
                {role}
                <span className="opacity-70 ml-0.5">({ROLE_LABELS[role]})</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
