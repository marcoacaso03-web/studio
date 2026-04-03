
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { SplashScreen } from '@/components/layout/splash-screen';


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
     return <SplashScreen />;
  }

  // Se siamo sulla root o in login, non blocchiamo il rendering
  if (isLoginPage || isRootPage) {
    return <>{children}</>;
  }

  // Se non autenticato e non in pagine libere, mostriamo lo splash di caricamento mentre reindirizza
  if (!isAuthenticated) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
