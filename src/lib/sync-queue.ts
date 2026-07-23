import { db, type SyncMutation } from './db';
import { lineupRepository } from './repositories/lineup-repository';
import { eventRepository } from './repositories/event-repository';
import { playerRepository } from './repositories/player-repository';
import { matchRepository } from './repositories/match-repository';
import { statsRepository } from './repositories/stats-repository';
/**
 * Queue a mutation when the device is offline. The mutation is persisted in
 * Dexie and flushed to Firestore when connectivity returns.
 */
export async function enqueueMutation(m: Omit<SyncMutation, 'id' | 'createdAt'>): Promise<void> {
  await db.syncQueue.add({ ...m, createdAt: Date.now() });
}

export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

/**
 * Flush all queued mutations to Firestore in creation order. Only collections
 * that have an explicit offline mapping are applied; others are dropped with a
 * warning (they can be wired progressively). A failing mutation is kept in the
 * queue so one bad write doesn't block the rest. Returns mutations applied.
 */
export async function flushQueue(userId: string): Promise<number> {
  const pending = await db.syncQueue.orderBy('createdAt').toArray();
  if (pending.length === 0) return 0;

  let applied = 0;
  for (const mutation of pending) {
    try {
      if (mutation.collection === 'matchLineups') {
        // payload already includes matchId; repository signature: save(data, seasonId, userId)
        await lineupRepository.save(mutation.payload as any, mutation.seasonId!, userId);
      } else if (mutation.collection === 'matchEvents') {
        // eventRepository signatures:
        //   add(event, seasonId, userId)        -> event.matchId required
        //   update(id, matchId, seasonId, data)
        //   delete(id, matchId, seasonId)
        const payload = mutation.payload as any;
        if (mutation.action === 'add') {
          await eventRepository.add(payload, mutation.seasonId!, userId);
        } else if (mutation.action === 'update') {
          await eventRepository.update(mutation.docId, mutation.matchId!, mutation.seasonId!, payload);
        } else if (mutation.action === 'delete') {
          await eventRepository.delete(mutation.docId, mutation.matchId!, mutation.seasonId!);
        }
      } else if (mutation.collection === 'players') {
        // playerRepository.update(id, seasonId, updates)
        await playerRepository.update(mutation.docId, mutation.seasonId!, mutation.payload as any);
      } else if (mutation.collection === 'matches') {
        // matchRepository.update(id, seasonId, updates)
        await matchRepository.update(mutation.docId, mutation.seasonId!, mutation.payload as any);
      } else if (mutation.collection === 'playerMatchStats') {
        // statsRepository.upsert(matchId, seasonId, playerId, stats, userId)
        if (!mutation.matchId || !mutation.playerId) {
          console.warn('[sync] dropping playerMatchStats mutation missing matchId/playerId');
        } else {
          await statsRepository.upsert(mutation.matchId, mutation.seasonId!, mutation.playerId, mutation.payload as any, userId);
        }
      } else {
        // Not yet wired for offline — drop to avoid applying with wrong signature
        console.warn(`[sync] dropping unhandled offline mutation for ${mutation.collection}`);
      }
      await db.syncQueue.delete(mutation.id!);
      applied++;
    } catch (e) {
      console.error('[sync] mutation failed, keeping in queue', mutation, e);
    }
  }
  return applied;
}

/**
 * Wire online/offline listeners. Flushes the queue when the browser regains
 * connectivity. Returns a cleanup function.
 */
export function startSyncListeners(userId: string): () => void {
  if (typeof window === 'undefined') return () => {};
  const onOnline = () => {
    flushQueue(userId).then((n) => {
      if (n > 0) console.info(`[sync] flushed ${n} offline mutation(s)`);
    });
  };
  window.addEventListener('online', onOnline);
  // Attempt an initial flush in case we loaded already online with a backlog
  onOnline();
  return () => window.removeEventListener('online', onOnline);
}
