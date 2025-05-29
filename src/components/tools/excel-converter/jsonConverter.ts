// Modular JSON converter for Excel data
export interface JSONOptions {
  structure: 'arrayOfObjects' | 'nestedBySheet' | 'hierarchical' | 'flattened';
  propertyNaming: 'original' | 'camelCase' | 'snake_case' | 'custom';
  pretty: boolean;
  // TODO: Add more options (type preservation, sheet separation, etc.)
}

function toCamelCase(str: string) {
  return str.replace(/[_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '').replace(/^./, s => s.toLowerCase());
}
function toSnakeCase(str: string) {
  return str.replace(/([A-Z])/g, '_$1').replace(/\s+/g, '_').toLowerCase();
}

export function jsonConverter(worksheetData: string[][], options: JSONOptions): string {
  if (!worksheetData || worksheetData.length < 2) return '[]';
  const [header, ...rows] = worksheetData;
  let keys = header;
  // Property naming
  if (options.propertyNaming === 'camelCase') keys = header.map(toCamelCase);
  if (options.propertyNaming === 'snake_case') keys = header.map(toSnakeCase);
  // Structure
  let result: any = [];
  if (options.structure === 'arrayOfObjects') {
    result = rows.map(row => Object.fromEntries(keys.map((k, i) => [k, row[i] ?? ''])));
  } else if (options.structure === 'flattened') {
    result = rows.map(row => keys.map((_, i) => row[i] ?? ''));
  } else if (options.structure === 'nestedBySheet') {
    // For single sheet, just wrap in an object
    result = { Sheet1: rows.map(row => Object.fromEntries(keys.map((k, i) => [k, row[i] ?? '']))) };
  } else if (options.structure === 'hierarchical') {
    // For demo, treat first column as parent, group by parent
    const group: Record<string, any[]> = {};
    rows.forEach(row => {
      const parent = row[0] || 'root';
      if (!group[parent]) group[parent] = [];
      group[parent].push(Object.fromEntries(keys.map((k, i) => [k, row[i] ?? ''])));
    });
    result = group;
  }
  return options.pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result);
} 