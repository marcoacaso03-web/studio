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
import { Loader2, FileText, AlertCircle, RefreshCw, ClipboardCopy, Info } from 'lucide-react';
import { importMatchesFromText } from '@/ai/flows/import-matches-flow';
import { useToast } from '@/hooks/use-toast';
import { useMatchesStore } from '@/store/useMatchesStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImportTuttocampoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportTuttocampoDialog({ open, onOpenChange }: ImportTuttocampoDialogProps) {
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { bulkAdd } = useMatchesStore();
  const { defaultDuration } = useSettingsStore();

  const handleImport = async () => {
    if (!rawText.trim() || rawText.trim().length < 100) {
      toast({
        variant: "destructive",
        title: "Dati insufficienti",
        description: "Incolla una porzione più ampia della tabella del calendario.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await importMatchesFromText({ rawContent: rawText.trim() });

      const matchesToSave = result.matches.map(match => ({
        opponent: match.opponent,
        date: match.date,
        isHome: match.isHome,
        type: match.type as any,
        duration: defaultDuration,
        status: (new Date(match.date) < new Date() ? 'completed' : 'scheduled') as any,
      }));

      await bulkAdd(matchesToSave);

      toast({
        title: "Importazione completata",
        description: `Individuata squadra: ${result.teamName}. Aggiunte ${result.matches.length} partite.`,
      });
      onOpenChange(false);
      setRawText('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Importazione fallita",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl flex flex-col max-h-[90vh] bg-background dark:bg-black">
        <DialogHeader className="p-6 bg-card dark:bg-background text-foreground shrink-0 relative border-b border-border dark:border-white/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted dark:bg-white/5 rounded-2xl">
              <ClipboardCopy className="h-6 w-6 text-primary dark:text-brand-green" />
            </div>
            <div>
              <DialogTitle className="uppercase font-black tracking-tight text-xl text-foreground">Importazione Calendario</DialogTitle>
              <DialogDescription className="text-muted-foreground dark:text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                Metodo Rapido Copia-Incolla (AI)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 bg-background dark:bg-black transition-colors">
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted dark:bg-card/50 border border-border dark:border-brand-green/20 rounded-2xl border-dashed space-y-3 shadow-inner">
                <h4 className="text-[10px] font-black uppercase text-foreground dark:text-white tracking-widest flex items-center gap-2">
                  <Info className="h-3 w-3 text-primary dark:text-brand-green" /> Come fare:
                </h4>
                <div className="space-y-2 text-[11px] font-bold leading-relaxed text-muted-foreground dark:text-white/40 uppercase">
                  <div className="flex gap-2">
                    <span className="text-foreground dark:text-white">1.</span>
                    <p>Vai su <span className="text-foreground dark:text-white">Tuttocampo.it</span> e apri il calendario della tua squadra.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-foreground dark:text-white">2.</span>
                    <p>Seleziona tutta la tabella (<kbd className="bg-foreground/10 dark:bg-white/10 px-1 border border-foreground/10 dark:border-white/10 rounded text-[9px]">CTRL+A</kbd> su PC, o <span className="text-foreground dark:text-white">Seleziona Tutto</span> su Mobile).</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-foreground dark:text-white">3.</span>
                    <p>Copia il contenuto e incollalo nel box qui sotto.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground dark:text-white/30 tracking-widest ml-1">Incolla qui i dati della tabella:</p>
                <Textarea
                  placeholder="Esempio: 20/09/2024 15:00 Squadra A vs Squadra B..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  disabled={isLoading}
                  className="min-h-[200px] text-[11px] font-bold rounded-2xl bg-background dark:bg-black border-border dark:border-brand-green/30 focus-visible:ring-1 focus-visible:ring-primary dark:focus-visible:ring-brand-green text-foreground dark:text-white placeholder:text-muted-foreground/30 dark:placeholder:text-white/10 transition-colors"
                />
              </div>

              {isLoading && (
                <div className="flex flex-col items-center justify-center p-8 bg-primary/5 dark:bg-primary/5 rounded-2xl border border-dashed border-primary/20 space-y-3 animate-in fade-in zoom-in">
                  <Loader2 className="h-10 w-10 text-primary dark:text-foreground animate-spin" />
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-primary dark:text-foreground animate-pulse tracking-widest">L'AI sta leggendo i dati...</p>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold mt-1">Analisi avversari e date in corso</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-0 flex-row gap-3 shrink-0 bg-background dark:bg-black transition-colors">
          <Button variant="ghost" className="flex-1 rounded-2xl font-black uppercase text-[10px] h-12 text-foreground dark:text-white hover:bg-muted dark:hover:bg-white/5 transition-colors" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annulla
          </Button>
          <Button 
            onClick={handleImport} 
            className="flex-1 bg-primary dark:bg-black border border-primary dark:border-brand-green text-white dark:text-white hover:opacity-90 dark:hover:bg-brand-green/10 rounded-2xl font-black uppercase text-[10px] h-12 shadow-md dark:shadow-[0_0_15px_rgba(172,229,4,0.1)] transition-all" 
            disabled={isLoading || !rawText.trim()}
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : "Importa Calendario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
