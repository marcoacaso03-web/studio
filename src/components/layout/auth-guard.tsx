"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { SplashScreen } from '@/components/layout/splash-screen';


export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isInitialized && !isAuthenticated && pathname !== '/login' && pathname !== '/') {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, pathname, router, mounted]);

  const isLoginPage = pathname === '/login';
  const isRootPage = pathname === '/';

  // Hydration guard: show splash screen until mounted on client
  if (!mounted) {
    return <SplashScreen />;
  }

  // Se siamo sulla root o in login, non blocchiamo mai il rendering
  if (isLoginPage || isRootPage) {
    return <>{children}</>;
  }

  // Aspettiamo che firebase sia pronto
  if (!isInitialized) {
    return <SplashScreen />;
  }

  // Se non autenticato, reindirizziamo ma mostriamo splash nel frattempo
  if (!isAuthenticated) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}
