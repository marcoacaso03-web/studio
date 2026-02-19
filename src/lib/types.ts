
export const ROLES = ['Portiere', 'Difensore', 'Centrocampista', 'Attaccante'] as const;
export type Role = typeof ROLES[number];

export type Player = {
  id: string;
  name: string;
  number: number;
  role: Role;
  avatarUrl: string;
  imageHint: string;
  stats: {
    appearances: number;
    goals: number;
    assists: number;
    avgMinutes: number;
  };
};

export type Match = {
  id: string;
  opponent: string;
  date: string;
  location: string;
  isHome: boolean;
  duration: number; // Durata totale in minuti (70, 80, 90)
  result?: {
    home: number;
    away: number;
  };
  status: 'scheduled' | 'completed' | 'canceled';
};

export const ATTENDANCE_STATUSES = ['presente', 'assente', 'in dubbio'] as const;
export type AttendanceStatus = typeof ATTENDANCE_STATUSES[number];


export type MatchAttendance = {
  matchId: string;
  playerId: string;
  status: AttendanceStatus;
};

export type MatchLineup = {
    matchId: string;
    starters: string[]; // array of player ids
    substitutes: string[]; // array of player ids
}

export type PlayerMatchStats = {
  matchId: string;
  playerId: string;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
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
};
