import React, { useEffect } from 'react';

const UnlockPDFPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Unlock PDF – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Remove password protection (if known) — all local.');
  }, []);
  return (
    <main className="container-app mx-auto px-2 md:px-0 py-8">
      <h1 className="text-2xl font-bold mb-4">Unlock PDF</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">Remove password protection (if known) — all local.</p>
      <div className="rounded bg-yellow-50 dark:bg-yellow-900/20 p-6 text-center text-lg text-gray-500">Unlock PDF tool coming soon.</div>
    </main>
  );
};

export default UnlockPDFPage; 