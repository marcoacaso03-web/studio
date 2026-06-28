export type AccountRole = 'developer' | 'director' | 'coach' | 'player';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: AccountRole;
  teamIds?: string[];
  linkedPlayerId?: string;
  createdAt: string;
  updatedAt: string;
}

export const ROLES = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'] as const;
export type Role = typeof ROLES[number];

// ── Italian Nomenclature Roles ──────────────────────────────
export type PlayerRole =
  | 'POR'
  | 'DC' | 'TD' | 'TS' | 'ADA' | 'ASA'
  | 'CDC' | 'TRQ' | 'CD' | 'CS'
  | 'AD' | 'AS' | 'ATT';

export type RoleCategory = 'POR' | 'DIF' | 'CEN' | 'ATT';

export const ALL_ROLES: PlayerRole[] = [
  'POR',
  'DC', 'TD', 'TS', 'ADA', 'ASA',
  'CDC', 'TRQ', 'CD', 'CS',
  'AD', 'AS', 'ATT',
];

export const ROLE_CATEGORIES: Record<RoleCategory, PlayerRole[]> = {
  POR: ['POR'],
  DIF: ['DC', 'TD', 'TS', 'ADA', 'ASA'],
  CEN: ['CDC', 'TRQ', 'CD', 'CS'],
  ATT: ['AD', 'AS', 'ATT'],
};

export const ROLE_LABELS: Record<PlayerRole, string> = {
  POR: 'Portiere',
  DC:  'Difensore Centrale',
  TD:  'Terzino Destro',
  TS:  'Terzino Sinistro',
  ADA: 'Ala Destra Arretrata',
  ASA: 'Ala Sinistra Arretrata',
  CDC: 'Centrocampista Difensivo Centrale',
  TRQ: 'Trequartista',
  CD:  'Centrocampista Destro',
  CS:  'Centrocampista Sinistro',
  AD:  'Ala Destra',
  AS:  'Ala Sinistra',
  ATT: 'Attaccante',
};

export const ROLE_CATEGORY_LABELS: Record<RoleCategory, string> = {
  POR: 'Portiere',
  DIF: 'Difensori',
  CEN: 'Centrocampisti',
  ATT: 'Attaccanti',
};

export const ROLE_CATEGORY_COLORS: Record<RoleCategory, string> = {
  POR: '#fbbf24',
  DIF: '#00e5a0',
  CEN: '#3b82f6',
  ATT: '#ef4444',
};

export function getRoleCategory(role: PlayerRole): RoleCategory {
  for (const [cat, roles] of Object.entries(ROLE_CATEGORIES) as [RoleCategory, PlayerRole[]][]) {
    if (roles.includes(role)) return cat;
  }
  return 'CEN';
}

// ── Migration helpers ──────────────────────────────────────
const MIGRATION_MAP: Record<string, PlayerRole> = {
  'POR': 'POR', 'Portiere': 'POR', 'portiere': 'POR',
  'DC': 'DC', 'Difensore Centrale': 'DC', 'Difensore': 'DC',
  'DCD': 'TD', 'Terzino Destro': 'TD', 'Terzino Destro ': 'TD',
  'DCS': 'TS', 'Terzino Sinistro': 'TS',
  'ED': 'ADA', 'Ala Destra': 'ADA', 'ES': 'ASA', 'Ala Sinistra': 'ASA',
  'CDC': 'CDC', 'Mediano': 'CDC', ' mediano': 'CDC',
  'CCD': 'CD', 'CCS': 'CS',
  'CO': 'CD', 'CSX': 'CS',
  'TRQ': 'TRQ', 'Trequartista': 'TRQ',
  'ATT': 'ATT', 'Attaccante': 'ATT', 'attaccante': 'ATT',
  'AD': 'AD', 'AS': 'AS',
};

export function migrateRole(oldRole: string): PlayerRole {
  return MIGRATION_MAP[oldRole] ?? 'CDC';
}

// Player type now uses `roles: PlayerRole[]` with primaryRole = roles[0]
// For backwards compatibility, primaryRole is derived from roles[0]
// ── Types ──────────────────────────────────────────────────

export interface PlayerStats {
  appearances: number;
  goals: number;
  assists: number;
  avgMinutes: number;
  yellowCards?: number;
  redCards?: number;
}

export type Season = {
  id: string;
  userId: string;
  ownerId: string;
  name: string;
  isActive: boolean;
  sharedWith?: string[];
  createdAt: string;
  updatedAt: string;
};

export type InjuryPeriod = {
  id: string;
  startDate: string; // ISO formato YYYY-MM-DD
  endDate: string; // ISO formato YYYY-MM-DD
};

export type Player = {
  id: string;
  userId: string;
  teamOwnerId: string;
  teamId: string;
  seasonId: string;
  name: string;
  firstName: string;
  lastName: string;
  roles?: PlayerRole[];
  /** @deprecated Use roles[0] instead. Kept for migration compatibility. */
  role?: Role;
  /** @deprecated Use roles.slice(1) instead. Kept for migration compatibility. */
  secondaryRoles?: Role[];
  stats: PlayerStats;
  injuries?: InjuryPeriod[];
  createdAt?: string;
  updatedAt?: string;
};

