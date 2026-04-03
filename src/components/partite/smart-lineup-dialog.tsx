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
import { Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMatchDetailStore } from '@/store/useMatchDetailStore';
import { suggestLineup } from '@/ai/flows/suggest-lineup-flow';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SmartLineupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SmartLineupDialog({ open, onOpenChange }: SmartLineupDialogProps) {
  const [rawList, setRawList] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { allPlayers, saveLineup } = useMatchDetailStore();
  const { toast } = useToast();

  const handleSmartAnalyze = async () => {
    if (!rawList.trim()) return;

    setIsAnalyzing(true);
    try {
      const availablePlayers = allPlayers.map(p => ({ id: p.id, name: p.name }));
      const result = await suggestLineup({ rawList, availablePlayers });

      // Salviamo la formazione suggerita
      await saveLineup({
        matchId: "", // Gestito dallo store
        starters: result.starters,
        substitutes: result.substitutes,
      });

      toast({
        title: "Formazione Elaborata",
        description: "L'AI ha associato i giocatori. Controlla le posizioni prima di confermare.",
      });
      onOpenChange(false);
      setRawList('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore Smart Mode",
        description: error.message,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh] bg-background dark:bg-black">
        <DialogHeader className="p-6 bg-primary dark:bg-yellow-300 text-white dark:text-black shrink-0 relative transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 dark:bg-black/10 rounded-xl">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="uppercase font-black tracking-tight">AI Smart Lineup</DialogTitle>
              <DialogDescription className="text-white/60 dark:text-black/60 text-[10px] font-bold uppercase tracking-widest mt-1">
                Associazione Automatica Giocatori
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 bg-background dark:bg-black transition-colors">
          <div className="p-6 space-y-6">
            <Alert className="bg-muted dark:bg-card/50 border-border dark:border-brand-green/30 rounded-2xl transition-colors">
              <AlertCircle className="h-4 w-4 text-primary dark:text-white" />
              <AlertTitle className="text-[10px] font-black uppercase text-foreground dark:text-white mb-1">Attenzione</AlertTitle>
              <AlertDescription className="text-[11px] font-bold text-muted-foreground dark:text-white/40 uppercase leading-relaxed">
                Se l'AI non riconosce un nome, lascerà la posizione vuota. 
                <span className="text-foreground dark:text-white block mt-1">Verifica sempre la formazione dopo l'inserimento automatico.</span>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground dark:text-white/30 tracking-widest ml-1">Incolla la lista (es. da WhatsApp):</p>
              <Textarea
                placeholder="1. Rossi&#10;2. Bianchi&#10;3. Neri..."
                value={rawList}
                onChange={(e) => setRawList(e.target.value)}
                disabled={isAnalyzing}
                className="min-h-[200px] text-xs font-bold rounded-2xl bg-background dark:bg-black border-border dark:border-brand-green/30 focus-visible:ring-1 focus-visible:ring-primary dark:focus-visible:ring-brand-green text-foreground dark:text-white placeholder:text-muted-foreground/30 dark:placeholder:text-white/10"
              />
            </div>

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center p-8 bg-primary/5 dark:bg-accent/5 rounded-2xl border border-dashed border-primary/20 dark:border-accent/20 space-y-3 animate-in fade-in zoom-in">
                <Loader2 className="h-10 w-10 text-primary dark:text-accent animate-spin" />
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-primary dark:text-accent animate-pulse tracking-widest">L'AI sta leggendo la lista...</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold mt-1">Mappatura nomi in corso</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-0 flex-row gap-3 shrink-0 bg-background dark:bg-black transition-colors">
          <Button variant="ghost" className="flex-1 rounded-2xl font-black uppercase text-[10px] h-12 text-foreground dark:text-white hover:bg-muted dark:hover:bg-white/5 transition-colors" onClick={() => onOpenChange(false)} disabled={isAnalyzing}>
            Annulla
          </Button>
          <Button 
            onClick={handleSmartAnalyze} 
            className="flex-1 bg-primary dark:bg-black border border-primary dark:border-brand-green text-white dark:text-white hover:opacity-90 dark:hover:bg-brand-green/10 rounded-2xl font-black uppercase text-[10px] h-12 shadow-md dark:shadow-[0_0_15px_rgba(172,229,4,0.1)] transition-all" 
            disabled={isAnalyzing || !rawList.trim()}
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Inserisci Formazione"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
