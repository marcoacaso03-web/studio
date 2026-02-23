
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Shield } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary overflow-hidden">
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute -inset-4 bg-accent/20 rounded-full blur-2xl animate-pulse" />
          <Shield className="h-20 w-20 text-white fill-white relative" />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-black text-white tracking-tighter">PitchMan</h1>
          <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/50">Gestionale Tecnico</p>
        </div>

        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-accent animate-progress-loading w-full origin-left" />
        </div>
      </div>
      
      <div className="absolute bottom-8 text-white/30 text-[10px] font-bold uppercase tracking-widest">
        Caricamento Database Locale...
      </div>
    </div>
  );
}
