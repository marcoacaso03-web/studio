
import { db } from '@/lib/db';
import type { Match } from '@/lib/types';

export type MatchCreateData = Omit<Match, 'id' | 'result'> & { status?: Match['status'] };

export const matchRepository = {
  async getAll(userId: string, seasonId?: string) {
    if (!userId || !seasonId) return [];
    const matches = await db.matches
      .where('userId').equals(userId)
      .and(m => m.seasonId === seasonId)
      .toArray();
    return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
  
  async getById(id: string) {
    if (!id) return undefined;
    return await db.matches.get(id);
  },

  async add(data: MatchCreateData) {
    const newMatch: Match = {
      status: 'scheduled',
      ...data,
      id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };
    await db.matches.add(newMatch);
    return newMatch;
  },

  async update(id: string, updates: Partial<Omit<Match, 'id' | 'userId'>>) {
    await db.matches.update(id, updates);
    return await db.matches.get(id);
  },

  async delete(id: string) {
    return await db.matches.delete(id);
  },
};
