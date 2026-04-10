# Strategia Mobile-First e Accessibilità Touch

L'applicazione deve essere pienamente utilizzabile sia da PC che da Smartphone. Questo documento definisce le linee guida per garantire un'esperienza utente coerente su tutti i dispositivi.

## Regole Fondamentali

1. **Nessun Dato Critico Solo su Hover**:
   - Sui dispositivi touch (smartphone/tablet) l'evento "hover" non esiste o è simulato male.
   - I pulsanti di azione (modifica, elimina, conferma) devono essere sempre visibili su schermi piccoli.
   - Utilizzare le media query di Tailwind (es. `lg:opacity-0 lg:group-hover:opacity-100`) per nascondere elementi solo sui dispositivi che supportano il mouse.

2. **Dimensioni Minime dei Target Touch**:
   - Ogni elemento interattivo (pulsanti, input, switch) deve avere una dimensione minima di 44x44px o essere sufficientemente spaziato per evitare tocchi accidentali.
   - Usare `h-10` o `h-12` per i pulsanti principali.

3. **Layout Dinamico**:
   - Utilizzare griglie responsive (es. `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
   - Evitare testi troppo piccoli (minimo 12px per contenuti leggibili, 10px solo per badge/etichette secondarie).

4. **Padding e Margini**:
   - Assicurarsi che i contenuti non tocchino i bordi dello schermo su mobile (`px-4` o `px-5` nei container principali).

5. **Clonazione Comandi**:
   - Se un comando è nascosto dietro un hover su desktop, deve comparire stabilmente su mobile o essere spostato in un menu a tendina (`DropdownMenu`) facilmente accessibile.

---
*Ultimo aggiornamento: 2026-04-09*
