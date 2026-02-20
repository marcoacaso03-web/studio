
"use client";

import { usePathname } from 'next/navigation';
import { AppHeader } from './app-header';

export function AppHeaderWrapper() {
  const pathname = usePathname();
  if (pathname === '/login') return null;
  return <AppHeader />;
}
