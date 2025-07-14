// Modular HTML converter for Excel data
export interface HTMLOptions {
  template: 'basic' | 'professional' | 'modern' | 'minimal';
  theme?: string;
  interactivity?: boolean;
  printOptimized?: boolean;
}

// worksheetData: array of arrays (rows)
export function htmlConverter(data: string[][], options: HTMLOptions): string {
  switch (options.template) {
    case 'professional':
      return renderProfessionalTable(data);
    case 'modern':
      return renderModernTable(data);
    case 'minimal':
      return renderMinimalTable(data);
    case 'basic':
    default:
      return renderBasicTable(data);
  }
}

function renderBasicTable(data: string[][]): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <title>Excel Table</title>
  <style>
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; }
    th { background: #f3f4f6; }
    tr:nth-child(even) { background: #f9fafb; }
    @media (max-width: 600px) { th, td { font-size: 12px; padding: 4px 6px; } }
  </style>
</head>
<body>
  ${tableHTML(data)}
</body>
</html>
  `.trim();
}

function renderProfessionalTable(data: string[][]): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <title>Professional Excel Table</title>
  <style>
    table { width: 100%; border-collapse: collapse; font-size: 15px; }
    th, td { border: 1px solid #0074D9; padding: 8px 14px; }
    th { background: #0074D9; color: #fff; font-weight: bold; }
    tr:nth-child(even) { background: #f0f8ff; }
    caption { caption-side: top; font-size: 18px; font-weight: bold; margin-bottom: 8px; }
  </style>
</head>
<body>
  <table aria-label="Excel Data Table">
    <caption>Professional Excel Table</caption>
    ${tableHTML(data, false)}
  </table>
</body>
</html>
  `.trim();
}

function renderModernTable(data: string[][]): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <title>Modern Excel Table</title>
  <style>
    table { width: 100%; border-radius: 8px; border-collapse: separate; border-spacing: 0; font-size: 15px; box-shadow: 0 2px 8px #ccc; }
    th, td { padding: 10px 16px; }
    th { background: #22223b; color: #fff; }
    tr:nth-child(even) { background: #f2e9e4; }
  </style>
</head>
<body>
  ${tableHTML(data)}
</body>
</html>
  `.trim();
}

function renderMinimalTable(data: string[][]): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset='utf-8'>
  <title>Minimal Excel Table</title>
  <style>
    table { width: 100%; border: none; font-size: 14px; }
    th, td { border: none; padding: 6px 10px; }
    th { background: #eee; }
    tr:nth-child(even) { background: #fafafa; }
  </style>
</head>
<body>
  ${tableHTML(data)}
</body>
</html>
  `.trim();
}

// Helper to generate table HTML
function tableHTML(data: string[][], includeTableTag = true): string {
  if (!data || data.length === 0) return '';
  const head = data[0];
  const body = data.slice(1);
  const thead = `<thead><tr>${head.map(cell => `<th>${cell}</th>`).join('')}</tr></thead>`;
  const tbody = `<tbody>${body.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>`;
  if (includeTableTag) {
    return `<table aria-label="Excel Data Table">${thead}${tbody}</table>`;
  }
  return `${thead}${tbody}`;
} 