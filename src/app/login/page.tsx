"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, User, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
  };

  const handleInitializeAccount = async () => {
    if (!username || !password) {
      toast({
        variant: "destructive",
        title: "Dati mancanti",
        description: "Inserisci username e password per inizializzare l'account.",
      });
      return;
    }

    setIsLoading(true);
    const result = await signUp(username, password);
    if (result.success) {
      toast({
        title: "Account Inizializzato",
        description: `L'account ${username} è stato creato con successo. Accesso in corso...`,
      });
      router.push('/calendario');
    } else {
      toast({
        variant: "destructive",
        title: "Errore",
        description: result.error || "Impossibile creare l'account.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-[400px] shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary rounded-2xl">
              <Shield className="h-10 w-10 text-white fill-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter text-primary">PitchMan</CardTitle>
          <CardDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground/60">
            Sincronizzazione Cloud Attiva
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-wider">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="username"
                  type="text"
                  placeholder="username"
                  className="pl-10 h-11"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pt-2">
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary text-white hover:bg-primary/90 font-black uppercase text-sm"
              disabled={isLoading}
            >
              {isLoading ? "Verifica in corso..." : "Accedi al Pannello"}
            </Button>
            
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-bold">Oppure</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              onClick={handleInitializeAccount}
              className="w-full h-10 border-accent/30 text-accent hover:bg-accent/5 font-black uppercase text-[10px]"
              disabled={isLoading}
            >
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Inizializza nuovo account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
