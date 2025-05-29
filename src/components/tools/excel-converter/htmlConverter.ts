// Modular HTML converter for Excel data
export interface HTMLOptions {
  template: 'basic' | 'professional' | 'modern' | 'minimal' | 'custom';
  theme: string; // CSS theme or color scheme
  interactivity: boolean;
  printOptimized: boolean;
  // TODO: Add more options (responsive, ARIA, etc.)
}

// worksheetData: array of arrays (rows)
export function htmlConverter(worksheetData: string[][], _options: HTMLOptions): string {
  if (!worksheetData || worksheetData.length === 0) return '';
  const [header, ...rows] = worksheetData;
  // Basic CSS for demo
  const css = `
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; }
    th { background: #f3f4f6; }
    tr:nth-child(even) { background: #f9fafb; }
    @media (max-width: 600px) { th, td { font-size: 12px; padding: 4px 6px; } }
  `;
  const table = `
    <table aria-label="Excel Data Table">
      <thead><tr>${header.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.map(row => `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;
  return `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Excel Table</title><style>${css}</style></head><body>${table}</body></html>`;
} 