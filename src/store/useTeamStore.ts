'use client';

import { create } from 'zustand';
import type { UserProfile, AccountRole } from '@/lib/types';
import type { Season } from '@/lib/types';

/**
 * Single source of truth for CROSS-CUTTING team context.
 *
 * This store intentionally does NOT hold domain data (players, matches,
 * trainings…) — those live in their dedicated per-feature stores
 * (usePlayersStore, useMatchesStore, useTrainingsStore, …) which remain the
 * owners of their own collections and Firestore queries.
 *
 * What it centralises instead is the *coordination* state that every
 * feature store used to read via getState() from multiple places:
 *   - the active season
 *   - the authenticated user + role
 *   - a "team ready" flag (all bootstrap subscriptions established)
 *
 * Components should read the active season / user / role from HERE, so the
 * "who owns what" question has one answer:
 *   - team context  -> useTeamStore
 *   - players        -> usePlayersStore
 *   - matches        -> useMatchesStore
 *   - trainings      -> useTrainingStore
 *   - statistics     -> useStatsStore
 *   - settings       -> useSettingsStore
 */

interface TeamContextState {
  user: UserProfile | null;
  role: AccountRole | null;
  activeSeason: Season | null;
  teamReady: boolean;
  setUser: (user: UserProfile | null) => void;
  setRole: (role: AccountRole | null) => void;
  setActiveSeason: (season: Season | null) => void;
  setTeamReady: (ready: boolean) => void;
}

export const useTeamStore = create<TeamContextState>((set) => ({
  user: null,
  role: null,
  activeSeason: null,
  teamReady: false,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setActiveSeason: (activeSeason) => set({ activeSeason }),
  setTeamReady: (teamReady) => set({ teamReady }),
}));

/** Stable selector helpers — use with useTeamStore(selector) to avoid re-renders. */
export const selectActiveSeasonId = (s: TeamContextState) => s.activeSeason?.id ?? null;
export const selectUserId = (s: TeamContextState) => s.user?.uid ?? null;
export const selectIsDeveloper = (s: TeamContextState) => s.role === 'developer';
export const selectIsDirector = (s: TeamContextState) =>
  s.role === 'director' || s.role === 'developer';
