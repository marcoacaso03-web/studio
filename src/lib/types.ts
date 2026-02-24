
export const ROLES = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'] as const;
export type Role = typeof ROLES[number];

export type Season = {
  id: string;
  userId: string;
  ownerId: string; // Per Security Rules
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Player = {
  id: string;
  userId: string;
  teamOwnerId: string; // Per Security Rules
  teamId: string;      // Per Backend mapping
  seasonId: string;
  name: string;
  role: Role;
  avatarUrl: string;
  imageHint: string;
  stats: {
    appearances: number;
    goals: number;
    assists: number;
    avgMinutes: number;
  };
  createdAt: string;
  updatedAt: string;
};

export const MATCH_TYPES = ['Campionato', 'Torneo', 'Amichevole'] as const;
export type MatchType = typeof MATCH_TYPES[number];

export type Match = {
  id: string;
  userId: string;
  teamOwnerId: string; // Per Security Rules
  teamId: string;      // Per Backend mapping
  seasonId: string;
  opponent: string;
  date: string;
  isHome: boolean;
  type: MatchType;
  duration: number;
  result?: {
    home: number;
    away: number;
  };
  status: 'scheduled' | 'completed' | 'canceled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export const ATTENDANCE_STATUSES = ['presente', 'assente', 'in dubbio'] as const;
export type AttendanceStatus = typeof ATTENDANCE_STATUSES[number];

export type MatchAttendance = {
  matchId: string;
  playerId: string;
  status: AttendanceStatus;
  teamOwnerId?: string;
};

export type MatchLineup = {
    matchId: string;
    starters: string[];
    substitutes: string[];
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

export const EVENT_TYPES = ['goal', 'yellow_card', 'red_card', 'substitution'] as const;
export type MatchEventType = typeof EVENT_TYPES[number];

export type MatchEvent = {
  id: string;
  matchId: string;
  type: MatchEventType;
  team: 'home' | 'away';
  playerId?: string;
  playerName?: string; 
  subOutPlayerId?: string; 
  subOutPlayerName?: string; 
  assistPlayerId?: string; 
  assistPlayerName?: string; 
  minute: number;
  period: '1T' | '2T' | '1TS' | '2TS';
  teamOwnerId?: string;
};
