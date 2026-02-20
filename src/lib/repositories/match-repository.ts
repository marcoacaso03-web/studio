
import { db } from '@/lib/db';
import type { Match } from '@/lib/types';

export type MatchCreateData = Omit<Match, 'id' | 'status' | 'result'>;

export const matchRepository = {
  async getAll(seasonId?: string) {
    if (!seasonId) return [];
    return await db.matches.where('seasonId').equals(seasonId).sortBy('date');
  },
  
  async getById(id: string) {
    return await db.matches.get(id);
  },

  async add(data: MatchCreateData) {
    const newMatch: Match = {
      ...data,
      id: `m_${new Date().getTime()}`,
      status: 'scheduled',
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
