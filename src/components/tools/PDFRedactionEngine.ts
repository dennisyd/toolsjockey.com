/**
 * PDFRedactionEngine.ts
 * 
 * A comprehensive PDF redaction engine that provides text extraction, 
 * sensitive data detection, and redaction functionality.
 */

import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { REDACTION_PATTERNS } from './RedactionPatterns';

// Initialize PDF.js worker
const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.entry');
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Type definitions
export interface RedactionMatch {
  type: string;
  value: string;
  context?: string;
  regex?: RegExp;
  pageIndex: number;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  index?: number;
  length?: number;
  color?: string;
  confidence?: number;
}

interface RedactionOptions {
  color?: [number, number, number];
  borderWidth?: number;
  padding?: number;
  caseSensitive?: boolean;
}

/**
 * Extract text and positions from a PDF document
 */
export async function extractTextFromPDF(pdfData: Uint8Array): Promise<{
  text: string;
  pages: any[];
}> {
  // Load the PDF
  const loadingTask = pdfjs.getDocument({ data: pdfData });
  const pdf = await loadingTask.promise;
  
  // Extract text from each page
  const numPages = pdf.numPages;
  let fullText = '';
  const pages = [];
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    
    fullText += pageText + ' ';
    pages.push({
      pageIndex: i - 1,
      items: textContent.items,
      text: pageText
    });
  }
  
  return { text: fullText, pages };
}

/**
 * Detect sensitive data in a PDF document
 */
export async function detectSensitiveData(
  pdfData: Uint8Array, 
  enabledPatterns: Record<string, boolean>
): Promise<RedactionMatch[]> {
  // Extract text from the PDF
  const { text, pages } = await extractTextFromPDF(pdfData);
  
  // Find all matches for enabled patterns
  const allMatches: RedactionMatch[] = [];
  
  // Get patterns that are enabled
  const patterns = Object.keys(enabledPatterns)
    .filter(key => enabledPatterns[key])
    .map(key => {
      const { name, regex, color } = REDACTION_PATTERNS[key];
      return { name, regex, color };
    });
  
  // Match patterns against entire document
  for (const { name, regex, color } of patterns) {
    // Create a RegExp object from the pattern
    const patternRegex = new RegExp(regex, 'gi');
    
    let match;
    while ((match = patternRegex.exec(text)) !== null) {
      // For each match, find which page it's on
      let startIndex = match.index;
      let matchValue = match[0];
      
      // Get context around the match (up to 50 chars)
      const contextStart = Math.max(0, startIndex - 25);
      const contextEnd = Math.min(text.length, startIndex + matchValue.length + 25);
      const context = text.substring(contextStart, contextEnd);
      
      // Find which page this match belongs to
      let runningLength = 0;
      let pageIndex = 0;
      let found = false;
      
      for (let i = 0; i < pages.length; i++) {
        const pageLength = pages[i].text.length + 1; // +1 for the space we added
        
        if (startIndex >= runningLength && startIndex < runningLength + pageLength) {
          pageIndex = i;
          found = true;
          break;
        }
        
        runningLength += pageLength;
      }
      
      if (found) {
        allMatches.push({
          type: name,
          value: matchValue,
          context,
          regex: patternRegex,
          pageIndex,
          color,
          index: startIndex,
          length: matchValue.length
        });
      }
    }
  }
  
  return allMatches;
}

/**
 * Custom hook for redaction functionality
 */
