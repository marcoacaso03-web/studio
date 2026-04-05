"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Info, HelpCircle, Trophy, Users, Calendar, Activity, Settings, Zap } from "lucide-react"

export function GuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white dark:bg-black font-black text-xs text-foreground dark:text-white shadow-sm transition-all hover:bg-muted dark:hover:bg-brand-green/10 dark:border-brand-green/30 dark:shadow-[0_0_12px_rgba(172,229,4,0.15)] group shrink-0"
          title="Guida al setup"
        >
          <span className="group-hover:scale-110 transition-transform">?</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden border-border dark:border-brand-green/30 dark:shadow-[0_0_20px_rgba(172,229,4,0.1)]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-2xl font-black italic uppercase tracking-tighter">
            <Trophy className="h-6 w-6 text-brand-green" />
            Benvenuto su <span className="text-brand-green">PitchMan</span>!
          </DialogTitle>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            La tua piattaforma per la gestione tattica e statistica del team
          </p>
        </DialogHeader>

        <ScrollArea className="h-full max-h-[calc(85vh-100px)] px-6 py-4">
          <div className="space-y-8 pb-8">
            {/* SETUP SECTION */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-green/10 border border-brand-green/20 rounded-lg w-fit">
                <Zap className="h-4 w-4 text-brand-green fill-brand-green" />
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-green">
                  Primo Avvio: Configurazione
                </h3>
              </div>

              <div className="grid gap-6">
                {[
                  {
                    step: "1",
                    title: "Gestione Squadra",
                    icon: <Settings className="h-5 w-5" />,
                    text: "Inizia definendo le informazioni base del tuo team. Nelle impostazioni cerca la sezione Gestione Squadra e imposta le tue preferenze."
                  },
                  {
                    step: "2",
                    title: "Inserimento Rosa",
                    icon: <Users className="h-5 w-5" />,
                    text: "Vai nella sezione \"Squadra\" per verificare che i dati siano stati importati correttamente o per inserire i tuoi campioni. Assicurati di assegnare i ruoli per sbloccare le analisi tattiche."
                  },
                  {
                    step: "3",
                    title: "Inserimento Calendario",
                    icon: <Calendar className="h-5 w-5" />,
                    text: "Usa la funzione Importa da Tuttocampo nella sezione dedicata e rifinisci il lavoro con il bottone 'NUOVA' per aggiungere amichevoli o recuperi."
                  },
                  {
                    step: "4",
                    title: "Generazione Allenamenti",
                    icon: <Activity className="h-5 w-5" />,
                    text: "In Allenamento premi il tasto '+' per generare le tue giornate di allenamento per periodi, puoi scegliere se generare tutto subito o settimana per settimana. Nelle schede di allenamento puoi segnare le presenze settimanali. Controlla tutti i pulsanti in alto per capirne le funzionalità e generare le tue sessioni."
                  }
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 group">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted dark:bg-zinc-900 border border-border dark:border-brand-green/20 font-black text-brand-green transition-transform group-hover:scale-105">
                      {item.step}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-muted/50 dark:bg-zinc-900/50 border border-dashed border-brand-green/30 rounded-xl text-center">
                <p className="text-xs font-bold italic text-brand-green">
                  Una volta completati questi passaggi, l'app può considerarsi settata!
                </p>
              </div>
            </section>

            <Separator className="bg-border dark:bg-brand-green/20" />

            {/* FEATURES SECTION */}
            <section className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                Funzionalità Avanzate
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-2xl border border-border dark:border-brand-green/10 bg-muted/30 dark:bg-zinc-900/30 space-y-2 hover:border-brand-green/30 transition-colors">
                  <h4 className="font-bold text-sm flex items-center gap-2 italic">
                    <Trophy className="h-4 w-4 text-brand-green" />
                    Match Day & Eventi
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Traccia ogni impegno. Dopo ogni partita, inserisci <span className="text-foreground dark:text-white font-medium">Marcatori, Assist e Voti</span>. Registra cartellini e sostituzioni per una gestione completa.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-border dark:border-brand-green/10 bg-muted/30 dark:bg-zinc-900/30 space-y-2 hover:border-brand-green/30 transition-colors">
                  <h4 className="font-bold text-sm flex items-center gap-2 italic">
                    <Users className="h-4 w-4 text-brand-green" />
                    Collaborazione Staff
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Dalla sezione Impostazioni, condividi il tuo <span className="text-foreground dark:text-white font-medium">"Codice Stagione"</span> con i collaboratori per inserire statistiche e monitorare gli allenamenti insieme.
                  </p>
                </div>
              </div>
            </section>

            {/* PRO TIP */}
            <div className="flex gap-4 p-5 rounded-2xl bg-brand-green/5 border border-brand-green/20 items-start">
              <div className="p-2 rounded-lg bg-brand-green/10 shrink-0">
                <HelpCircle className="h-5 w-5 text-brand-green" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-tighter text-brand-green">Pro Tip</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Controlla regolarmente la sezione <span className="font-bold text-foreground dark:text-white">Statistiche</span> per scoprire i tuoi "Top Player" per minutaggio e rendimento e analizzare in quali fasi della partita la tua squadra è più vulnerabile.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
