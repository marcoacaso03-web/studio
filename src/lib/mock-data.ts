import type { Player, Match, Role } from './types';

let players: Player[] = [
  { id: '1', name: 'Marco Rossi', number: 1, role: 'Portiere', avatarUrl: 'https://picsum.photos/seed/p1/200/200', imageHint: 'player portrait', stats: { appearances: 10, goals: 0, assists: 0 } },
  { id: '2', name: 'Luca Bianchi', number: 5, role: 'Difensore', avatarUrl: 'https://picsum.photos/seed/p2/200/200', imageHint: 'player action', stats: { appearances: 10, goals: 1, assists: 1 } },
  { id: '3', name: 'Andrea Verdi', number: 8, role: 'Centrocampista', avatarUrl: 'https://picsum.photos/seed/p3/200/200', imageHint: 'soccer game', stats: { appearances: 10, goals: 3, assists: 5 } },
  { id: '4', name: 'Simone Neri', number: 9, role: 'Attaccante', avatarUrl: 'https://picsum.photos/seed/p4/200/200', imageHint: 'athlete intense', stats: { appearances: 10, goals: 8, assists: 2 } },
  { id: '5', name: 'Matteo Gialli', number: 3, role: 'Difensore', avatarUrl: 'https://picsum.photos/seed/p5/200/200', imageHint: 'team celebration', stats: { appearances: 8, goals: 0, assists: 2 } },
  { id: '6', name: 'Davide Esposito', number: 10, role: 'Centrocampista', avatarUrl: 'https://picsum.photos/seed/p6/200/200', imageHint: 'focused player', stats: { appearances: 9, goals: 5, assists: 7 } },
  { id: '7', name: 'Francesco Romano', number: 11, role: 'Attaccante', avatarUrl: 'https://picsum.photos/seed/p7/200/200', imageHint: 'running athlete', stats: { appearances: 10, goals: 6, assists: 3 } },
  { id: '8', name: 'Paolo Colombo', number: 12, role: 'Portiere', avatarUrl: 'https://picsum.photos/seed/p8/200/200', imageHint: 'goalkeeper save', stats: { appearances: 0, goals: 0, assists: 0 } },
];

let matches: Match[] = [
  {
    id: '1',
    opponent: 'Old Boys FC',
    date: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
    location: 'Campo Comunale',
    isHome: true,
    result: { home: 3, away: 1 },
    status: 'completed'
  },
  {
    id: '2',
    opponent: 'Real Isola',
    date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    location: 'Stadio Isola',
    isHome: false,
    result: { home: 2, away: 2 },
    status: 'completed'
  },
  {
    id: '3',
    opponent: 'Virtus Città',
    date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    location: 'Campo Comunale',
    isHome: true,
    status: 'scheduled'
  },
  {
    id: '4',
    opponent: 'Atletico Provincia',
    date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    location: 'Campo Provinciale',
    isHome: false,
    status: 'scheduled'
  },
  {
    id: '5',
    opponent: 'Sporting Riviera',
    date: new Date(new Date().setDate(new Date().getDate() + 21)).toISOString(),
    location: 'Campo Comunale',
    isHome: true,
    status: 'scheduled'
  }
];

// Player Functions
export const getPlayers = () => players;
export const getPlayerById = (id: string) => players.find(p => p.id === id);

export const addPlayer = (playerData: {name: string, number: number, role: Role}): Player => {
    const newPlayer: Player = {
        ...playerData,
        id: `p_${new Date().getTime()}`,
        avatarUrl: `https://picsum.photos/seed/p${new Date().getTime()}/200/200`,
        imageHint: 'player portrait',
        stats: { appearances: 0, goals: 0, assists: 0 }
    };
    players.push(newPlayer);
    return newPlayer;
}

export const updatePlayer = (id: string, updates: Partial<Omit<Player, 'id' | 'stats'>>): Player | undefined => {
    const playerIndex = players.findIndex(p => p.id === id);
    if(playerIndex === -1) return undefined;

    const updatedPlayer = { ...players[playerIndex], ...updates };
    players[playerIndex] = updatedPlayer;
    return updatedPlayer;
}

export const deletePlayer = (id: string): boolean => {
    const initialLength = players.length;
    players = players.filter(p => p.id !== id);
    return players.length < initialLength;
}


// Match Functions
export const getMatches = () => matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
export const getMatchById = (id: string) => matches.find(m => m.id === id);


export const addMatch = (matchData: Omit<Match, 'id' | 'status' | 'result'>): Match => {
  const newMatch: Match = {
    ...matchData,
    id: `m_${new Date().getTime()}`,
    status: 'scheduled',
  };
  matches.push(newMatch);
  return newMatch;
};

export const updateMatch = (id: string, updates: Partial<Omit<Match, 'id'>>): Match | undefined => {
  const matchIndex = matches.findIndex(m => m.id === id);
  if (matchIndex === -1) return undefined;
  
  const updatedMatch = { ...matches[matchIndex], ...updates };
  matches[matchIndex] = updatedMatch;
  return updatedMatch;
};

export const deleteMatch = (id: string): boolean => {
  const initialLength = matches.length;
  matches = matches.filter(m => m.id !== id);
  return matches.length < initialLength;
};
