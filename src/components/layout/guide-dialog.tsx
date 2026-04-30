"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Trophy, Zap } from "lucide-react"

// ── FAQ Data ──
// Questo array è la singola fonte di verità per le FAQ.
// Viene usato sia nel dialog UI sia (in futuro) come contesto RAG per il chatbot AI.

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const FAQ_DATA: FAQItem[] = [
  // 🚀 Primo Avvio
  {
    category: "Primo Avvio",
    question: "Come configuro la mia squadra per la prima volta?",
    answer: "Vai nelle Impostazioni (icona ingranaggio in basso) e cerca la sezione \"Gestione Squadra\". Da lì puoi impostare il nome della squadra, la categoria e le tue preferenze. Questo è il primo passo per iniziare a usare l'app."
  },
  {
    category: "Primo Avvio",
    question: "Come inserisco la rosa dei giocatori?",
    answer: "Hai due opzioni:\n\n• Manuale: Vai nella sezione \"Rosa\" e premi \"+\" per aggiungere i giocatori uno alla volta.\n• Import AI (Premium): Usa il bottone \"Importa\" per incollare del testo (es. da un PDF o una foto) e l'AI estrarrà automaticamente nomi, ruoli e numeri di maglia.\n\nAssicurati di assegnare i ruoli (Portiere, Difensore, Centrocampista, Attaccante) per sbloccare le analisi tattiche."
  },
  {
    category: "Primo Avvio",
    question: "Come inserisco il calendario delle partite?",
    answer: "Hai tre opzioni:\n\n• Import da TuttoCampo: Nella sezione \"Partite\", usa \"Importa da TuttoCampo\" per sincronizzare il calendario.\n• Import AI (Premium): Incolla il testo del calendario e l'AI lo trasformerà in partite strutturate.\n• Manuale: Premi \"NUOVA\" per aggiungere singole partite (amichevoli, recuperi, tornei)."
  },
  {
    category: "Primo Avvio",
    question: "Come genero le sessioni di allenamento?",
    answer: "Nella sezione \"Allenamento\", premi \"+\" per generare le giornate. Puoi scegliere se generare tutto il periodo o settimana per settimana. Nelle schede puoi poi segnare le presenze settimanali dei giocatori."
  },
  // ⚽ Partite
  {
    category: "Partite",
    question: "Come registro il risultato di una partita?",
    answer: "Apri la partita dalla sezione \"Partite\", vai nella tab \"Risultato\" e inserisci il punteggio finale. Da lì puoi anche segnare marcatori, assist e voti individuali."
  },
  {
    category: "Partite",
    question: "Come inserisco gol, cartellini e sostituzioni?",
    answer: "Nella scheda della partita, usa la tab \"Cronaca\" per aggiungere gli eventi in ordine cronologico: gol, assist, cartellini gialli/rossi, sostituzioni e note tattiche."
  },
  {
    category: "Partite",
    question: "Posso aggiungere amichevoli o partite fuori calendario?",
    answer: "Sì! Nella sezione \"Partite\", premi \"NUOVA\" e seleziona il tipo di partita. Le amichevoli vengono tracciate separatamente nelle statistiche."
  },
  // 👥 Rosa
  {
    category: "Rosa & Giocatori",
    question: "Come segnalo un infortunio?",
    answer: "Nella scheda del giocatore, c'è la sezione \"Infortuni\". Premi \"+\" per registrare un nuovo infortunio con data, tipo e tempo di recupero. I giocatori infortunati vengono evidenziati nella rosa e esclusi dai suggerimenti formazione."
  },
  {
    category: "Rosa & Giocatori",
    question: "Come funziona lo Scouting?",
    answer: "Dalla sezione \"Rosa\", tocca l'icona della lente d'ingrandimento per accedere allo Scout. Puoi aggiungere giocatori osservati, assegnare categorie di priorità (\"Priorità Alta\", \"Da Seguire\") e prendere appunti."
  },
  // 📊 Statistiche
  {
    category: "Statistiche",
    question: "Quali statistiche sono disponibili?",
    answer: "La sezione \"Statistiche\" offre: classifica marcatori e assistman, andamento risultati (grafico V/P/S), minutaggio medio per giocatore, cartellini e sanzioni, presenze allenamento e rendimento per ruolo."
  },
  {
    category: "Statistiche",
    question: "Le statistiche si aggiornano automaticamente?",
    answer: "Sì! Le statistiche si aggiornano ogni volta che inserisci un risultato, degli eventi di partita o delle presenze. Non devi fare nulla di manuale."
  },
  // 🤖 AI
  {
    category: "AI Assistant",
    question: "Cosa può fare l'assistente AI?",
    answer: "L'AI può: analizzare le statistiche e fornirti insight tattici, suggerire formazioni basate su rendimento e presenze, rispondere a domande come \"Chi è il mio miglior marcatore?\" o \"Come stiamo andando in trasferta?\", e aiutarti a usare l'app."
  },
  {
    category: "AI Assistant",
    question: "L'AI inventa dati?",
    answer: "No. L'AI è programmata per basarsi esclusivamente sui dati reali della tua squadra. Se non ha abbastanza dati, te lo dirà. Non inventerà mai statistiche."
  },
  // 🔗 Collaborazione
  {
    category: "Collaborazione",
    question: "Come condivido la stagione con un collaboratore?",
    answer: "Nelle Impostazioni, cerca \"Condivisione\" e copia il tuo \"Codice Stagione\". Condividilo con il collaboratore: potrà inserirlo nella sua app per accedere ai dati della tua squadra."
  },
  // 💎 Pro
  {
    category: "Piano Pro",
    question: "Cosa include il piano gratuito?",
    answer: "Il piano Free include: gestione completa della rosa, inserimento manuale partite e risultati, presenze allenamento e note, libreria esercizi privata."
  },
  {
    category: "Piano Pro",
    question: "Cosa include il piano Pro?",
    answer: "Il piano Pro aggiunge: AI Assistant illimitato, Import AI (da testo, foto o PDF), statistiche avanzate (grafici, trend, medie), export PDF/CSV e libreria esercizi sociale."
  },
  {
    category: "Piano Pro",
    question: "C'è un periodo di prova?",
    answer: "Sì! Ogni nuovo account riceve 24 ore di accesso completo a tutte le funzionalità Pro. Puoi importare la rosa, il calendario, provare l'AI e vedere le statistiche prima di decidere."
  },
  // 🔒 Privacy
  {
    category: "Privacy & Sicurezza",
    question: "I miei dati sono al sicuro?",
    answer: "Sì. PitchMan usa Firebase di Google per autenticazione e database. I tuoi dati sono criptati in transito e a riposo. Ogni utente vede solo i dati della propria squadra."
  },
  {
    category: "Privacy & Sicurezza",
    question: "Chi può vedere i dati della mia squadra?",
    answer: "Solo tu e le persone con cui hai condiviso il Codice Stagione. Il Direttore Sportivo (se presente) può vedere risultati e statistiche in sola lettura, ma non può modificare nulla."
  },
];

