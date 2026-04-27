# 💰 PitchMan — Piano Go-to-Market & Prime Revenue

> Obiettivo: portare PitchMan da progetto personale a prodotto con i primi utenti paganti nel giro di 4-8 settimane.

---

## 📌 Fase 0 — Validazione del Mercato (Settimana 1-2)

### 🎯 Chi è il cliente?

| Segmento | Profilo | Dove trovarlo |
|----------|---------|---------------|
| **Primary** | Allenatori di settore giovanile (Pulcini → Juniores), serie dilettanti | Gruppi Facebook, campi sportivi, tornei |
| **Secondary** | Direttori sportivi di società dilettantistiche | LinkedIn, federazioni locali (FIGC/LND) |
| **Tertiary** | Preparatori atletici freelance | Instagram, community fitness |

### 📋 Google Form — Validazione Mercato

**Tool**: [Google Forms](https://forms.google.com) (gratuito, veloce, professionale)

**Titolo del Form**: *"Aiutaci a migliorare la gestione della tua squadra — 2 minuti"*

**Domande consigliate** (max 8-10):

1. **Qual è il tuo ruolo?** *(Allenatore / Direttore Sportivo / Preparatore / Altro)*
2. **In che categoria alleni?** *(Pulcini / Esordienti / Giovanissimi / Allievi / Juniores / Prima squadra dilettanti)*
3. **Quanti giocatori gestisci?** *(< 15 / 15-25 / 25-40 / > 40)*
4. **Come gestisci OGGI il calendario delle partite?** *(Carta / WhatsApp / Excel / App dedicata / Altro)*
5. **Come gestisci la formazione prima della partita?** *(A mente / Foglio / Lavagna / App)*
6. **Quanto tempo dedichi settimanalmente alla parte "burocratica" (convocazioni, formazioni, statistiche)?** *(< 30 min / 30-60 min / 1-2 ore / > 2 ore)*
7. **Pagheresti per uno strumento che automatizza tutto questo con l'AI?** *(Sì subito / Sì se economico / Solo se gratis / No)*
8. **Quanto saresti disposto a spendere al mese?** *(€0 / €3-5 / €5-10 / €10-20 / > €20)*
9. **Qual è la funzione che vorresti di più?** *(Formazione AI / Import calendario automatico / Statistiche avanzate / Condivisione con lo staff / Altro)*
10. **Lascia la tua email per accesso anticipato gratuito** *(opzionale)*

**Distribuzione del Form**:
- Posta nei gruppi Facebook: *"Allenatori Calcio Giovanile"*, *"Mister Calcio"*, *"Allenatori Dilettanti Italia"*
- Condividi su r/calcio, r/soccer (Reddit)
- Chiedi ai tuoi contatti nel mondo calcio di inoltrarlo
- Pubblica su LinkedIn con un post narrativo

---

## 📌 Fase 1 — Landing Page (Settimana 2-3)

### 🌐 Tool consigliati

| Tool | Uso | Costo |
|------|-----|-------|
| **[Carrd.co](https://carrd.co)** | Landing page one-page, velocissima | €9/anno (Pro) |
| **[Framer](https://framer.com)** | Landing page più elaborata, animazioni | Free → €5/mese |
| **Vercel** (già in uso) | Deploy diretto di una `/landing` route in Next.js | Gratuito |
| **[Tally.so](https://tally.so)** | Form waitlist alternativo a Google Forms, più bello | Gratuito |

### ✍️ Copy per la Landing Page

**Headline (H1)**:
> **Gestisci la tua squadra come un professionista. Con l'intelligenza artificiale.**

**Sottotitolo**:
> PitchMan è il primo assistente AI per allenatori di calcio: importa il calendario in un click, genera la formazione migliore, analizza le statistiche — tutto dal tuo telefono.

**Sezione "Il problema"**:
> Fogli Excel, gruppi WhatsApp infiniti, appunti su carta che si perdono. Ogni settimana sprechi ore a gestire convocazioni, formazioni e statistiche. E se potessi fare tutto in 30 secondi?

**Sezione "La soluzione"** (3 blocchi):

| Icona | Titolo | Descrizione |
|-------|--------|-------------|
| 📋 | **Importa il calendario** | Copia-incolla da Tuttocampo o carica un PDF. L'AI estrae tutte le partite in automatico. |
| 🧠 | **Formazione AI** | L'assistente analizza presenze, infortuni e performance per suggerirti il miglior 11. |
| 📊 | **Statistiche intelligenti** | Gol, assist, minuti giocati, rendimento casa/trasferta — tutto calcolato in tempo reale. |

**CTA principale**:
> 🚀 **Provalo gratis per 14 giorni** — Nessuna carta di credito richiesta.

**CTA secondaria** (se non ancora pronto al lancio):
> 📩 **Unisciti alla lista d'attesa** — Sarai tra i primi 100 a provarlo.

**Social proof** (da costruire):
> *"Finalmente non devo più portarmi il foglio A4 in panchina."* — Marco, allenatore Juniores

---

## 📌 Fase 2 — Pricing & Monetizzazione (Settimana 3-4)

### 💳 Modello Freemium consigliato

| Piano | Prezzo | Cosa include |
|-------|--------|-------------|
| **Free** | €0 | 1 squadra, max 20 giocatori, calendario manuale, statistiche base |
| **Pro** | €4.99/mese | Giocatori illimitati, Import AI (testo + file), formazione AI, statistiche avanzate, export PDF |
| **Team** | €9.99/mese | Tutto Pro + multi-staff, sincronizzazione cloud, backup automatico, scouting |

### 🔧 Tool per i pagamenti

| Tool | Pro | Contro |
|------|-----|--------|
| **[Stripe](https://stripe.com)** | Standard del settore, SDK Next.js, webhook facili | Serve P.IVA per incassare |
| **[LemonSqueezy](https://lemonsqueezy.com)** | Merchant of Record (gestisce IVA per te), perfetto per indie | Commissioni leggermente più alte (5%+50¢) |
| **[Paddle](https://paddle.com)** | Come Lemon ma più enterprise | Approvazione manuale |
| **[Gumroad](https://gumroad.com)** | Semplicissimo per iniziare | Meno professionale |

> **💡 Consiglio**: Parti con **LemonSqueezy** se non hai P.IVA. Gestisce fatturazione, IVA e conformità fiscale per te. Puoi migrare a Stripe quando cresci.

### Implementazione tecnica (Next.js)

```
src/
├── app/api/webhooks/lemonsqueezy/   ← Webhook per attivare/disattivare piano
├── lib/subscription.ts              ← Logica per controllare il piano attivo
├── components/paywall.tsx           ← Componente che blocca feature Pro
└── middleware.ts                    ← (opzionale) Protezione route server-side
```

---

## 📌 Fase 3 — Acquisizione Utenti (Settimana 4-8)

### 📱 Canali organici (gratis)

| Canale | Azione | Frequenza |
|--------|--------|-----------|
| **Instagram** | Reel 15-30s: "Come creo la formazione in 10 secondi con l'AI" | 3x/settimana |
| **TikTok** | Stessi reel, cross-posting | 3x/settimana |
| **YouTube Shorts** | Tutorial brevi: "Import calendario da foto" | 1x/settimana |
| **Gruppi Facebook** | Post di valore (non spam): consigli + link app | 2x/settimana |
| **Reddit** | r/calcio, r/SideProject, r/webdev — post narrativo | 1x/settimana |
| **ProductHunt** | Launch day con preparazione | 1 volta |
| **LinkedIn** | Post storytelling: "Ho costruito un'app AI per allenatori" | 1x/settimana |

### ✍️ Copy per i social

**Instagram/TikTok — Hook**:
> "Ogni settimana perdi 2 ore per fare la formazione. Io la faccio in 10 secondi."

**YouTube — Titolo**:
> "Ho creato un'app AI che fa la formazione al posto tuo (e funziona davvero)"

**LinkedIn — Post completo**:
```
Ho allenato per anni nel settore giovanile.

Ogni settimana la stessa storia:
→ Foglio Excel per le presenze
→ WhatsApp per le convocazioni  
→ Appunti persi sulla formazione

Così ho costruito PitchMan.

È un'app che usa l'intelligenza artificiale per:
✅ Importare il calendario (basta una foto)
✅ Suggerire la formazione migliore
✅ Calcolare le statistiche in automatico

Funziona anche offline, dal telefono.

Se alleni una squadra dilettantistica, provala gratis →
[link]

#calcio #allenatore #AI #startup
```

**Email per la waitlist** (dopo che lasciano l'email nel form):
```
Oggetto: 🎉 Sei dentro! Ecco cosa succede ora

Ciao [Nome],

Grazie per esserti iscritto alla lista d'attesa di PitchMan.

Sei il numero #[X] — i primi 100 avranno accesso GRATUITO al piano Pro per 3 mesi.

Cosa aspettarti:
→ Accesso anticipato entro [data]
→ Un'app che ti fa risparmiare 2+ ore a settimana
→ L'AI che crea la formazione al posto tuo

Nel frattempo, rispondi a questa email con una cosa:
qual è il problema più grande che hai nella gestione della squadra?

A presto,
[Il tuo nome]
Fondatore di PitchMan
```

---

## 📌 Fase 4 — Launch su ProductHunt

### 🚀 Tool e preparazione

| Tool | Uso |
|------|-----|
| **[ProductHunt](https://producthunt.com)** | Launch principale |
| **[Ship by ProductHunt](https://ship.producthunt.com)** | Pagina teaser pre-launch |
| **[BetaList](https://betalist.com)** | Directory per beta |
| **[Indie Hackers](https://indiehackers.com)** | Community + cross-posting |

### ✍️ Copy per ProductHunt

**Tagline** (60 caratteri max):
> "L'assistente AI per allenatori di calcio dilettantistico"

**Descrizione**:
> PitchMan is the first AI-powered coaching assistant for amateur football.  
> Import your schedule from a photo, get AI-suggested lineups, track player stats — all from your phone, even offline.  
> Built for coaches who manage their team between a day job and the pitch.

**Primo commento del maker** (fondamentale):
```
Hey PH! 👋

I coach youth football in Italy, and every week I'd spend 
2+ hours on Excel sheets, WhatsApp groups, and paper notes 
just to manage my team.

So I built PitchMan — an AI coaching assistant that:
📋 Imports the schedule from text OR photos (AI-powered)
🧠 Suggests the best lineup based on training + stats
📊 Tracks everything: goals, assists, minutes, injuries
📱 Works offline (PWA) — because locker rooms have no signal

Tech stack: Next.js 15, Gemini 2.5 Flash, Firebase, Vercel.

I'd love your feedback!
```

---

## 📌 Fase 5 — Metriche & Iterazione

### 📊 KPI da monitorare

| Metrica | Tool | Target mese 1 |
|---------|------|----------------|
| **Visite landing** | Vercel Analytics / Plausible | 500+ |
| **Iscrizioni waitlist** | Google Sheets (collegato al form) | 100+ |
| **Conversione Free → Pro** | LemonSqueezy dashboard | 5-10% |
| **MRR** (Monthly Recurring Revenue) | LemonSqueezy | €50-100 |
| **Retention 7 giorni** | PostHog / Mixpanel (free tier) | > 40% |
| **NPS** (soddisfazione) | Tally.so survey in-app | > 50 |

### 🔧 Tool Analytics consigliati

| Tool | Costo | Uso |
|------|-------|-----|
| **[Plausible](https://plausible.io)** | €9/mese | Analytics privacy-friendly per la landing |
| **[PostHog](https://posthog.com)** | Gratuito fino a 1M eventi | Event tracking in-app, funnel, retention |
| **[Hotjar](https://hotjar.com)** | Gratuito (base) | Heatmap e registrazioni sessione |
| **Vercel Analytics** | Già incluso | Web vitals e pageviews |

---

## 📌 Checklist Operativa

### Settimana 1-2: Validazione
- [ ] Crea il Google Form con le 10 domande
- [ ] Posta il form in 5+ gruppi Facebook di allenatori
- [ ] Condividi il form su LinkedIn con un post personale
- [ ] Raccogli almeno 30 risposte
- [ ] Analizza: **> 50% disposti a pagare?** → Procedi. Altrimenti → Pivota

### Settimana 2-3: Landing Page
- [ ] Scegli tra Carrd / Framer / Next.js route interna
- [ ] Scrivi la copy (usa i template sopra)
- [ ] Aggiungi form waitlist (Tally.so o Google Form embed)
- [ ] Dominio personalizzato? → `pitchman.app` o `pitchman.it` (controlla su Namecheap)
- [ ] Imposta Plausible o Vercel Analytics

### Settimana 3-4: Monetizzazione
- [ ] Registrati su LemonSqueezy (o Stripe se hai P.IVA)
- [ ] Crea i 3 piani (Free / Pro / Team)
- [ ] Implementa il paywall nel codice (componente `<ProFeature>`)
- [ ] Testa il flusso di pagamento end-to-end

### Settimana 4-6: Contenuti & Lancio
- [ ] Registra 3 reel dimostrativi
- [ ] Posta su Instagram + TikTok
- [ ] Prepara la pagina ProductHunt
- [ ] Scrivi il post LinkedIn narrativo
- [ ] Invia email alla waitlist con accesso anticipato

### Settimana 6-8: Iterazione
- [ ] Raccogli feedback dai primi utenti (in-app survey via Tally)
- [ ] Analizza retention e conversione
- [ ] Prioritizza le feature più richieste
- [ ] Obiettivo: **10 utenti paganti** = Prodotto validato ✅

---

## 💡 Quick Wins per accelerare

1. **Feature "killer" da evidenziare nel marketing**: L'import del calendario da foto/file è estremamente visuale e fa "wow" → usalo come hero nei reel.
2. **Referral**: Offri 1 mese Pro gratis per ogni amico invitato che si registra.
3. **Partnership**: Contatta 2-3 scuole calcio locali e offri il piano Team gratis per 3 mesi in cambio di feedback e testimonial.
4. **SEO long-tail**: Scrivi 3 articoli blog su: "Come gestire la formazione di calcio", "App per allenatori di calcio", "Statistiche calcio giovanile". Il traffico organico arriva in 2-3 mesi ma è gratuito e perpetuo.

---

*Ultimo aggiornamento: Aprile 2026*
