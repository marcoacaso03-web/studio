"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  LayoutGrid,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icona Rugby Ball (Allenamento) come SVG manuale per evitare errori di import
const RugbyBallIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="m15.6 11.6-5.8-5.8" />
    <path d="m11.6 15.6-5.8-5.8" />
    <path d="M12 21c3.6 0 9-3.9 9-9s-5.4-9-9-9-9 3.9-9 9 5.4 9 9 9Z" />
    <path d="M14.8 5.2 5.2 14.8" />
    <path d="M18.8 9.2 9.2 18.8" />
  </svg>
);

const navItems = [
  { href: "/calendario", label: "Dashboard", icon: LayoutGrid },
  { href: "/allenamento", label: "Allenamento", icon: RugbyBallIcon },
  { href: "/scout", label: "Scout", icon: Search },
  { href: "/altro", label: "Impostazioni", icon: Settings },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 p-2 transition-all w-full",
        isActive ? "text-foreground dark:text-brand-green" : "text-muted-foreground/50 dark:text-muted-foreground/30"
      )}
    >
      <div className={cn(
        "transition-all duration-300 p-1.5 rounded-xl",
        isActive && "text-primary dark:text-brand-green shadow-sm dark:drop-shadow-[0_0_6px_rgba(172,229,4,0.8)] scale-110"
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <span className={cn(
        "text-[9px] font-black uppercase tracking-wider transition-colors",
        isActive ? "text-foreground dark:text-brand-green" : "text-muted-foreground/40 dark:text-muted-foreground/30"
      )}>
        {label}
      </span>
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
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-20 items-center justify-around bg-background md:hidden">
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-20 items-center justify-around bg-background dark:bg-black border-t border-border dark:border-brand-green/20 md:hidden px-4 pb-2 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}
