export type Player = {
  id: string;
  name: string;
  number: number;
  role: 'Portiere' | 'Difensore' | 'Centrocampista' | 'Attaccante';
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

export type MatchAttendance = {
  matchId: string;
  playerId: string;
  status: 'present' | 'absent' | 'maybe';
};

export type MatchLineup = {
    matchId: string;
    starters: string[]; // array of player ids
    substitutes: string[]; // array of player ids
}
