
"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [theme, mounted]);

  // Prevents hydration mismatch by not rendering theme-specific classes on server
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
