// PDFProcessor.ts
// Core PDF processing for redaction tool
import type { RedactionMatch } from './PDFRedactionEngine';

// PDF-lib and PDF.js will be loaded globally or via import
// (Assume window.pdfjsLib and window.PDFLib are available)

/**
 * Extracts text and positions from all pages of a PDF using PDF.js, tracking start/end indices for each item
 * @param {Uint8Array} pdfData
 * @returns {Promise<{pages: {text: string, pageIndex: number, items: any[]}[]}>}
 */
export async function extractTextFromPDF(pdfData: Uint8Array) {
  // @ts-ignore
  const pdf = await window.pdfjsLib.getDocument({ data: pdfData }).promise;
  const pages = [];
  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const content = await page.getTextContent();
    let text = '';
    let idx = 0;
    const itemsWithIndices = content.items.map((item: any) => {
      const start = idx;
      text += item.str;
      idx += item.str.length;
      return { ...item, start, end: idx };
    });
    pages.push({ text, pageIndex: i, items: itemsWithIndices });
  }
  return { pages };
}

/**
 * Maps detected matches to PDF coordinates using text item positions and text indices
 * @param {any[]} items - PDF.js text items for the page (with start/end)
 * @param {RedactionMatch[]} matches
 * @returns {Array<{match: RedactionMatch, rect: {x: number, y: number, w: number, h: number}}>} 
 */
export function mapDetectionsToCoords(items: any[], matches: RedactionMatch[]) {
  const results: { match: RedactionMatch, rect: { x: number, y: number, w: number, h: number } }[] = [];
  for (const match of matches) {
    // Find all items whose text range overlaps with the match's range
    const overlapping = items.filter((it: any) =>
      (it.start < match.index + match.length) && (it.end > match.index)
    );
    if (overlapping.length > 0) {
      // Compute bounding box covering all overlapping items
      const xs = overlapping.map(it => it.transform[4]);
      const ys = overlapping.map(it => it.transform[5]);
      const ws = overlapping.map(it => it.width);
      const hs = overlapping.map(it => it.height || 12);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const maxX = Math.max(...xs.map((x, i) => x + ws[i]));
      const maxY = Math.max(...ys.map((y, i) => y + hs[i]));
      results.push({
        match,
        rect: {
          x: minX,
          y: minY,
          w: maxX - minX,
          h: maxY - minY,
        },
      });
    }
  }
  return results;
}

/**
 * Applies redactions to a PDF using PDF-lib
 * @param {Uint8Array} pdfData
 * @param {Array<{pageIndex: number, rect: {x: number, y: number, w: number, h: number}}>} redactions
 * @returns {Promise<Uint8Array>} - Redacted PDF data
 */
export async function applyRedactionsToPDF(pdfData: Uint8Array, redactions: Array<{ pageIndex: number, rect: { x: number, y: number, w: number, h: number } }>) {
  // @ts-ignore
  const { PDFDocument, rgb } = window.PDFLib;
  const pdfDoc = await PDFDocument.load(pdfData);
  for (const { pageIndex, rect } of redactions) {
    const page = pdfDoc.getPage(pageIndex);
    // Draw black rectangle over redacted area
    page.drawRectangle({
      x: rect.x,
      y: rect.y,
      width: rect.w,
      height: rect.h,
      color: rgb(0, 0, 0),
      borderColor: rgb(0, 0, 0),
      borderWidth: 0,
    });
  }
  pdfDoc.setTitle('Redacted PDF');
  pdfDoc.setSubject('Redacted');
  pdfDoc.setKeywords(['redacted']);
  pdfDoc.setProducer('ToolsJockey PDF Redaction Tool');
  pdfDoc.setCreator('ToolsJockey');
  const redactedBytes = await pdfDoc.save();
  return redactedBytes;
} 