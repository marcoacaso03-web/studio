import { NextResponse } from 'next/server';
import { scrapeRosa } from '@/lib/tuttocampo-scraper';

export async function POST(request: Request) {
  try {
    const { squadraUrl } = await request.json();

    if (!squadraUrl) {
      return NextResponse.json(
        { error: 'URL della squadra mancante' },
        { status: 400 }
      );
    }

    if (!squadraUrl.startsWith('https://www.tuttocampo.it/')) {
        return NextResponse.json(
          { error: 'URL non valido. Assicurati che sia un URL di tuttocampo.it' },
          { status: 400 }
        );
    }

    console.log(`[api/import-rosa] Avvio scraping per url=${squadraUrl}`);
    const giocatori = await scrapeRosa(squadraUrl);

    console.log(`[api/import-rosa] Trovati ${giocatori.length} giocatori`);

    return NextResponse.json({
      success: true,
      imported: giocatori.length,
      giocatori: giocatori.map((g) => ({
        name: `${g.nome} ${g.cognome}`.trim(),
        role: g.ruolo,
        // Altre info utili che potremmo voler passare
        details: {
            tuttocampoId: g.tuttocampoId,
            numero: g.numero,
            dataNascita: g.dataNascita,
            foto: g.foto
        }
      })),
    });
  } catch (error: any) {
    console.error('[api/import-rosa] Errore:', error.message);
    return NextResponse.json(
      { error: error.message || 'Errore interno del server' },
      { status: 500 }
    );
  }
}
