import { Shield } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-start gap-4 bg-primary px-4 md:px-6">
       <Link href="/" className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity">
          <Shield className="h-7 w-7 fill-white" />
          <span className="text-2xl font-black tracking-tighter">
            {user ? `Ciao ${user.username}!` : 'PitchMan'}
          </span>
        </Link>
    </header>
  );
}
