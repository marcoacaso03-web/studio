
import { db } from '@/lib/db';
import type { Player, Role } from '@/lib/types';

export type PlayerCreateData = {
    name: string;
    role: Role;
}

export const playerRepository = {
  async getAll() {
    return await db.players.orderBy('name').toArray();
  },

  async getById(id: string) {
    return await db.players.get(id);
  },

  async add(data: PlayerCreateData) {
    const newPlayer: Player = {
      id: `p_${new Date().getTime()}`,
      name: data.name,
      role: data.role,
      avatarUrl: `https://picsum.photos/seed/p${new Date().getTime()}/200/200`,
      imageHint: 'player portrait',
      stats: { appearances: 0, goals: 0, assists: 0, avgMinutes: 0 },
    };
    await db.players.add(newPlayer);
    return newPlayer;
  },

  async update(id: string, updates: Partial<PlayerCreateData>) {
    await db.players.update(id, updates);
    return await db.players.get(id);
  },

  async delete(id: string) {
    return await db.players.delete(id);
  },
};
