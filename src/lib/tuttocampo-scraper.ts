import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { Role } from './types';

const LOGIN_URL = 'https://www.tuttocampo.it/Web/PHP/Account/Login.php';

export interface ScrapedPlayer {
  nome: string;
  cognome: string;
  ruolo: Role;
  tuttocampoId?: string;
  numero?: string | null;
  dataNascita?: string | null;
  foto?: string | null;
}

export interface ScrapedMatch {
  opponent: string;
  date: string;
  isHome: boolean;
  type: string;
  status: 'scheduled' | 'completata';
  result?: { home: number; away: number } | null;
}

/**
 * Mappa i ruoli di Tuttocampo ai ruoli del sistema PitchMan
 */
function mapRuolo(ruoloRaw: string): Role {
  const r = ruoloRaw.toUpperCase();
  if (r.includes('POR')) return 'Portiere';
  if (r.includes('DIF')) return 'Difensore';
  if (r.includes('CEN')) return 'Centrocampista';
  if (r.includes('ATT')) return 'Attaccante';
  return 'Difensore'; // default safe
}

/**
 * Normalizza un nome per il confronto: minuscolo e solo caratteri alfanumerici
 */
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Fa login su Tuttocampo con le credenziali da .env
 * e scrapa la rosa dall'URL fornito.
 */
