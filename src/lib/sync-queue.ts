import { db, type SyncMutation } from './db';
import { lineupRepository } from './repositories/lineup-repository';
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
