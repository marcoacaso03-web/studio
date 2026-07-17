'use client';

// app/admin/import-rosa/page.jsx
// Pagina admin per importare la rosa da Tuttocampo
// Accessibile solo a te — proteggi la route con middleware o auth check

import { useState } from 'react';

const RUOLO_COLORS = {
  POR: { bg: '#fef9c3', text: '#854d0e', label: 'Portiere' },
  DIF: { bg: '#dbeafe', text: '#1e40af', label: 'Difensore' },
  CEN: { bg: '#dcfce7', text: '#166534', label: 'Centrocampista' },
  ATT: { bg: '#fee2e2', text: '#991b1b', label: 'Attaccante' },
};

export default function ImportRosaPage() {
  const [squadraUrl, setSquadraUrl] = useState('');
  const [teamId, setTeamId] = useState('');
  const [stato, setStato] = useState('idle'); // idle | loading | success | error
  const [risultato, setRisultato] = useState(null);
  const [errore, setErrore] = useState('');

  async function handleImport() {
    if (!squadraUrl.trim() || !teamId.trim()) {
      setErrore('Inserisci sia l\'URL della squadra che il Team ID.');
      return;
    }

    setStato('loading');
    setErrore('');
    setRisultato(null);

    try {
      const res = await fetch('/api/admin/import-rosa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET || '',
        },
        body: JSON.stringify({ squadraUrl: squadraUrl.trim(), teamId: teamId.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore sconosciuto');
      }

      setRisultato(data);
      setStato('success');
    } catch (err) {
      setErrore(err.message);
      setStato('error');
    }
  }

  function handleReset() {
    setStato('idle');
    setRisultato(null);
    setErrore('');
    setSquadraUrl('');
    setTeamId('');
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>DEVELOPER ONLY</div>
          <h1 style={styles.title}>Importa Rosa</h1>
          <p style={styles.subtitle}>
            Scraping automatico da Tuttocampo → Firestore
          </p>
        </div>

        {/* Form */}
        {stato !== 'success' && (
          <div style={styles.card}>
            <div style={styles.field}>
              <label style={styles.label}>URL Squadra Tuttocampo</label>
              <input
                style={styles.input}
                type="url"
                placeholder="https://www.tuttocampo.it/Italia/.../Squadra/NomeSquadra/123456"
                value={squadraUrl}
                onChange={(e) => setSquadraUrl(e.target.value)}
                disabled={stato === 'loading'}
              />
              <span style={styles.hint}>
                Copia l'URL dalla pagina della squadra su Tuttocampo
              </span>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Team ID (su Firestore)</label>
              <input
                style={styles.input}
                type="text"
                placeholder="es. trento_u14_2024"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                disabled={stato === 'loading'}
              />
              <span style={styles.hint}>
                ID del documento squadra su Firestore dove salvare i giocatori
              </span>
            </div>

            {errore && (
              <div style={styles.errorBox}>
                <span style={styles.errorIcon}>⚠</span> {errore}
              </div>
            )}

            <button
              style={{
                ...styles.button,
                ...(stato === 'loading' ? styles.buttonLoading : {}),
              }}
              onClick={handleImport}
              disabled={stato === 'loading'}
            >
              {stato === 'loading' ? (
                <span style={styles.buttonInner}>
                  <span style={styles.spinner} /> Scraping in corso...
                </span>
              ) : (
                <span style={styles.buttonInner}>
                  <span>⬇</span> Importa Rosa
                </span>
              )}
            </button>

            {stato === 'loading' && (
              <p style={styles.loadingNote}>
                Playwright sta facendo login e scaricando i dati. Può richiedere 15–30 secondi.
              </p>
            )}
          </div>
        )}

        {/* Risultato */}
        {stato === 'success' && risultato && (
          <div style={styles.successContainer}>
            <div style={styles.successHeader}>
              <span style={styles.successIcon}>✓</span>
              <div>
                <div style={styles.successTitle}>Importazione completata</div>
                <div style={styles.successSub}>
                  {risultato.imported} giocatori salvati su Firestore
                </div>
              </div>
            </div>

            {/* Tabella giocatori */}
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>Cognome</th>
                    <th style={styles.th}>Nome</th>
                    <th style={styles.th}>Ruolo</th>
                  </tr>
                </thead>
                <tbody>
                  {risultato.giocatori.map((g, i) => {
                    const ruoloInfo = RUOLO_COLORS[g.ruolo] || { bg: '#f3f4f6', text: '#374151', label: g.ruolo };
                    return (
                      <tr key={i} style={i % 2 === 0 ? styles.trEven : styles.trOdd}>
                        <td style={styles.td}>{i + 1}</td>
                        <td style={{ ...styles.td, fontWeight: 600 }}>{g.cognome}</td>
                        <td style={styles.td}>{g.nome}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.ruoloBadge,
                            backgroundColor: ruoloInfo.bg,
                            color: ruoloInfo.text,
                          }}>
                            {ruoloInfo.label || g.ruolo}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button style={styles.resetButton} onClick={handleReset}>
              Nuova importazione
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Stili inline ──────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '48px 16px',
    fontFamily: "'Geist", 'ui-sans-serif', 'system-ui', 'sans-serif',
  },
  container: {
    width: '100%',
    maxWidth: 640,
  },
  header: {
    marginBottom: 32,
  },
  badge: {
    display: 'inline-block',
    backgroundColor: '#7c3aed',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    padding: '3px 10px',
    borderRadius: 4,
    marginBottom: 12,
  },
  title: {
    color: '#f8fafc',
    fontSize: 32,
    fontWeight: 700,
    margin: '0 0 8px',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 15,
    margin: 0,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 28,
    border: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: '0.02em',
  },
  input: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#f1f5f9',
    fontSize: 14,
    padding: '10px 14px',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  hint: {
    color: '#64748b',
    fontSize: 12,
  },
  errorBox: {
    backgroundColor: '#450a0a',
    border: '1px solid #7f1d1d',
    borderRadius: 8,
    color: '#fca5a5',
    fontSize: 13,
    padding: '10px 14px',
  },
  errorIcon: {
    marginRight: 6,
  },
  button: {
    backgroundColor: '#7c3aed',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    padding: '12px 20px',
    transition: 'background-color 0.15s',
  },
  buttonLoading: {
    backgroundColor: '#4c1d95',
    cursor: 'not-allowed',
  },
  buttonInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
  loadingNote: {
    color: '#64748b',
    fontSize: 12,
    textAlign: 'center',
    margin: 0,
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  successHeader: {
    backgroundColor: '#052e16',
    border: '1px solid #166534',
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  successIcon: {
    backgroundColor: '#16a34a',
    color: '#fff',
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  successTitle: {
    color: '#86efac',
    fontWeight: 600,
    fontSize: 15,
  },
  successSub: {
    color: '#4ade80',
    fontSize: 13,
    marginTop: 2,
  },
  tableWrapper: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    border: '1px solid #334155',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#0f172a',
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    padding: '10px 16px',
    textAlign: 'left',
    textTransform: 'uppercase',
  },
  td: {
    color: '#e2e8f0',
    fontSize: 14,
    padding: '10px 16px',
    borderTop: '1px solid #1e293b',
  },
  trEven: {
    backgroundColor: '#1e293b',
  },
  trOdd: {
    backgroundColor: '#162032',
  },
  ruoloBadge: {
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.05em',
    padding: '2px 8px',
  },
  resetButton: {
    backgroundColor: 'transparent',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 14,
    padding: '10px 16px',
    alignSelf: 'flex-start',
  },
};
