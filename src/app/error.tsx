"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Neon Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />
        
        <PageHeader title="Errore di Sistema" />
        
        <Card className="max-w-md w-full bg-black/40 border-brand-green/30 shadow-[0_0_30px_rgba(172,229,4,0.1)] rounded-[2rem] overflow-hidden backdrop-blur-xl relative z-10">
            <CardHeader className="text-center pb-2 pt-8">
                <div className="h-20 w-20 bg-black border-2 border-brand-green/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(172,229,4,0.1)]">
                    <span className="text-4xl font-black text-brand-green">!</span>
                </div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight text-white mb-2 italic">Oops! Qualcosa è andato storto.</CardTitle>
                <CardDescription className="text-xs font-black uppercase text-muted-foreground/40 tracking-widest leading-loose">
                    L'applicazione ha riscontrato un problema imprevisto durante l'esecuzione.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-10 text-center">
                <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/30 mb-8 max-w-[280px] mx-auto leading-relaxed">
                    Puoi provare a ricaricare la pagina. Se il problema persiste, contatta il supporto tecnico.
                </p>
                <Button
                    onClick={() => reset()}
                    className="w-full bg-black border border-brand-green/40 hover:bg-brand-green h-14 rounded-2xl text-white font-black uppercase tracking-widest transition-all hover:text-black hover:shadow-[0_0_20px_rgba(172,229,4,0.4)] active:scale-[0.98]"
                >
                    Ricarica Pagina
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
