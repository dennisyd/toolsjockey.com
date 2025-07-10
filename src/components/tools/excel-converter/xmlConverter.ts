// Modular XML converter for Excel data
export interface XMLOptions {
  rootElement: string;
}

export function xmlConverter(worksheetData: string[][], options: XMLOptions): string {
  if (!worksheetData || worksheetData.length < 2) return `<${options.rootElement}/>`;
  const [header, ...rows] = worksheetData;
  const xmlRows = rows.map(row =>
    `  <row>` +
      header.map((h, i) => `<${h}>${row[i] ?? ''}</${h}>`).join('') +
    `</row>`
  );
  return `<${options.rootElement}>
${xmlRows.join('\n')}
</${options.rootElement}>`;
} 