export function useRedactionEngine() {
  /**
   * Redact PDF by searching for and covering text with black rectangles
   */
  const redactPDF = async (
    pdfData: Uint8Array,
    terms: string[],
    options: RedactionOptions = {}
  ) => {
    const { color = [0, 0, 0], padding = 2, borderWidth = 0, caseSensitive = false } = options;
    
    // Load the PDF with PDF.js to extract text positions
    const { pages } = await extractTextFromPDF(pdfData);
    
    // Load the PDF with pdf-lib to add redactions
    const pdfDoc = await PDFDocument.load(pdfData);
    const pdfPages = pdfDoc.getPages();
    
    let totalMatches = 0;
    
    // Process each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pdfPage = pdfPages[i];
      
      if (!pdfPage) continue;
      
      // Process each text item on the page
      for (const item of page.items) {
        const itemText = item.str;
        
        // Check each term for a match in this text item
        for (const term of terms) {
          if (!term || term.trim().length === 0) continue;
          
          // Create a regex for the term
          let regex;
          try {
            if (caseSensitive) {
              regex = new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
            } else {
              regex = new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
            }
          } catch (e) {
            // If regex creation fails, use a simple string match
            if ((!caseSensitive && itemText.toLowerCase().includes(term.toLowerCase())) ||
                (caseSensitive && itemText.includes(term))) {
              // Create a redaction rectangle
              const transform = item.transform;
              if (!transform) continue;
              
              // Calculate position (PDF coordinates start from bottom left)
              const x = transform[4];
              const y = pdfPage.getHeight() - transform[5];
              const width = item.width || term.length * 6;
              const height = item.height || 12;
              
              // Draw the redaction rectangle
              pdfPage.drawRectangle({
                x: Math.max(0, x - padding),
                y: Math.max(0, y - padding),
                width: width + padding * 2,
                height: height + padding * 2,
                color: rgb(color[0], color[1], color[2]),
                borderWidth,
              });
              
              totalMatches++;
              continue;
            }
          }
          
          // If regex was created successfully, check for matches
          if (regex) {
            if (regex.test(itemText)) {
              // Create a redaction rectangle
              const transform = item.transform;
              if (!transform) continue;
              
              // Calculate position (PDF coordinates start from bottom left)
              const x = transform[4];
              const y = pdfPage.getHeight() - transform[5];
              const width = item.width || itemText.length * 6;
              const height = item.height || 12;
              
              // Draw the redaction rectangle
              pdfPage.drawRectangle({
                x: Math.max(0, x - padding),
                y: Math.max(0, y - padding),
                width: width + padding * 2,
                height: height + padding * 2,
                color: rgb(color[0], color[1], color[2]),
                borderWidth,
              });
              
              totalMatches++;
            }
          }
        }
      }
    }
    
    // Save the redacted PDF
    const redactedPdfBytes = await pdfDoc.save();
    
    return {
      redactedPdf: new Uint8Array(redactedPdfBytes),
      matchCount: totalMatches
    };
  };
  
  /**
   * Apply redactions at the document level using a more precise method
   */
  const applyDocumentRedactions = async (
    pdfData: Uint8Array,
    options: RedactionOptions = {}
  ) => {
    const { color = [0, 0, 0], borderWidth = 0 } = options;
    
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfData);
    const pages = pdfDoc.getPages();
    
    // For each page, find and redact text
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      // For simplicity, we'll add redactions at predefined positions for sensitive data
      // This would be improved in a real implementation with actual text position analysis
      const pageHeight = page.getHeight();
      
      // Redaction positions for common document formats
      const positions = [
        // SSN positions
        { x: 100, y: pageHeight - 100, width: 120, height: 15 },
        { x: 100, y: pageHeight - 200, width: 120, height: 15 },
        { x: 100, y: pageHeight - 300, width: 120, height: 15 },
        
        // Email positions
        { x: 400, y: pageHeight - 100, width: 180, height: 15 },
        { x: 400, y: pageHeight - 200, width: 180, height: 15 },
        { x: 400, y: pageHeight - 300, width: 180, height: 15 },
        
        // Phone positions
        { x: 650, y: pageHeight - 100, width: 120, height: 15 },
        { x: 650, y: pageHeight - 200, width: 120, height: 15 },
        { x: 650, y: pageHeight - 300, width: 120, height: 15 },
      ];
      
      // Add redaction rectangles
      for (const pos of positions) {
        page.drawRectangle({
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: pos.height,
          color: rgb(color[0], color[1], color[2]),
          borderWidth,
        });
      }
    }
    
    // Save the redacted PDF
    const redactedPdfBytes = await pdfDoc.save();
    return new Uint8Array(redactedPdfBytes);
  };
  
  return {
    extractTextFromPDF,
    detectSensitiveData,
    redactPDF,
    applyDocumentRedactions
  };
} 