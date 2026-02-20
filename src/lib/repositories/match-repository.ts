import { db } from '@/lib/db';
import type { Match } from '@/lib/types';

// Include status in creation data if needed, but provide default
export type MatchCreateData = Omit<Match, 'id' | 'result'> & { status?: Match['status'] };

export const matchRepository = {
  async getAll(seasonId?: string) {
    if (!seasonId) return [];
    // Sort by date while filtering by seasonId
    return await db.matches.where('seasonId').equals(seasonId).sortBy('date');
  },
  
  async getById(id: string) {
    return await db.matches.get(id);
  },

  async add(data: MatchCreateData) {
    const newMatch: Match = {
      status: 'scheduled', // Default status
      ...data,
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };
    await db.matches.add(newMatch);
    return newMatch;
  },

  async update(id: string, updates: Partial<Omit<Match, 'id'>>) {
    await db.matches.update(id, updates);
    return await db.matches.get(id);
  },

  async delete(id: string) {
    return await db.matches.delete(id);
  },
};