export async function scrapeRosa(squadraPageUrl: string): Promise<ScrapedPlayer[]> {
  const email = process.env.TUTTOCAMPO_EMAIL;
  const password = process.env.TUTTOCAMPO_PASSWORD;

  if (!email || !password) {
    throw new Error('Credenziali TUTTOCAMPO_EMAIL o TUTTOCAMPO_PASSWORD mancanti nel file .env');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    // ── 1. LOGIN ──────────────────────────────────────────────────────────
    console.log('[scraper] Navigazione alla pagina principale per login...');
    await page.goto('https://www.tuttocampo.it/', { waitUntil: 'networkidle', timeout: 60000 });

    // Rimuovi in modo aggressivo banner dei cookie, overlay e pubblicità bloccanti
    const cleanupPage = async () => {
      await page.evaluate(() => {
        const selectors = [
          '#fast-cmp-root', 
          '#fast-cmp-iframe', 
          '[id*="cmp-root"]', 
          '[id*="cookie"]', 
          '.cmp-backdrop', 
          '.modal-backdrop',
          '.primis-player-container',
          '#primis_container_wrapper',
          '.fc-ab-root',
          '#advanced_ads_layer',
          '[class*="ads-"]',
          '[id*="ads-"]'
        ];
        selectors.forEach(s => {
          try {
            document.querySelectorAll(s).forEach(el => el.remove());
          } catch (e) {}
        });
        document.body.style.overflow = 'auto';
        document.body.classList.remove('modal-open', 'cmp-active');
      }).catch(() => {});
    };

    await cleanupPage();

    // Aspetta un piccolo istante per il refresh del layout
    await new Promise(r => setTimeout(r, 1000));

    // Se esiste il tasto login (modal), cliccalo via JS per evitare intercettazioni
    const loginExists = await page.evaluate(() => {
      const btn = document.querySelector('a.login.leanmodal[href="#loginmodal"]') as HTMLElement;
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (loginExists) {
      console.log('[scraper] Tasto login cliccato con successo.');
      await page.waitForSelector('#loginmodal', { state: 'visible', timeout: 5000 }).catch(() => {
        console.log('[scraper] Modal login non apparso, procedo comunque...');
      });
    }

    // Compila il form di login (prova sia i vecchi che i nuovi selettori)
    await page.fill('input#login_username, input[name="email"], #email', email);
    await page.fill('input#login_password, input[name="password"], #password', password);
    
    // Clicca il tasto di login con 'force: true' per ignorare eventuali overlay invisibili
    await cleanupPage();
    const submitBtnSelector = '#loginmodal input.btn, input[type="submit"], button[type="submit"]';
    await page.click(submitBtnSelector, { force: true, timeout: 5000 }).catch(async () => {
      await page.keyboard.press('Enter');
    });

    // Aspetta che il login sia completato
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {
      // Ignoriamo l'errore se non c'è redirect esplicito
    });
    console.log('[scraper] Login completato (o timeout navigazione raggiunto).');

    // ── 2. NAVIGA ALLA PAGINA SQUADRA ────────────────────────────────────
    console.log(`[scraper] Navigazione alla pagina squadra: ${squadraPageUrl}`);
    await page.goto(squadraPageUrl, { waitUntil: 'domcontentloaded' });

    // ── 3. TROVA L'URL DI TEAMPLAYERS ────────────────────────────────────
    let rosaHtml: string | null = null;

    // Prova A: cerca un iframe con TeamPlayers.php
    const iframeSrc = await page
      .evaluate(() => {
        const iframe = document.querySelector('iframe[src*="TeamPlayers"]') as HTMLIFrameElement;
        return iframe ? iframe.src : null;
      })
      .catch(() => null);

    if (iframeSrc) {
      console.log(`[scraper] Trovato iframe TeamPlayers: ${iframeSrc}`);
      await page.goto(iframeSrc, { waitUntil: 'domcontentloaded' });
      rosaHtml = await page.content();
    } else {
      // Prova B: intercetta la response XHR a TeamPlayers.php
      console.log('[scraper] Nessun iframe trovato, intercetto le request di rete...');
      
      const rosaResponse = await Promise.race([
        new Promise<string | null>((resolve) => {
          page.on('response', async (response) => {
             if (response.url().includes('TeamPlayers.php')) {
               const body = await response.text().catch(() => null);
               if (body) resolve(body);
             }
          });
        }),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000))
      ]);

      if (rosaResponse) {
        rosaHtml = rosaResponse;
      } else {
        // Fallback: usa il contenuto della pagina stessa
        rosaHtml = await page.content();
      }
    }

    if (!rosaHtml) {
      throw new Error('Impossibile trovare la rosa nella pagina. Verifica l\'URL.');
    }

    // ── 4. PARSE HTML ────────────────────────────────────────────────────
    const $ = cheerio.load(rosaHtml);
    const giocatori: ScrapedPlayer[] = [];

    $('table.team-players tbody tr').each((_, row) => {
      const $row = $(row);
      const nomeCompleto = $row.find('td.player a').text().trim();
      if (!nomeCompleto) return;

      const parti = nomeCompleto.split(' ');
      const cognome = parti[0] || '';
      const nome = parti.slice(1).join(' ') || '';
      
      const tds = $row.find('td');
      const ruoloRaw = tds.eq(3).text().trim();

      giocatori.push({
        tuttocampoId: $row.find('td.player a').attr('data-player-id') || undefined,
        nome: nome || cognome, // Se nome è vuoto (es. solo cognome), usa cognome
        cognome: nome ? cognome : '',
        ruolo: mapRuolo(ruoloRaw),
        numero: $row.find('td.player .number').text().trim().replace(/[()]/g, '') || null,
        dataNascita: $row.find('td.birthdate').text().trim() === '-' ? null : $row.find('td.birthdate').text().trim(),
        foto: $row.find('td.player_photo img').attr('data-src') || null,
      });
    });

    if (giocatori.length === 0) {
      throw new Error('Nessun giocatore trovato. Verifica se la pagina contiene la tabella rosa.');
    }

    return giocatori;
  } finally {
    await browser.close();
  }
}

/**
 * Scrapa il calendario da Tuttocampo
 */
