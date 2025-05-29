// Modular Google Sheets converter for Excel data
export interface SheetsOptions {
  formulaPreservation: boolean;
  multiSheet: boolean;
  importInstructions: boolean;
  // TODO: Add more options (sharing, naming, etc.)
}

// worksheetData: array of arrays (rows)
export function sheetsConverter(worksheetData: string[][], options: SheetsOptions): { csv: string; instructions: string } {
  // Use CSV logic, but always UTF-8, comma, and LF
  const csv = worksheetData.map(row => row.map(cell => {
    if (cell == null) cell = '';
    if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
      return '"' + cell.replace(/"/g, '""') + '"';
    }
    return cell;
  }).join(',')).join('\n');
  let instructions = '';
  if (options.importInstructions) {
    instructions = 'To import this CSV into Google Sheets: Open a new sheet, go to File > Import > Upload, select this file, and choose UTF-8, comma as delimiter.';
  }
  return { csv, instructions };
}

// Helper: Google Sheets import instructions
export function getSheetsImportInstructions(): string {
  return 'To import this CSV into Google Sheets: Open a new sheet, go to File > Import > Upload, select this file, and choose UTF-8, comma as delimiter.';
} 