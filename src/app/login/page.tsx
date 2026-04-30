"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FaGoogle } from 'react-icons/fa';

export default function LoginPage() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [username, setUsername] = useState(''); // Only for registration
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signUp, loginWithGoogle, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "La password deve contenere almeno 8 caratteri.";
    if (!/\d/.test(pwd)) return "La password deve contenere almeno un numero.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "La password deve contenere almeno un carattere speciale.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isLoginMode) {
      const result = await login(usernameOrEmail, password);
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
    } else {
      if (password !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Le password non coincidono.",
        });
        setIsLoading(false);
        return;
      }
      
      const pwdError = validatePassword(password);
      if (pwdError) {
        toast({
          variant: "destructive",
          title: "Password debole",
          description: pwdError,
        });
        setIsLoading(false);
        return;
      }

      const result = await signUp(usernameOrEmail, password, username);
      if (result.success) {
        toast({
          title: "Registrazione completata",
          description: "Account creato con successo.",
        });
        router.push('/');
      } else {
        toast({
          variant: "destructive",
          title: "Errore di registrazione",
          description: result.error || "Errore durante la creazione dell'account.",
        });
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await loginWithGoogle();
    if (result.success) {
      router.push('/');
    } else {
      toast({
        variant: "destructive",
        title: "Errore Google Auth",
        description: result.error || "Errore durante l'accesso con Google.",
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
          <p className="text-sm text-muted-foreground">{isLoginMode ? "Accedi al tuo account" : "Crea un nuovo account"}</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-3">
            {!isLoginMode && (
              <Input 
                id="username"
                type="text" 
                placeholder="Nome Utente"
                className="h-12 bg-transparent border-primary/30 dark:border-neon-gradient rounded-xl px-4 focus-visible:ring-1 focus-visible:ring-primary dark:focus-visible:ring-0 placeholder:text-muted-foreground/50 transition-all font-sans"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLoginMode}
              />
            )}
            
            <Input 
              id="usernameOrEmail"
              type={isLoginMode ? "text" : "email"}
              placeholder={isLoginMode ? "Username o Email" : "Email"}
              className="h-12 bg-transparent border-primary/30 dark:border-neon-gradient rounded-xl px-4 focus-visible:ring-1 focus-visible:ring-primary dark:focus-visible:ring-0 placeholder:text-muted-foreground/50 transition-all font-sans"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
            />
            
            <Input 
              id="password"
              type="password"
              placeholder="Password"
              className="h-12 bg-transparent border-primary/30 dark:border-neon-gradient rounded-xl px-4 focus-visible:ring-1 focus-visible:ring-primary dark:focus-visible:ring-0 placeholder:text-muted-foreground/50 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {!isLoginMode && (
              <Input 
                id="confirmPassword"
                type="password"
                placeholder="Conferma Password"
                className="h-12 bg-transparent border-primary/30 dark:border-neon-gradient rounded-xl px-4 focus-visible:ring-1 focus-visible:ring-primary dark:focus-visible:ring-0 placeholder:text-muted-foreground/50 transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!isLoginMode}
              />
            )}
          </div>

          <div className="space-y-4 pt-2">
            <Button 
              type="submit" 
              className="w-full h-14 bg-primary dark:bg-neon-gradient text-white dark:text-primary-foreground font-bold text-lg rounded-full shadow-md dark:shadow-none dark:glow-neon hover:opacity-90 transition-all border-none"
              disabled={isLoading}
            >
              {isLoading ? "ELABORAZIONE..." : (isLoginMode ? "ACCEDI" : "REGISTRATI")}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">OPPURE</span>
              </div>
            </div>

            <Button 
              type="button" 
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full h-12 bg-transparent border-primary/30 hover:bg-primary/5 dark:border-neon-gradient dark:hover:bg-white/5 text-foreground font-bold rounded-full transition-all flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <FaGoogle className="w-5 h-5 text-blue-500" />
              <span>Continua con Google</span>
            </Button>
          </div>
        </form>

        <div className="text-sm text-center">
          <span className="text-muted-foreground">
            {isLoginMode ? "Non hai un account? " : "Hai già un account? "}
          </span>
          <button 
            type="button"
            className="text-primary dark:text-brand-green font-bold hover:underline"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setUsernameOrEmail('');
              setPassword('');
              setConfirmPassword('');
              setUsername('');
            }}
          >
            {isLoginMode ? "Registrati" : "Accedi"}
          </button>
        </div>
      </div>
    </div>
  );
}