export async function scrapeCalendario(calendarPageUrl: string): Promise<ScrapedMatch[]> {
  const email = process.env.TUTTOCAMPO_EMAIL;
  const password = process.env.TUTTOCAMPO_PASSWORD;

  if (!email || !password) {
    throw new Error('Credenziali TUTTOCAMPO_EMAIL o TUTTOCAMPO_PASSWORD mancanti nel file .env');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    // 1. LOGIN (Stessa logica di scrapeRosa)
    console.log('[scraper-calendario] Login...');
    await page.goto('https://www.tuttocampo.it/', { waitUntil: 'networkidle', timeout: 60000 });
    // Rimuovi in modo aggressivo banner dei cookie, overlay e pubblicità bloccanti
    const cleanupPage = async () => {
      await page.evaluate(() => {
        const selectors = [
          '#fast-cmp-root', 
          '#fast-cmp-iframe', 
          '[id*="cmp-root"]', 
          '[id*="cookie"]', 
          '.cmp-backdrop', 
          '.modal-backdrop',
          '.primis-player-container',
          '#primis_container_wrapper',
          '.fc-ab-root',
          '#advanced_ads_layer',
          '[class*="ads-"]',
          '[id*="ads-"]'
        ];
        selectors.forEach(s => {
          try {
            document.querySelectorAll(s).forEach(el => el.remove());
          } catch (e) {}
        });
        document.body.style.overflow = 'auto';
        document.body.classList.remove('modal-open', 'cmp-active');
      }).catch(() => {});
    };

    await cleanupPage();
    await new Promise(r => setTimeout(r, 1500));
    const loginExists = await page.evaluate(() => {
      const btn = document.querySelector('a.login.leanmodal[href="#loginmodal"]') as HTMLElement;
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (loginExists) {
      await page.waitForSelector('#loginmodal', { state: 'visible', timeout: 5000 }).catch(() => {});
    }
    await page.fill('input#login_username, input[name="email"], #email', email);
    await page.fill('input#login_password, input[name="password"], #password', password);
    await cleanupPage();
    const submitBtnSelector = '#loginmodal input.btn, input[type="submit"], button[type="submit"]';
    await page.click(submitBtnSelector, { force: true, timeout: 5000 }).catch(async () => {
      await page.keyboard.press('Enter');
    });
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});

    // 2. NAVIGA AL CALENDARIO
    console.log(`[scraper-calendario] Navigazione al calendario: ${calendarPageUrl}`);
    await page.goto(calendarPageUrl, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {
      console.log('[scraper-calendario] Timeout navigazione, procedo comunque...');
    });

    // Aspetta che appaia un elemento che indichi il caricamento del calendario
    await page.waitForSelector('.match, .riga-partite, table.table-risultati, tr.item-calendario, .team-name', { timeout: 10000 }).catch(() => {
      console.log('[scraper-calendario] Timeout attesa selettori calendario (non bloccante)');
    });

    // Rileva il nome della squadra dal titolo o URL per capire casa/trasferta
    const urlParts = calendarPageUrl.split('/');
    const squadraSlug = urlParts[urlParts.indexOf('Squadra') + 1] || '';
    
    // 3. TROVA IL CONTENUTO DEL CALENDARIO
    let calendarHtml = await page.content();
    
    // Controlla se c'è un iframe del calendario
    const iframeSrc = await page.evaluate(() => {
      const iframe = document.querySelector('iframe[src*="Calendario"], iframe[src*="Schedule"]') as HTMLIFrameElement;
      return iframe ? iframe.src : null;
    }).catch(() => null);

    if (iframeSrc) {
      console.log(`[scraper-calendario] Seguendo iframe calendario: ${iframeSrc}`);
      await page.goto(iframeSrc, { waitUntil: 'domcontentloaded' });
      calendarHtml = await page.content();
    }

    // 4. PARSE HTML
    const $ = cheerio.load(calendarHtml);
    const matches: ScrapedMatch[] = [];
    
    // Cerca il nome della squadra in diversi posti (titolo, header, slug)
    const teamNameOnPage = $('.team-header-name, h1, .team-name').first().text().trim() || 
                           squadraSlug.replace(/([a-z])([A-Z])/g, '$1 $2').trim();

    console.log(`[scraper-calendario] Rilevata squadra (target): "${teamNameOnPage}"`);
    const normalizedTargetTeam = normalizeName(teamNameOnPage);

    // Iteriamo le righe della tabella calendario
    // Tuttocampo usa vari layout: tr.match, .riga-partite, .match, o genericamente righe con link a "Partita"
    const rowSelector = 'tr.match, .match, .riga-partite, tr.item-calendario, table.table-risultati tr, table.match-list tr, tr:has(a[href*="Partita"])';
    const rows = $(rowSelector);
    console.log(`[scraper-calendario] Righe trovate potenziali: ${rows.length}`);

    if (rows.length === 0) {
      // DEBUG: Se non trova righe, logghiamo una parte dell'HTML per capire perché
      console.log('[scraper-calendario] Nessuna riga trovata. HTML snippet:', calendarHtml.substring(0, 1000).replace(/\s+/g, ' '));
    }

    rows.each((i, row) => {
      try {
        const $row = $(row);
        
        // Salta righe di intestazione o separatori
        if ($row.hasClass('separator') || $row.hasClass('date') || $row.hasClass('data-partite') || $row.find('th').length > 0) {
          return;
        }

        // Prova vari selettori specifici per il nome team (evitando i gol se possibile)
        let homeTeam = $row.find('.team.home .team-name, .squadra-casa .team-name, .team-home .team-name, .home .team-name').text().trim();
        let awayTeam = $row.find('.team.away .team-name, .squadra-trasferta .team-name, .team-away .team-name, .away .team-name').text().trim();
        
        // Fallback ai selettori generici se i nomi specifici mancano
        if (!homeTeam) homeTeam = $row.find('.team-home, .squadra-casa, .home').text().trim();
        if (!awayTeam) awayTeam = $row.find('.team-away, .squadra-fuori, .squadra-trasferta, .away').text().trim();

        if (!homeTeam || !awayTeam) return;

        // Pulizia ulteriore dei nomi (rimuovi eventuali numeri di gol rimasti nel testo, es "S.C. United 4" -> "S.C. United")
        homeTeam = homeTeam.replace(/\s\d+$/, '').trim();
        awayTeam = awayTeam.replace(/^\d+\s/, '').trim();

        const normalizedHome = normalizeName(homeTeam);
        const normalizedAway = normalizeName(awayTeam);

        const isHome = normalizedHome.includes(normalizedTargetTeam) || 
                       normalizedTargetTeam.includes(normalizedHome);
        
        const opponent = isHome ? awayTeam : homeTeam;
        
        // Data e Ora
        let dateText = $row.find('.data, .date').text().trim(); 
        let timeText = $row.find('.ora, .time').text().trim();
        
        // Se non c'è .data, potrebbe essere in .risultato o .score
        let isDateInResult = false;
        const resText = $row.find('.risultato, .score, .result, .col-risultato').text().trim();
        
        if (!dateText && (resText.includes('/') || resText.includes(':'))) {
            dateText = resText;
            isDateInResult = true;
        }
        
        // Se ancora manca, cerchiamo in tutta la riga un pattern data (XX/XX)
        if (!dateText) {
          const match = $row.text().match(/(\d{2})[\/\-](\d{2})/);
          if (match) dateText = match[0];
        }

        if (!dateText) {
          // Fallback per partite passate senza data visibile: usiamo una data fittizia 
          // per non perdere il risultato, dato che il sistema richiede una data.
          dateText = "01/01"; 
        }

        // Pulizia data
        const dateMatch = dateText.match(/(\d{2})[\/\-](\d{2})/);
        if (!dateMatch) return;
        
        const day = dateMatch[1];
        const month = dateMatch[2];
        const year = parseInt(month) >= 8 ? 2025 : 2026;
        const fullDate = `${year}-${month}-${day}T${timeText || '15:00'}:00`;

        const isCompleted = !isDateInResult && /\d/.test(resText) && !resText.includes(':');

        console.log(`[scraper-calendario] Riga ${i}: ${homeTeam} vs ${awayTeam} (isHome: ${isHome}, Date: ${dateText}, Completed: ${isCompleted})`);

        matches.push({
          opponent,
          date: fullDate,
          isHome,
          type: 'Campionato',
          status: isCompleted ? 'completata' : 'scheduled',
        });
      } catch (err: any) {
        console.error(`[scraper-calendario] Errore riga ${i}:`, err.message);
      }
    });

    if (matches.length === 0) {
      throw new Error('Nessuna partita trovata nel calendario.');
    }

    return matches;
  } finally {
    await browser.close();
  }
}
