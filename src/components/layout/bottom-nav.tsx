"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/membri", label: "Membri", icon: Users },
  { href: "/statistiche", label: "Statistiche", icon: BarChart3 },
  { href: "/altro", label: "Altro", icon: Settings },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  // will match /calendario and /calendario/123
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
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t bg-background shadow-[0_-1px_3px_rgba(0,0,0,0.1)] md:hidden">
      {navItems.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}
