
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
    if (mounted && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [isAuthenticated, pathname, router, mounted]);

  // Se siamo sulla pagina di login, non mostriamo l'header e la navigazione del layout principale
  const isLoginPage = pathname === '/login';

  if (!mounted) return null;

  // Se non autenticato e non in login page, mostriamo uno stato vuoto mentre il router reindirizza
  if (!isAuthenticated && !isLoginPage) {
    return <div className="min-h-screen bg-background" />;
  }

  return <>{children}</>;
}
