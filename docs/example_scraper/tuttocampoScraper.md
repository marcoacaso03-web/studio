// lib/tuttocampoScraper.js
// Usa Playwright per fare login su Tuttocampo e scrapare la rosa
// Installa dipendenze: npm install playwright cheerio
// Poi: npx playwright install chromium

import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

const LOGIN_URL = 'https://www.tuttocampo.it/Web/PHP/Account/Login.php';

/**
 * Fa login su Tuttocampo con le credenziali da .env
 * e scrapa la rosa dall'URL fornito.
 *
 * @param {string} squadraPageUrl - URL della pagina squadra su Tuttocampo
 *   es. https://www.tuttocampo.it/Italia/.../Squadra/NomeSquadra/123456
 * @returns {Promise<Array>} Lista giocatori con nome, cognome, ruolo
 */
export async function scrapeRosa(squadraPageUrl) {
  const email = process.env.TUTTOCAMPO_EMAIL;
  const password = process.env.TUTTOCAMPO_PASSWORD;

  if (!email || !password) {
    throw new Error('Credenziali Tuttocampo mancanti nel file .env.local');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    // ── 1. LOGIN ──────────────────────────────────────────────────────────
    console.log('[scraper] Navigazione alla pagina di login...');
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });

    // Compila il form di login
    await page.fill('input[name="email"], input[type="email"], #email', email);
    await page.fill('input[name="password"], input[type="password"], #password', password);
    await page.click('input[type="submit"], button[type="submit"]');

    // Aspetta che il login sia completato (redirect o cambio DOM)
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {
      // Alcuni siti non fanno redirect esplicito, ignoriamo l'errore
    });
    console.log('[scraper] Login completato.');

    // ── 2. NAVIGA ALLA PAGINA SQUADRA ────────────────────────────────────
    console.log(`[scraper] Navigazione alla pagina squadra: ${squadraPageUrl}`);
    await page.goto(squadraPageUrl, { waitUntil: 'domcontentloaded' });

    // ── 3. TROVA L'URL DI TEAMPLAYERS ────────────────────────────────────
    // Tuttocampo carica la rosa tramite una iframe o una chiamata con tckk
    // Intercettiamo la request a TeamPlayers.php oppure leggiamo il DOM
    let rosaHtml = null;

    // Prova A: cerca un iframe o div con src che contiene TeamPlayers.php
    const iframeSrc = await page
      .evaluate(() => {
        const iframe = document.querySelector('iframe[src*="TeamPlayers"]');
        return iframe ? iframe.src : null;
      })
      .catch(() => null);

    if (iframeSrc) {
      console.log(`[scraper] Trovato iframe TeamPlayers: ${iframeSrc}`);
      await page.goto(iframeSrc, { waitUntil: 'domcontentloaded' });
      rosaHtml = await page.content();
    } else {
      // Prova B: intercetta la request XHR/fetch a TeamPlayers.php
      // Ricarica la pagina ascoltando le risposte di rete
      console.log('[scraper] Nessun iframe trovato, intercetto le request di rete...');

      const rosaResponse = await new Promise(async (resolve) => {
        page.on('response', async (response) => {
          if (response.url().includes('TeamPlayers.php')) {
            const body = await response.text().catch(() => null);
            if (body) resolve(body);
          }
        });
        await page.reload({ waitUntil: 'networkidle' });
        // Timeout fallback dopo 10s
        setTimeout(() => resolve(null), 10000);
      });

      if (rosaResponse) {
        rosaHtml = rosaResponse;
      } else {
        // Prova C: la rosa è già nella pagina stessa
        rosaHtml = await page.content();
      }
    }

    if (!rosaHtml) {
      throw new Error('Impossibile trovare la rosa nella pagina. Verifica il URL della squadra.');
    }

    // ── 4. PARSE HTML ────────────────────────────────────────────────────
    const giocatori = parseRosa(rosaHtml);

    if (giocatori.length === 0) {
      throw new Error(
        'Nessun giocatore trovato. La sessione potrebbe essere scaduta o il selettore è cambiato.'
      );
    }

    console.log(`[scraper] Trovati ${giocatori.length} giocatori.`);
    return giocatori;
  } finally {
    await browser.close();
  }
}

/**
 * Parsa l'HTML della tabella rosa e restituisce array di giocatori.
 * @param {string} html
 * @returns {Array}
 */
function parseRosa(html) {
  const $ = cheerio.load(html);
  const giocatori = [];

  $('table.team-players tbody tr').each((_, row) => {
    const $row = $(row);

    const nomeCompleto = $row.find('td.player a').text().trim();
    if (!nomeCompleto) return; // salta righe vuote

    // Separa nome e cognome (Tuttocampo usa formato "Cognome Nome")
    const parti = nomeCompleto.split(' ');
    const cognome = parti[0] || '';
    const nome = parti.slice(1).join(' ') || '';

    // Numero maglia — opzionale
    const numeroRaw = $row.find('td.player .number').text().trim();
    const numero = numeroRaw ? numeroRaw.replace(/[()]/g, '') : null;

    // Data di nascita
    const dataNascitaRaw = $row.find('td.birthdate').text().trim();
    const dataNascita = dataNascitaRaw === '-' ? null : dataNascitaRaw;

    // Foto (lazy load → data-src)
    const fotoRaw = $row.find('td.player_photo img').attr('data-src') || null;
    const foto = fotoRaw?.includes('default_player') ? null : fotoRaw ?? null;

    // Colonne statistiche
    const tds = $row.find('td');

    giocatori.push({
      tuttocampoId: $row.find('td.player a').attr('data-player-id') || null,
      nomeCompleto,
      nome,
      cognome,
      numero,
      dataNascita,
      ruolo: tds.eq(3).text().trim() || null,   // POR / DIF / CEN / ATT
      gol: parseInt(tds.eq(4).text().trim()) || 0,
      presenze: parseInt(tds.eq(5).text().trim()) || 0,
      ammonizioni: parseInt(tds.eq(6).text().trim()) || 0,
      espulsioni: parseInt(tds.eq(7).text().trim()) || 0,
      foto,
      profileUrl: $row.find('td.player a').attr('href') || null,
    });
  });

  return giocatori;
}
