"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { startSyncListeners } from "@/lib/sync-queue";

/**
 * Starts the offline sync queue listeners. When the browser regains
 * connectivity, any mutations queued while offline are flushed to Firestore.
 * Renders nothing.
 */
export function OfflineSyncProvider() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user?.id) return;
    const cleanup = startSyncListeners(user.id);
    return cleanup;
  }, [user?.id]);

  return null;
}
