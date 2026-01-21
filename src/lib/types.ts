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
  };
};

export type Match = {
  id: string;
  opponent: string;
  date: string;
  location: string;
  isHome: boolean;
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
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
};