/** Helper to get the primary role (roles[0]) with fallback to legacy role */
export function getPrimaryRole(player: Player): PlayerRole {
  if (player.roles && player.roles.length > 0) return player.roles[0];
  if (player.role) return migrateRole(player.role);
  return 'CDC';
}

export const MATCH_TYPES = ['Campionato', 'Torneo', 'Amichevole'] as const;
export type MatchType = typeof MATCH_TYPES[number];

export type MatchResult = {
  home: number;
  away: number;
};

export type MatchStatus = 'scheduled' | 'completed' | 'canceled';

export type Match = {
  id: string;
  userId: string;
  teamOwnerId: string;
  teamId: string;
  seasonId: string;
  opponent: string;
  date: string;
  isHome: boolean;
  type: MatchType;
  duration: number;
  result?: MatchResult;
  teamGoals?: number; // Normalized
  opponentGoals?: number; // Normalized
  resultType?: 'W' | 'D' | 'L'; // Normalized
  status: MatchStatus;
  round?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const ATTENDANCE_STATUSES = ['presente', 'assente', 'in dubbio'] as const;
export type AttendanceStatus = typeof ATTENDANCE_STATUSES[number];

export type MatchAttendance = {
  matchId: string;
  playerId: string;
  status: AttendanceStatus;
  teamOwnerId?: string;
};

export type StarterPlayer = {
  playerId: string;
  role: string;
  positionCode?: string;
};

export type MatchLineup = {
    matchId: string;
    starters: (string | StarterPlayer)[];
    substitutes: (string | StarterPlayer)[];
    formation?: string;
    teamOwnerId?: string;
}

export type PlayerMatchStats = {
  matchId: string;
  playerId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  teamOwnerId?: string;
};

export const EVENT_TYPES = ['goal', 'own_goal', 'yellow_card', 'red_card', 'substitution', 'assist', 'sub_in', 'sub_out', 'penalty_saved', 'penalty_missed', 'chance', 'woodwork', 'note'] as const;
export type MatchEventType = typeof EVENT_TYPES[number];

export const GOAL_TYPES = ['azione', 'rigore', 'punizione', 'calcio_angolo'] as const;
export type GoalType = typeof GOAL_TYPES[number];

export type MatchEvent = {
  id: string;
  matchId: string;
  type: MatchEventType;
  team: 'home' | 'away';
  teamSide?: 'our' | 'opponent'; // Normalized
  playerId?: string;
  playerName?: string; 
  subOutPlayerId?: string; 
  subOutPlayerName?: string; 
  assistPlayerId?: string; 
  assistPlayerName?: string; 
  minute: number | null;
  period: '1T' | '2T' | '1TS' | '2TS';
  goalType?: GoalType;
  notes?: string;
  teamOwnerId?: string;
};

export interface AdvancedStatsLeaderboard {
    generatedAt: string;
    seasonId: string;
    filters: { 
        minStarterApps: number; 
        minPairMatches: number;
    };
    bestCbPair: Array<{ 
        pairKey: string; 
        playerIds: string[]; 
        matchesTogether: number; 
        goalsConceded: number; 
        goalsConcededPerMatch: number;
    }>;
    bestCbTrio: Array<{ 
        trioKey: string; 
        playerIds: string[]; 
        matchesTogether: number; 
        goalsConceded: number; 
        goalsConcededPerMatch: number;
    }>;
    bestGaPerStarter: Array<{ 
        playerId: string; 
        goals: number; 
        assists: number; 
        starterApps: number; 
        gaPerStarter: number;
    }>;
    decisiveGoalsLeaders: Array<{ 
        playerId: string; 
        decisiveGoals: number; 
        confidence: 'high' | 'mixed';
    }>;
    lowestStarterLossRate: Array<{ 
        playerId: string; 
        starterApps: number; 
        starterLosses: number; 
        lossRate: number;
    }>;
    meta?: {
        warnings?: string[];
    }
}

export type TrainingStatus = 'presente' | 'ritardo' | 'assente';

export type TrainingSession = {
  id: string;
  index: number;
  date: string;
  notes?: string;
  focus?: string;
  seasonId: string;
  userId: string;
  exerciseIds?: string[];
  exercises?: { id: string; duration?: string }[];
  attendances?: TrainingAttendance[];
};

export type TrainingAttendance = {
  playerId: string;
  status: TrainingStatus;
};

export interface ScoutCategory {
  id: string;
  name: string;
  colorHex: string;
}

export interface ScoutPlayer {
  id: string;
  name: string;
  role: string;
  currentTeam: string;
  categoryIds?: string[];
  notes?: string;
}

export type ExerciseMediaType = 'image' | 'video' | 'link';

export interface ExerciseMedia {
  type: ExerciseMediaType;
  url: string;
}

export interface Exercise {
  id: string;
  userId: string;
  ownerName: string;
  name: string;
  description: string;
  objectives?: string;
  focus: string[];
  visibility: 'private' | 'global';
  media: ExerciseMedia[];
  playerCount: string[];
  duration?: string;
  createdAt: string;
  updatedAt: string;
}
