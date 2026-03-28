
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';


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

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Ambient glow di sfondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(172,229,4,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          {/* Glow verde neon attorno al logo */}
          <div className="absolute -inset-6 bg-brand-green/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -inset-2 bg-brand-green/5 rounded-full blur-xl" />
          <img src="/favicon-16x16.png" alt="App Logo" className="h-24 w-24 object-contain relative drop-shadow-[0_0_20px_rgba(172,229,4,0.5)]" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-black text-white tracking-tighter">PitchMan</h1>
          <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/40">Gestionale Tecnico</p>
        </div>

        {/* Barra progresso verde neon */}
        <div className="w-48 h-[3px] bg-white/5 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-brand-green shadow-[0_0_8px_rgba(172,229,4,0.8)] animate-progress-loading w-full origin-left rounded-full" />
        </div>
      </div>

      <div className="absolute bottom-8 text-white/25 text-[10px] font-bold uppercase tracking-[0.3em]">
        Caricamento Database...
      </div>
    </div>
  );
}
