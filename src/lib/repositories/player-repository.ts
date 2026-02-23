import { db } from '@/lib/db';
import type { Player, Role } from '@/lib/types';
import { PlaceHolderImages } from '../placeholder-images';

export type PlayerCreateData = {
    name: string;
    role: Role;
    seasonId: string;
    userId: string;
}

export const playerRepository = {
  async getAll(userId: string, seasonId?: string) {
    if (!userId || !seasonId) return [];
    const players = await db.players
      .where('userId').equals(userId)
      .and(p => p.seasonId === seasonId)
      .toArray();
    return players.sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string) {
    if (!id) return undefined;
    return await db.players.get(id);
  },

  async add(data: PlayerCreateData) {
    const placeholder = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
    const newPlayer: Player = {
      id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: data.userId,
      seasonId: data.seasonId,
      name: data.name,
      role: data.role,
      avatarUrl: placeholder.imageUrl,
      imageHint: placeholder.imageHint,
      stats: { appearances: 0, goals: 0, assists: 0, avgMinutes: 0 },
    };
    await db.players.add(newPlayer);
    return newPlayer;
  },

  async bulkAdd(playersData: { name: string, role: Role }[], userId: string, seasonId: string) {
    const timestamp = Date.now();
    const newPlayers: Player[] = playersData.map((p, index) => {
      const placeholder = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)];
      return {
        id: `p_${timestamp}_${index}_${Math.random().toString(36).substr(2, 5)}`,
        userId,
        seasonId,
        name: p.name,
        role: p.role,
        avatarUrl: placeholder.imageUrl,
        imageHint: placeholder.imageHint,
        stats: { appearances: 0, goals: 0, assists: 0, avgMinutes: 0 },
      };
    });

    await db.players.bulkAdd(newPlayers);
    return newPlayers;
  },

  async update(id: string, updates: Partial<Omit<PlayerCreateData, 'seasonId' | 'userId'>>) {
    await db.players.update(id, updates);
    return await db.players.get(id);
  },

  async delete(id: string) {
    return await db.players.delete(id);
  },
};
