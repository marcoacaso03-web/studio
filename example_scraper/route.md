// app/api/admin/import-rosa/route.js
// API route protetta da ADMIN_SECRET — solo tu puoi chiamarla

import { NextResponse } from 'next/server';
import { scrapeRosa } from '@/lib/tuttocampoScraper';
import { db } from '@/lib/firebaseAdmin';

export async function POST(request) {
  try {
    // ── Autenticazione semplice con header segreto ──────────────────────
    const authHeader = request.headers.get('x-admin-secret');
    if (authHeader !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
    }

    // ── Leggi il body ───────────────────────────────────────────────────
    const body = await request.json();
    const { squadraUrl, teamId } = body;

    if (!squadraUrl || !teamId) {
      return NextResponse.json(
        { error: 'squadraUrl e teamId sono obbligatori' },
        { status: 400 }
      );
    }

    // ── Scraping ────────────────────────────────────────────────────────
    console.log(`[import-rosa] Avvio scraping per teamId=${teamId}, url=${squadraUrl}`);
    const giocatori = await scrapeRosa(squadraUrl);

    // ── Salvataggio su Firestore ────────────────────────────────────────
    // Struttura: teams/{teamId}/players/{tuttocampoId}
    const batch = db.batch();

    for (const g of giocatori) {
      const docId = g.tuttocampoId || g.nomeCompleto.replace(/\s+/g, '_').toLowerCase();
      const ref = db.collection('teams').doc(teamId).collection('players').doc(docId);

      batch.set(ref, {
        ...g,
        importedAt: new Date().toISOString(),
      }, { merge: true }); // merge: true per non sovrascrivere dati aggiunti manualmente
    }

    // Aggiorna anche il documento della squadra con timestamp import
    const teamRef = db.collection('teams').doc(teamId);
    batch.set(teamRef, {
      lastRosaImport: new Date().toISOString(),
      playerCount: giocatori.length,
    }, { merge: true });

    await batch.commit();

    console.log(`[import-rosa] Salvati ${giocatori.length} giocatori per teamId=${teamId}`);

    return NextResponse.json({
      success: true,
      imported: giocatori.length,
      giocatori: giocatori.map((g) => ({
        nome: g.nome,
        cognome: g.cognome,
        ruolo: g.ruolo,
      })),
    });
  } catch (error) {
    console.error('[import-rosa] Errore:', error.message);
    return NextResponse.json(
      { error: error.message || 'Errore interno del server' },
      { status: 500 }
    );
  }
}
