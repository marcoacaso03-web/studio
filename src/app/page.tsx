"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';


import { SplashScreen } from '@/components/layout/splash-screen';

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Piccolo ritardo per mostrare lo splash screen e assicurarsi che lo store sia idratato
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.push('/calendario');
      } else {
        router.push('/login');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  return <SplashScreen />;
}
