"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(username, password);
    if (result.success) {
      router.push('/');
    } else {
      toast({
        variant: "destructive",
        title: "Accesso negato",
        description: result.error || "Username o password errati.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground font-sans">
      <div className="w-full max-w-[340px] flex flex-col items-center space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-48 h-48 relative">
            <img 
              src="/favicon-16x16_light.png" 
              alt="PitchMan Logo" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(0,128,255,0.3)] dark:hidden" 
            />
            <img 
              src="/favicon-16x16.png" 
              alt="PitchMan Logo" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] hidden dark:block" 
            />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">PitchMan</h1>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Input 
                id="username"
                type="text" 
                placeholder="Username (o Email)"
                className="h-12 bg-transparent border-primary/30 dark:border-neon-gradient rounded-xl px-4 focus-visible:ring-1 focus-visible:ring-primary dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 transition-all font-sans"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="relative group">
              <Input 
                id="password"
                type="password"
                placeholder="Password"
                className="h-12 bg-transparent border-primary/30 dark:border-neon-gradient rounded-xl px-4 focus-visible:ring-1 focus-visible:ring-primary dark:focus-visible:ring-0 dark:focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button 
              type="submit" 
              className="w-full h-14 bg-primary dark:bg-neon-gradient text-white dark:text-primary-foreground font-bold text-lg rounded-full shadow-md dark:shadow-none dark:glow-neon hover:opacity-90 transition-all border-none"
              disabled={isLoading}
            >
              {isLoading ? "ELABORAZIONE..." : "ACCEDI"}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
}
