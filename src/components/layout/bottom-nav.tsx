
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Dumbbell,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icona personalizzata: Lavagna Tattica
const TacticalBoardIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 12h18" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v3" />
    <path d="M12 18v3" />
    <path d="M16 16l2 2" />
    <path d="M18 16l-2 2" />
    <circle cx="7" cy="7" r="1" />
  </svg>
);

// Icona personalizzata: Fischietto
const WhistleIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M11 14h4" />
    <path d="M17 10h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4" />
    <rect x="2" y="10" width="15" height="10" rx="2" />
    <path d="M12 10V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4" />
    <circle cx="8" cy="14" r="1" />
  </svg>
);

const navItems = [
  { href: "/calendario", label: "Dashboard", icon: TacticalBoardIcon },
  { href: "/allenamento", label: "Allenamento", icon: Dumbbell },
  { href: "/scout", label: "Scout", icon: Search },
  { href: "/altro", label: "Impostazioni", icon: WhistleIcon },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 p-2 text-muted-foreground transition-all hover:text-primary w-full",
        isActive && "text-primary"
      )}
    >
      <Icon className="h-6 w-6" />
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </Link>
  );
}

export function BottomNav() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t bg-background shadow-[0_-1px_3px_rgba(0,0,0,0.1)] md:hidden">
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t bg-background shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden px-2">
      {navItems.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}
