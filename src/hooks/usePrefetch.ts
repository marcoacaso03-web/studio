'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSeasonsStore } from '@/store/useSeasonsStore';
import { usePlayersStore } from '@/store/usePlayersStore';
import { useMatchesStore } from '@/store/useMatchesStore';
import { useTrainingStore } from '@/store/useTrainingStore';

/**
 * Prefetches critical data (players, matches, trainings) via Firestore
 * onSnapshot immediately after login and active season is available.
 * Subscribers are cleaned up and re-established when the active season changes.
 */
export function usePrefetch() {
  const user = useAuthStore((s) => s.user);
  const activeSeason = useSeasonsStore((s) => s.activeSeason);
  const subscribePlayers = usePlayersStore((s) => s.subscribe);
  const subscribeMatches = useMatchesStore((s) => s.subscribe);
  const subscribeTraining = useTrainingStore((s) => s.subscribe);

  const unsubscribersRef = useRef<(() => void)[]>([]);
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = user?.id;
    const seasonId = activeSeason?.id;

    if (!userId || !seasonId) return;

    const cacheKey = `${userId}:${seasonId}`;
    if (cacheKey === lastKeyRef.current) return;
    lastKeyRef.current = cacheKey;

    // Cleanup previous subscribers (season changed)
    unsubscribersRef.current.forEach((unsub) => unsub());
    unsubscribersRef.current = [];

    // Start all 3 subscriptions in parallel
    const unsubPlayers = subscribePlayers(userId, seasonId);
    const unsubMatches = subscribeMatches(userId, seasonId);
    const unsubTraining = subscribeTraining(userId, seasonId);

    unsubscribersRef.current = [unsubPlayers, unsubMatches, unsubTraining];

    return () => {
      unsubscribersRef.current.forEach((unsub) => unsub());
      unsubscribersRef.current = [];
    };
  }, [user?.id, activeSeason?.id, subscribePlayers, subscribeMatches, subscribeTraining]);
}
