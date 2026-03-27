"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signUp, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/calendario');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isLogin) {
      const result = await login(username, password);
      if (result.success) {
        router.push('/calendario');
      } else {
        toast({
          variant: "destructive",
          title: "Accesso negato",
          description: result.error || "Username o password errati.",
        });
        setIsLoading(false);
      }
    } else {
      const result = await signUp(username, password);
      if (result.success) {
        toast({
          title: "Account Creato",
          description: `Benvenuto ${username}! Il tuo spazio cloud è pronto.`,
        });
        router.push('/calendario');
      } else {
        toast({
          variant: "destructive",
          title: "Errore registrazione",
          description: result.error || "Impossibile creare l'account.",
        });
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground font-sans">
      <div className="w-full max-w-[340px] flex flex-col items-center space-y-8">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-48 h-48 relative">
            <img 
              src="/favicon-16x16.png" 
              alt="PitchMan Logo" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" 
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
                className="h-12 bg-transparent border-neon-gradient rounded-xl px-4 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 transition-all font-sans"
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
                className="h-12 bg-transparent border-neon-gradient rounded-xl px-4 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button 
              type="submit" 
              className="w-full h-14 bg-neon-gradient text-primary-foreground font-bold text-lg rounded-full glow-neon hover:opacity-90 transition-all border-none"
              disabled={isLoading}
            >
              {isLoading ? "ELABORAZIONE..." : isLogin ? "ACCEDI" : "REGISTRATI"}
            </Button>
            
            <div className="text-center">
              <button 
                type="button"
                className="text-sm font-medium text-foreground underline hover:opacity-80 transition-colors"
              >
                Password dimenticata?
              </button>
            </div>
          </div>
        </form>

        {/* Toggle Login/Signup */}
        <div className="pt-4">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? "Crea un nuovo account" : "Hai già un account? Accedi"}
          </button>
        </div>
      </div>
    </div>
  );
}
