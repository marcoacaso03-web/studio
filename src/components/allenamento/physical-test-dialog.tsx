'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TestResult, Player, PhysicalTest } from '@/lib/types';
import { testRepository } from '@/lib/repositories/test-repository';
import { useAuthStore } from '@/store/useAuthStore';
import { useSeasonsStore } from '@/store/useSeasonsStore';
import { formatValue } from '@/lib/test-utils';
import { Loader2, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sortResults } from '@/lib/test-utils';

interface PhysicalTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
  players: Player[];
}

type Step = 1 | 2;

const TYPE_PRESETS: Record<string, { name: string; suggestions: string[]; defaultUnit: string }> = {
  velocita: {
    name: 'Velocità',
    suggestions: ['30 metri', '60 metri', '100 metri'],
    defaultUnit: 'secondi',
  },
  resistenza: {
    name: 'Resistenza',
    suggestions: ['Test di Cooper (12 min)', 'Yo-Yo', 'Navetta'],
    defaultUnit: 'metri',
  },
};

export function PhysicalTestDialog({ open, onOpenChange, onCreated, players }: PhysicalTestDialogProps) {
  const { user } = useAuthStore();
  const { activeSeason } = useSeasonsStore();

  const [step, setStep] = useState<Step>(1);
  const [testType, setTestType] = useState<string>('velocita');
  const [testName, setTestName] = useState('');
  const [unit, setUnit] = useState('secondi');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState<Map<string, string>>(new Map());
  const [saving, setSaving] = useState(false);

  const resetForm = useCallback(() => {
    setStep(1);
    setTestType('velocita');
    setTestName('');
    setUnit('secondi');
    setDate(new Date().toISOString().split('T')[0]);
    setResults(new Map());
    setSaving(false);
  }, []);

  const handleTypeChange = (type: string) => {
    setTestType(type);
    if (type !== 'personalizzato' && TYPE_PRESETS[type]) {
      setUnit(TYPE_PRESETS[type].defaultUnit);
      setTestName('');
    }
  };

  const handleSuggestionClick = (name: string) => {
    setTestName(name);
  };

  const handleResultChange = (playerId: string, value: string) => {
    setResults(prev => {
      const next = new Map(prev);
      next.set(playerId, value);
      return next;
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const getPlayerName = (id: string): string => {
    const p = players.find(pl => pl.id === id);
    return p ? `${p.lastName} ${p.firstName}` : '?';
  };

  // For step 2 live standings
  const liveResults: { playerId: string; value: number }[] = [];
  for (const [playerId, val] of results) {
    const num = parseFloat(val);
    if (!isNaN(num) && val.trim() !== '') {
      liveResults.push({ playerId, value: num });
    }
  }
  const sortedLive = sortResults(liveResults, unit, getPlayerName);

  const handleSave = async () => {
    if (!testName.trim() || !user || !activeSeason) return;
    setSaving(true);
    let testResults: TestResult[] = [];
    for (const [playerId, val] of results) {
      const num = parseFloat(val);
      if (!isNaN(num) && val.trim() !== '') {
        testResults.push({ playerId, value: num });
      }
    }
    if (testResults.length === 0) {
      setSaving(false);
      return;
    }

    console.log('📝 Creating test:', { userId: user.id, seasonId: activeSeason.id, name: testName.trim(), type: testType, unit, date: new Date(date).toISOString(), resultsCount: testResults.length });

    try {
      const id = await testRepository.create(user.id, activeSeason.id, {
        name: testName.trim(),
        type: testType,
        unit,
        date: new Date(date).toISOString(),
        results: testResults,
      });

      console.log('✅ Test created with id:', id);
      onCreated(id);
      resetForm();
    } catch (err) {
      console.error("❌ Save test error:", err);
      console.error("  user:", user?.id, "season:", activeSeason?.id);
      console.error("  testName:", testName, "type:", testType, "unit:", unit, "date:", date);
      console.error("  results:", testResults);
    } finally {
      setSaving(false);
    }
  };

  const canAdvance = testName.trim().length > 0;
  const hasResults = liveResults.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[28px] bg-card dark:bg-black border border-border dark:border-brand-green/30 shadow-xl dark:shadow-[0_0_25px_rgba(172,229,4,0.05)] p-6 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-foreground dark:text-white font-black uppercase text-xl tracking-tight">
            {step === 1 ? 'Nuovo Test' : 'Risultati'}
          </DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {step === 1 ? 'Seleziona tipo, nome e unità di misura' : 'Inserisci i risultati per ogni giocatore'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Tipo</Label>
              <Select value={testType} onValueChange={handleTypeChange}>
                <SelectTrigger className="h-11 text-xs font-bold uppercase rounded-xl bg-background dark:bg-black border border-border dark:border-brand-green/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="velocita" className="text-xs font-bold">Velocità</SelectItem>
                  <SelectItem value="resistenza" className="text-xs font-bold">Resistenza</SelectItem>
                  <SelectItem value="personalizzato" className="text-xs font-bold">Personalizzato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Nome</Label>
              <Input
                value={testName}
                onChange={e => setTestName(e.target.value)}
                placeholder="Es. 30 metri"
                disabled={saving}
                className="h-11 text-xs font-bold uppercase rounded-xl bg-background dark:bg-black border border-border dark:border-brand-green/20"
              />
              {testType !== 'personalizzato' && TYPE_PRESETS[testType] && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {TYPE_PRESETS[testType].suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSuggestionClick(s)}
                      className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase border border-border dark:border-brand-green/20 text-muted-foreground hover:border-primary dark:hover:border-brand-green transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Unità di misura</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className="h-11 text-xs font-bold uppercase rounded-xl bg-background dark:bg-black border border-border dark:border-brand-green/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="secondi" className="text-xs font-bold">Secondi (meno = meglio)</SelectItem>
                  <SelectItem value="metri" className="text-xs font-bold">Metri (più = meglio)</SelectItem>
                  <SelectItem value="altro" className="text-xs font-bold">Altro (discendente)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 ml-1">Data</Label>
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                disabled={saving}
                className="h-11 text-xs font-bold uppercase rounded-xl bg-background dark:bg-black border border-border dark:border-brand-green/20"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-2 max-h-[60vh] overflow-y-auto">
            {/* Results input */}
            <div className="space-y-2">
              {players.map(player => (
                <div key={player.id} className="flex items-center gap-2 px-2">
                  <span className="text-[10px] font-bold flex-1 truncate">
                    {player.lastName} {player.firstName}
                  </span>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="—"
                      value={results.get(player.id) ?? ''}
                      onChange={e => handleResultChange(player.id, e.target.value)}
                      className="w-24 h-9 text-right text-xs font-black rounded-lg bg-background dark:bg-black border border-border dark:border-brand-green/20 pr-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/40 font-bold">
                      {unit === 'secondi' ? 's' : unit === 'metri' ? 'm' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Live standings */}
            {sortedLive.length > 0 && (
              <div className="space-y-1 mt-4 pt-4 border-t border-border dark:border-brand-green/20">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-500/80 flex items-center gap-1">
                  Classifica sessione
                </span>
                {sortedLive.map((entry, idx) => (
                  <div key={entry.playerId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/5 dark:bg-card/5">
                    <span className="w-4 text-center text-[10px] font-black text-muted-foreground/60">{idx + 1}</span>
                    <span className="flex-1 text-[10px] font-bold truncate">{getPlayerName(entry.playerId)}</span>
                    <span className="text-[10px] font-black">{formatValue(entry.value, unit)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-4 flex-row gap-3">
          {step === 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest h-12 text-muted-foreground hover:bg-muted dark:hover:bg-white/5 transition-all"
                onClick={() => handleOpenChange(false)}
              >
                Annulla
              </Button>
              <Button
                type="button"
                disabled={saving || !canAdvance}
                className="flex-1 bg-primary dark:bg-black border-2 border-primary dark:border-brand-green text-white dark:text-brand-green font-black uppercase text-[10px] tracking-widest h-12 shadow-sm dark:shadow-[0_0_15px_rgba(172,229,4,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
                onClick={() => setStep(2)}
              >
                Avanti
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                className="flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest h-12 text-muted-foreground hover:bg-muted dark:hover:bg-white/5 transition-all"
                onClick={() => setStep(1)}
              >
                Indietro
              </Button>
              <Button
                type="button"
                disabled={saving || !hasResults}
                className="flex-1 bg-primary dark:bg-black border-2 border-primary dark:border-brand-green text-white dark:text-brand-green font-black uppercase text-[10px] tracking-widest h-12 shadow-sm dark:shadow-[0_0_15px_rgba(172,229,4,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100"
                onClick={handleSave}
              >
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvataggio...</>
                ) : (
                  'Salva Test'
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
