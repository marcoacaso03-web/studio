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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Globe, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { importMatchesFromUrl } from '@/ai/flows/import-matches-flow';
import { useToast } from '@/hooks/use-toast';
import { useMatchesStore } from '@/store/useMatchesStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImportTuttocampoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportTuttocampoDialog({ open, onOpenChange }: ImportTuttocampoDialogProps) {
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'url' | 'manual'>('url');
  const { toast } = useToast();
  const { bulkAdd } = useMatchesStore();
  const { defaultDuration } = useSettingsStore();

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const payload = activeTab === 'url' ? { url: url.trim() } : { rawContent: rawText.trim() };
      
      if (activeTab === 'url' && (!url.trim() || !url.includes('tuttocampo.it'))) {
        throw new Error("Inserisci un link valido di Tuttocampo.");
      }
      if (activeTab === 'manual' && !rawText.trim()) {
        throw new Error("Incolla il testo della tabella.");
      }

      const result = await importMatchesFromUrl(payload);
      
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
      resetForm();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Importazione fallita",
        description: error.message,
      });
      // Se fallisce l'URL, suggeriamo il manuale
      if (activeTab === 'url') setActiveTab('manual');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setRawText('');
    setActiveTab('url');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 bg-primary text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="uppercase font-black tracking-tight">Importazione Calendario</DialogTitle>
              <DialogDescription className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">
                Alimentato dall'Intelligenza Artificiale
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none h-12 bg-muted/50 p-1">
            <TabsTrigger value="url" className="text-[10px] font-black uppercase rounded-none data-[state=active]:bg-background">Link Diretto</TabsTrigger>
            <TabsTrigger value="manual" className="text-[10px] font-black uppercase rounded-none data-[state=active]:bg-background">Copia-Incolla</TabsTrigger>
          </TabsList>

          <div className="p-6 space-y-4">
            <TabsContent value="url" className="mt-0 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Incolla URL Tuttocampo</p>
                <Input
                  placeholder="https://www.tuttocampo.it/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                  className="text-xs font-bold rounded-xl h-11"
                />
              </div>
              <div className="p-3 bg-muted/30 rounded-xl border border-dashed text-[10px] font-medium leading-relaxed">
                <AlertCircle className="h-3 w-3 inline mr-1 mb-0.5 text-primary" />
                Se il server non riesce a raggiungere il sito a causa di blocchi anti-bot, verrai reindirizzato alla modalità manuale.
              </div>
            </TabsContent>

            <TabsContent value="manual" className="mt-0 space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Istruzioni</p>
                <ol className="text-[10px] space-y-1 font-medium text-muted-foreground list-decimal pl-4">
                  <li>Vai sul sito di Tuttocampo</li>
                  <li>Seleziona e copia tutta la tabella del calendario</li>
                  <li>Incolla il testo qui sotto</li>
                </ol>
                <Textarea
                  placeholder="Incolla qui il contenuto della pagina..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  disabled={isLoading}
                  className="min-h-[150px] text-xs font-bold rounded-xl"
                />
              </div>
            </TabsContent>

            {isLoading && (
              <div className="flex flex-col items-center justify-center p-8 bg-primary/5 rounded-2xl border border-dashed border-primary/20 space-y-3 animate-in fade-in zoom-in">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-primary animate-pulse tracking-widest">Analisi AI in corso...</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold mt-1">Stiamo elaborando le partite</p>
                </div>
              </div>
            )}
          </div>
        </Tabs>

        <DialogFooter className="p-6 pt-0 flex-row gap-3">
          <Button variant="ghost" className="flex-1 rounded-2xl font-black uppercase text-[10px] h-12" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annulla
          </Button>
          <Button onClick={handleImport} className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl font-black uppercase text-[10px] h-12 shadow-lg" disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : "Avvia Analisi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
