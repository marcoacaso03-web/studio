import { Shield } from 'lucide-react';
import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-start gap-4 border-b bg-primary px-4 text-primary-foreground shadow-md md:px-6">
       <Link href="/" className="flex items-center gap-2 font-semibold">
          <Shield className="h-6 w-6" />
          <span className="text-xl font-bold">PitchMan</span>
        </Link>
    </header>
  );
}
