import React from 'react';
import fs from 'fs';
import path from 'path';

export const metadata = {
  title: 'Termini di Servizio – Pitchman',
  description: 'Termini e condizioni di utilizzo della web app Pitchman.',
};

export default function TermsPage() {
  const filePath = path.join(process.cwd(), 'docs', 'TerminiDiServizio.md');
  let markdown = '';
  try {
    markdown = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    markdown = 'Impossibile caricare i termini di servizio.';
  }
  return (
    <div className="max-w-3xl mx-auto p-6 prose prose-lg dark:prose-invert">
      <h1>Termini di Servizio</h1>
      <pre className="whitespace-pre-wrap">{markdown}</pre>
    </div>
  );
}
