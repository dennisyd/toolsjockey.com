// Modular CSV converter for Excel data
export interface CSVOptions {
  delimiter: string; // e.g., ',', ';', '\t', '|'
  encoding: string; // 'UTF-8', 'UTF-16', 'ASCII'
  quoting: 'always' | 'minimal' | 'never';
  headers: boolean;
  lineEnding: '\r\n' | '\n' | '\r';
}

// worksheetData: array of arrays (rows)
export function csvConverter(worksheetData: string[][], options: CSVOptions): string {
  if (!worksheetData || worksheetData.length === 0) return '';
  const delimiter = options.delimiter || ',';
  const lineEnding = options.lineEnding || '\n';
  const quoting = options.quoting || 'minimal';
  const headers = options.headers !== false;
  // Helper to quote a cell if needed
  const quoteCell = (cell: string) => {
    if (cell == null) cell = '';
    const needsQuote = quoting === 'always' || (quoting === 'minimal' && (cell.includes(delimiter) || cell.includes('"') || cell.includes('\n') || cell.includes('\r')));
    if (needsQuote) {
      return '"' + cell.replace(/"/g, '""') + '"';
    }
    return cell;
  };
  let rows = worksheetData;
  // If headers is false, skip the first row
  if (!headers && rows.length > 1) rows = rows.slice(1);
  const csvRows = rows.map(row => row.map(cell => quoteCell(cell?.toString() ?? '')).join(delimiter));
  return csvRows.join(lineEnding);
} 