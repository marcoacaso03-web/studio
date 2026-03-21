
"use client";


import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: "/calendario", label: "Dashboard" },
  { href: "/allenamento", label: "Allenamento" },
  { href: "/scout", label: "Scout" },
  { href: "/altro", label: "Impostazioni" },
];

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const pathname = usePathname();
  
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-primary px-4 md:px-8 shadow-lg">
      <div className="flex items-center gap-10">
        <Link href="/" className="flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity">
          <div className="p-1.5 bg-white/10 rounded-xl">
            <img src="/favicon-16x16.png" alt="App Logo" className="h-7 w-7 object-contain drop-shadow" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter leading-none">PitchMan</span>
            <span className="text-[7px] uppercase font-bold tracking-[0.3em] text-white/40 mt-0.5">Tactical Manager</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent",
                  isActive 
                    ? "bg-accent text-accent-foreground shadow-md border-accent-foreground/10" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] font-black text-white uppercase leading-none">
              {user.username}
            </span>
            <span className="text-[8px] font-bold text-white/30 uppercase tracking-tighter mt-1">
              Online
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-black text-xs shadow-sm">
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
    </header>
  );
}
