"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Loader2, Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import { importMatchesFromUrl } from '@/ai/flows/import-matches-flow';
import { useToast } from '@/hooks/use-toast';
import { useMatchesStore } from '@/store/useMatchesStore';

interface ImportTuttocampoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportTuttocampoDialog({ open, onOpenChange }: ImportTuttocampoDialogProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { add } = useMatchesStore();

  const handleImport = async () => {
    if (!url.trim() || !url.includes('tuttocampo.it')) {
      toast({
        variant: "destructive",
        title: "URL non valido",
        description: "Inserisci un link valido della sezione Calendario di Tuttocampo.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await importMatchesFromUrl({ url: url.trim() });
      
      if (result.matches.length === 0) {
        toast({
          variant: "destructive",
          title: "Nessuna gara trovata",
          description: "L'AI non ha individuato partite nel link fornito.",
        });
        return;
      }

      // Aggiungiamo le partite una per una allo store
      let count = 0;
      for (const match of result.matches) {
        await add({
          opponent: match.opponent,
          date: match.date,
          isHome: match.isHome,
          type: match.type as any,
          duration: 90, // Default
          status: new Date(match.date) < new Date() ? 'completed' : 'scheduled',
        });
        count++;
      }

      toast({
        title: "Importazione completata",
        description: `Individuata squadra: ${result.teamName}. Aggiunte ${count} partite al calendario.`,
      });
      onOpenChange(false);
      setUrl('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore importazione",
        description: error.message || "Si è verificato un errore durante l'analisi del link.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5 text-primary" />
            <DialogTitle className="uppercase font-black text-primary">Importa Calendario</DialogTitle>
          </div>
          <DialogDescription className="text-xs font-medium">
            Incolla il link della sezione <strong>Calendario</strong> della tua squadra su Tuttocampo. L'AI estrarrà automaticamente tutte le gare.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Input
              placeholder="https://www.tuttocampo.it/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="text-xs font-bold"
            />
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
              Assicurati che il link termini con &apos;/Calendario&apos;
            </p>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-6 bg-muted/20 rounded-2xl border border-dashed border-primary/20 space-y-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-[10px] font-black uppercase text-primary animate-pulse">Analisi AI in corso...</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2">
          <Button variant="ghost" className="flex-1 rounded-xl font-bold uppercase text-xs h-11" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annulla
          </Button>
          <Button onClick={handleImport} className="flex-1 bg-primary hover:bg-primary/90 rounded-xl font-bold uppercase text-xs h-11" disabled={isLoading}>
            {isLoading ? "Elaborazione..." : "Avvia Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
