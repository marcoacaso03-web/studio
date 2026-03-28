
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';


export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && pathname !== '/login' && pathname !== '/') {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router, mounted]);

  const isLoginPage = pathname === '/login';
  const isRootPage = pathname === '/';

  if (!mounted) {
     return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <img src="/favicon-16x16.png" alt="App Logo" className="h-16 w-16 animate-pulse drop-shadow-[0_0_20px_rgba(172,229,4,0.5)]" />
      </div>
    );
  }

  // Se siamo sulla root o in login, non blocchiamo il rendering
  if (isLoginPage || isRootPage) {
    return <>{children}</>;
  }

  // Se non autenticato e non in pagine libere, mostriamo lo splash di caricamento mentre reindirizza
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <img src="/favicon-16x16.png" alt="App Logo" className="h-16 w-16 animate-pulse drop-shadow-[0_0_20px_rgba(172,229,4,0.5)]" />
      </div>
    );
  }

  return <>{children}</>;
}
