'use client';

import { usePrefetch } from './usePrefetch';

export function PrefetchProvider({ children }: { children: React.ReactNode }) {
  usePrefetch();
  return <>{children}</>;
}