// Raggruppa le FAQ per categoria
function groupByCategory(items: FAQItem[]): Record<string, FAQItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, FAQItem[]>);
}

const CATEGORY_EMOJI: Record<string, string> = {
  "Primo Avvio": "🚀",
  "Partite": "⚽",
  "Rosa & Giocatori": "👥",
  "Statistiche": "📊",
  "AI Assistant": "🤖",
  "Collaborazione": "🔗",
  "Piano Pro": "💎",
  "Privacy & Sicurezza": "🔒",
};

export function GuideDialog() {
  const grouped = groupByCategory(FAQ_DATA);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white dark:bg-black font-black text-xs text-foreground dark:text-white shadow-sm transition-all hover:bg-muted dark:hover:bg-brand-green/10 dark:border-brand-green/30 dark:shadow-[0_0_12px_rgba(172,229,4,0.15)] group shrink-0"
          title="FAQ & Guida"
        >
          <span className="group-hover:scale-110 transition-transform">?</span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden border-border dark:border-brand-green/30 dark:shadow-[0_0_20px_rgba(172,229,4,0.1)]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-2xl font-black italic uppercase tracking-tighter">
            <Trophy className="h-6 w-6 text-brand-green" />
            FAQ <span className="text-brand-green">PitchMan</span>
          </DialogTitle>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Domande frequenti e guida all&apos;utilizzo
          </p>
        </DialogHeader>

        <ScrollArea className="h-full max-h-[calc(85vh-100px)] px-6 py-4">
          <div className="space-y-6 pb-8">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-base">{CATEGORY_EMOJI[category] || "📌"}</span>
                  <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    {category}
                  </h3>
                </div>

                <Accordion type="single" collapsible className="space-y-1">
                  {items.map((faq, idx) => (
                    <AccordionItem
                      key={`${category}-${idx}`}
                      value={`${category}-${idx}`}
                      className="border border-border dark:border-brand-green/10 rounded-xl px-4 overflow-hidden data-[state=open]:border-brand-green/30 transition-colors"
                    >
                      <AccordionTrigger className="text-sm font-semibold text-left py-3 hover:no-underline hover:text-brand-green transition-colors [&[data-state=open]]:text-brand-green">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4 whitespace-pre-line">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}

            {/* Pro Tip */}
            <div className="flex gap-4 p-5 rounded-2xl bg-brand-green/5 border border-brand-green/20 items-start">
              <div className="p-2 rounded-lg bg-brand-green/10 shrink-0">
                <Zap className="h-5 w-5 text-brand-green fill-brand-green" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-tighter text-brand-green">Pro Tip</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Puoi anche chiedere all&apos;
                  <span className="font-bold text-foreground dark:text-white">AI Assistant</span> come usare
                  l&apos;app! Apri la chat dal bottone flottante in basso a destra e chiedi qualsiasi cosa.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
