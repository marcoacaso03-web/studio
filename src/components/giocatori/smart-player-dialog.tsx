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
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, AlertCircle, Info } from 'lucide-react';
import { importPlayersFromText } from '@/ai/flows/import-players-flow';
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SmartPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (players: { name: string, role: Role }[]) => Promise<void>;
}

export function SmartPlayerDialog({ open, onOpenChange, onSave }: SmartPlayerDialogProps) {
  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleSmartImport = async () => {
    if (!rawText.trim() || rawText.trim().length < 5) return;

    setIsAnalyzing(true);
    try {
      const result = await importPlayersFromText({ rawText: rawText.trim() });
      
      if (result.players.length === 0) {
        throw new Error("Nessun giocatore individuato. Controlla il formato del testo.");
      }

      await onSave(result.players as { name: string, role: Role }[]);

      toast({
        title: "Rosa Aggiornata",
        description: `Importati con successo ${result.players.length} giocatori.`,
      });
      onOpenChange(false);
      setRawText('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore Importazione Smart",
        description: error.message,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 bg-accent text-accent-foreground shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-card border-b p-6 text-foreground pb-10 rounded-xl">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="uppercase font-black tracking-tight">Smart Rosa Import</DialogTitle>
              <DialogDescription className="text-accent-foreground/70 text-[10px] font-bold uppercase tracking-widest mt-1">
                Inserimento Rapido tramite AI
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            <Alert className="bg-primary/5 border-primary/20 rounded-2xl">
              <AlertCircle className="h-4 w-4 text-foreground" />
              <AlertTitle className="text-[10px] font-black uppercase text-foreground mb-1">Guida all'uso</AlertTitle>
              <AlertDescription className="text-[11px] font-bold text-muted-foreground uppercase leading-relaxed">
                Incolla la lista dei giocatori dividendo per ruolo. 
                Esempio: <span className="text-foreground">"Difensori: Rossi, Bianchi. Centrocampisti: Verdi..."</span>
                <span className="text-foreground block mt-1">L'AI riconoscerà automaticamente i nomi e assegnerà il ruolo corretto. Verifica sempre eventuali errori dopo l'importazione.</span>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Testo della lista:</p>
              <Textarea
                placeholder="Esempio:&#10;Portieri: Buffon&#10;Difensori: Chiellini, Bonucci&#10;..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                disabled={isAnalyzing}
                className="min-h-[250px] text-xs font-bold rounded-2xl bg-muted/20 border-muted-foreground/20 focus:bg-background transition-all"
              />
            </div>

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center p-8 bg-accent/5 rounded-2xl border border-dashed border-accent/20 space-y-3 animate-in fade-in zoom-in">
                <Loader2 className="h-10 w-10 text-accent animate-spin" />
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-accent animate-pulse tracking-widest">L'AI sta analizzando la rosa...</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold mt-1">Categorizzazione ruoli in corso</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-0 flex-row gap-3 shrink-0">
          <Button variant="ghost" className="flex-1 rounded-2xl font-black uppercase text-[10px] h-12" onClick={() => onOpenChange(false)} disabled={isAnalyzing}>
            Annulla
          </Button>
          <Button 
            onClick={handleSmartImport} 
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl font-black uppercase text-[10px] h-12 shadow-lg shadow-accent/20" 
            disabled={isAnalyzing || !rawText.trim()}
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Importa Giocatori"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
