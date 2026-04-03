"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow — adattivo al tema */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <Card className="max-w-md w-full bg-card border border-primary/20 shadow-lg dark:shadow-[0_0_30px_rgba(172,229,4,0.08)] rounded-[2rem] overflow-hidden backdrop-blur-xl relative z-10">
        <CardHeader className="text-center pb-2 pt-8">
          {/* Icona errore */}
          <div className="h-20 w-20 bg-background border-2 border-primary/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm dark:shadow-[0_0_20px_rgba(172,229,4,0.1)]">
            <AlertTriangle className="h-9 w-9 text-primary" />
          </div>

          <CardTitle className="text-2xl font-black uppercase tracking-tight text-foreground mb-2">
            Oops! Qualcosa è andato storto.
          </CardTitle>

          <CardDescription className="text-xs font-bold uppercase text-muted-foreground tracking-widest leading-loose">
            L'applicazione ha riscontrato un problema imprevisto durante l'esecuzione.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-10 text-center space-y-6">
          {/* Dettaglio errore (solo in sviluppo) */}
          {error?.message && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-3">
              <p className="text-[11px] font-mono text-destructive/80 break-all leading-relaxed">
                {error.message}
              </p>
            </div>
          )}

          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
            Puoi provare a ricaricare la pagina. Se il problema persiste, contatta il supporto tecnico.
          </p>

          <Button
            onClick={() => reset()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-sm dark:shadow-[0_0_20px_rgba(172,229,4,0.25)]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Ricarica Pagina
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
