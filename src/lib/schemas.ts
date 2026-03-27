
import { z } from 'zod';

export const RoleSchema = z.enum(['Portiere', 'Difensore', 'Centrocampista', 'Attaccante']);

export const PlayerStatsSchema = z.object({
  appearances: z.number().default(0),
  goals: z.number().default(0),
  assists: z.number().default(0),
  avgMinutes: z.number().default(0),
  yellowCards: z.number().optional().default(0),
  redCards: z.number().optional().default(0),
});

export const PlayerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  teamOwnerId: z.string(),
  teamId: z.string(),
  seasonId: z.string(),
  name: z.string(),
  role: RoleSchema,
  stats: PlayerStatsSchema,
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const MatchTypeSchema = z.enum(['Campionato', 'Torneo', 'Amichevole']);

export const MatchResultSchema = z.object({
  home: z.number().default(0),
  away: z.number().default(0),
});

export const MatchStatusSchema = z.enum(['scheduled', 'completed', 'canceled']);

export const MatchSchema = z.object({
  id: z.string(),
  userId: z.string(),
  teamOwnerId: z.string(),
  teamId: z.string(),
  seasonId: z.string(),
  opponent: z.string(),
  date: z.string(),
  isHome: z.boolean(),
  type: MatchTypeSchema,
  duration: z.number().default(60),
  result: MatchResultSchema.optional(),
  status: MatchStatusSchema.default('scheduled'),
  notes: z.string().optional().default(''),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const TrainingStatusSchema = z.enum(['presente', 'ritardo', 'assente']);

export const TrainingAttendanceSchema = z.object({
  playerId: z.string(),
  status: TrainingStatusSchema,
});

export const TrainingSessionSchema = z.object({
  id: z.string(),
  index: z.number(),
  date: z.string(),
  notes: z.string().catch('').optional().default(''),
  focus: z.string().catch('').optional().default(''),
  seasonId: z.string(),
  userId: z.string(),
  attendances: z.array(z.any()).optional().default([]), // Denormalized attendances in session doc
});

export const SeasonSchema = z.object({
  id: z.string(),
  userId: z.string(),
  ownerId: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const ScoutCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  colorHex: z.string().default('#00FF00'),
});

export const ScoutPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().default('Attaccante'),
  currentTeam: z.string().default(''),
  categoryIds: z.array(z.string()).optional().default([]),
  notes: z.string().optional().default(''),
  userId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
