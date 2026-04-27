# Gestione degli Stili e Colori

Questo documento elenca i file principali utilizzati per la gestione dei colori, dei font e degli stili generali dell'applicazione.

## 🎨 Colori e Variabili CSS

Il sistema di colori si basa su variabili CSS (HSL) definite nei file di configurazione di Tailwind e applicate tramite utility class.

- **[src/app/globals.css](file:///d:/Download/studio-main/studio-main/src/app/globals.css)**
  Contiene le definizioni delle variabili CSS (es: `--primary`, `--background`, `--accent`) per i temi **Light** e **Dark**. Include anche classi personalizzate per gradienti neon e ombreggiature (glow).

- **[tailwind.config.ts](file:///d:/Download/studio-main/studio-main/tailwind.config.ts)**
  Configura Tailwind CSS per mappare le variabili CSS ai nomi delle utility (es: `bg-primary`). Qui sono definiti anche i colori del brand:
  - `brand-yellow`, `brand-green`, `brand-lime`, `brand-cyan`, `brand-pink`.
  - Colori funzionali: `brand-win`, `brand-loss`, `brand-draw`.
  - Icone cartellini: `brand-card-yellow`, `brand-card-red`.

- **[components.json](file:///d:/Download/studio-main/studio-main/components.json)**
  Configurazione di **shadcn/ui**, che collega Tailwind al file CSS globale e definisce i parametri di base per i componenti UI.

## 🔠 Tipografia e Layout

- **[src/app/layout.tsx](file:///d:/Download/studio-main/studio-main/src/app/layout.tsx)**
  Configura i font di Google (PT Sans) e inizializza il `ThemeProvider`.

## 💡 Note sui Gradienti

L'app utilizza dei gradienti "Neon" personalizzati definiti in `globals.css`:
- `.text-neon-gradient`: Gradiente per il testo.
- `.bg-neon-gradient`: Gradiente per lo sfondo.
- `.border-neon-gradient`: Gradiente per i bordi.
