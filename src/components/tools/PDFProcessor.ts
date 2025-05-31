// PDFProcessor.ts
// Core PDF processing for redaction tool
import { detectSensitiveData } from './PDFRedactionEngine';
import { REDACTION_PATTERNS } from './RedactionPatterns';
import type { PDFRedactionOptions } from './types';

// PDF-lib and PDF.js will be loaded globally or via import
// (Assume window.pdfjsLib and window.PDFLib are available)

/**
 * Enhanced extractTextFromPDF: also detects phone numbers using a sliding window over text items
 * Returns both the usual text and a list of detected phone numbers with their item indices
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
    
    // Enhanced detection using new engine
    const enabledPatterns = Object.keys(REDACTION_PATTERNS).reduce(
      (acc, key) => ({ ...acc, [key]: true }), {}
    );
    const allDetections = await detectSensitiveData(pdfData, enabledPatterns);
    
    pages.push({ 
      text, 
      pageIndex: i, 
      items: itemsWithIndices, 
      detections: allDetections 
    });
  }
  return { pages };
}

/**
 * Maps detected matches to PDF coordinates using text item positions and text indices
 * @param {any[]} items - PDF.js text items for the page (with start/end)
 * @param {RedactionMatch[]} matches
 * @returns {Array<{match: RedactionMatch, rect: {x: number, y: number, w: number, h: number}}>} 
 */
export function mapDetectionsToCoords(items: any[], matches: any[]) {
  const PADDING = 2; // Padding in PDF units
  const results: { match: any, rect: { x: number, y: number, w: number, h: number } }[] = [];
  for (const match of matches) {
    let overlapping: any[] = [];
    if (match.itemIndices && Array.isArray(match.itemIndices)) {
      overlapping = match.itemIndices.map((idx: number) => items[idx]).filter(Boolean);
    } else {
      overlapping = items.filter((it: any) =>
        (it.start < match.index + match.length) && (it.end > match.index)
      );
    }
    if (overlapping.length > 0) {
      const xs = overlapping.map(it => it.transform[4]);
      const ys = overlapping.map(it => it.transform[5]);
      const ws = overlapping.map(it => it.width);
      const hs = overlapping.map(it => it.height || 12);
      const minX = Math.min(...xs) - PADDING;
      const minY = Math.min(...ys) - PADDING;
      const maxX = Math.max(...xs.map((x, i) => x + ws[i])) + PADDING;
      const maxY = Math.max(...ys.map((y, i) => y + hs[i])) + PADDING;
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

/**
 * Removes detected sensitive substrings from the PDF text and rebuilds the PDF with the cleaned text.
 * @param {Uint8Array} pdfData - The original PDF data
 * @param {Array<{ pageIndex: number, matches: Array<{ index: number, length: number }> }>} detectionsPerPage
 * @returns {Promise<Uint8Array>} - The cleaned PDF data
 */
export async function removeSensitiveTextFromPDF(
  pdfData: Uint8Array,
  detectionsPerPage: Array<{ pageIndex: number; matches: Array<{ index: number; length: number }> }>
) {
  // @ts-ignore
  const { PDFDocument, StandardFonts } = window.PDFLib;
  // Extract text from the original PDF
  const { pages } = await extractTextFromPDF(pdfData);
  // Create a new PDF
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < pages.length; i++) {
    let pageText = pages[i].text;
    // Find matches for this page
    const pageDetections = detectionsPerPage.find(p => p.pageIndex === i)?.matches || [];
    // Sort matches by index descending to avoid shifting
    const sorted = [...pageDetections].sort((a, b) => b.index - a.index);
    for (const match of sorted) {
      pageText = pageText.slice(0, match.index) + pageText.slice(match.index + match.length);
    }
    // Add a new page with the cleaned text
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    // Split text into lines to avoid overflow
    const lines = pageText.split(/\r?\n/);
    let y = height - 40;
    for (const line of lines) {
      page.drawText(line, {
        x: 40,
        y,
        size: 12,
        font,
        color: pdfDoc.constructor.rgb ? pdfDoc.constructor.rgb(0, 0, 0) : undefined,
        maxWidth: width - 80,
      });
      y -= 16;
      if (y < 40) break; // Stop if out of space
    }
  }
  pdfDoc.setTitle('Redacted PDF');
  pdfDoc.setSubject('Redacted');
  pdfDoc.setKeywords(['redacted']);
  pdfDoc.setProducer('ToolsJockey PDF Redaction Tool');
  pdfDoc.setCreator('ToolsJockey');
  const cleanedBytes = await pdfDoc.save();
  return cleanedBytes;
}

/**
 * Applies visual redactions to a PDF using PDF-lib to place black rectangles over sensitive data.
 * Uses the enhanced detection engine for more accurate redaction.
 * 
 * @param {Uint8Array} pdfData - The original PDF data
 * @param {Array<{ pageIndex: number; matches: Array<{ index: number; length: number }> }>} detectionsPerPage
 * @param {Array<Array<any>>} textItemsPerPage - Array of text items per page (from extractTextFromPDF)
 * @returns {Promise<Uint8Array>} - The redacted PDF data
 */
export async function rebuildPDFWithRedactedTextItems(
  pdfData: Uint8Array,
  detectionsPerPage: Array<{ pageIndex: number; matches: Array<{ index: number; length: number }> }>,
  textItemsPerPage: any[][]
) {
  console.log("Starting balanced visual redaction process");
  
  // @ts-ignore
  const { PDFDocument, rgb } = window.PDFLib;
  
  // Get the full text content to help with mapping detections to visual coordinates
  const { pages } = await extractTextFromPDF(pdfData);
  
  // Clone the original PDF to maintain all formatting and content
  const pdfDoc = await PDFDocument.load(pdfData);
  
  // For each page with detections, apply visual redactions
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
    const pageText = pages[pageIndex].text;
    const items = textItemsPerPage[pageIndex] || [];
    const pageMatches = detectionsPerPage.find(p => p.pageIndex === pageIndex)?.matches || [];
    
    if (items.length === 0) {
      console.log(`Page ${pageIndex+1}: No text items to redact`);
      continue; // No text content on this page
    }
    
    console.log(`Page ${pageIndex+1}: Processing ${pageMatches.length} detections`);
    
    // Get the PDF page
    const page = pdfDoc.getPage(pageIndex);
    const { width, height } = page.getSize();
    
    // BALANCED REDACTION APPROACH
    
    const redactionRects = [];
    
    // 1. PRECISE PATTERN SCAN: Only redact specific sensitive patterns
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex];
      if (!item.str || typeof item.str !== 'string') continue;
      
      // Define specific sensitive patterns
      const ssn = item.str.match(/\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g);
      const phone = item.str.match(/\b(\+?\d{1,3}[-\.\s]?)?(\(?\d{3}\)?[-\.\s]?)?\d{3}[-\.\s]?\d{4}\b/g);
      const email = item.str.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
      const creditCard = item.str.match(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g);
      
      // Only specific numeric sequences, not all of them
      const matches = [...(ssn || []), ...(phone || []), ...(email || []), ...(creditCard || [])];
      
      if (matches.length > 0) {
        // Create targeted redaction rectangles for each match
        const PADDING = 3;
        
        for (const match of matches) {
          // Find position of match within item
          const matchIndex = item.str.indexOf(match);
          if (matchIndex === -1) continue;
          
          // Calculate proportional position and width
          const itemWidth = item.width || item.str.length * 5;
          const charWidth = itemWidth / item.str.length;
          const matchWidth = match.length * charWidth;
          
          redactionRects.push({
            x: item.transform[4] + (matchIndex * charWidth) - PADDING,
            y: item.transform[5] - PADDING,
            width: matchWidth + PADDING * 2,
            height: (item.height || 12) + PADDING * 2,
            text: match,
            source: 'pattern'
          });
        }
      }
    }
    
    // 2. SELECTIVE CONTEXT-AWARE SCAN: Only redact actual data near context indicators
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.str || typeof item.str !== 'string') continue;
      
      // Check for contextual indicators followed by data
      if (/\b(contact|phone|number|email|address|ssn|social security|id)\s*[:=]?\s*$/i.test(item.str)) {
        // Only redact the next item if it looks like sensitive data
        if (i + 1 < items.length && items[i + 1].str) {
          const nextItem = items[i + 1];
          // Only redact if the next item looks like a phone, email, SSN, etc.
          if (/\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b|\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b|@|[A-Z0-9]{8,}/i.test(nextItem.str)) {
            const PADDING = 3;
            redactionRects.push({
              x: nextItem.transform[4] - PADDING,
              y: nextItem.transform[5] - PADDING,
              width: (nextItem.width || nextItem.str.length * 5) + PADDING * 2,
              height: (nextItem.height || 12) + PADDING * 2,
              text: nextItem.str,
              source: 'contextual'
            });
          }
        }
      }
    }
    
    // 3. TARGETED LINE SCAN: Only redact parts of lines with clear sensitive data
    const lines: { items: any[], y: number, height: number }[] = [];
    let currentLine = { items: [] as any[], y: 0, height: 0 };
    let lastY = -1000;
    
    // Group items into lines based on Y position
    const sortedItems = [...items].sort((a, b) => a.transform[5] - b.transform[5]);
    
    for (const item of sortedItems) {
      if (!item.str) continue;
      
      const itemY = item.transform[5];
      const itemHeight = item.height || 12;
      
      if (Math.abs(itemY - lastY) > itemHeight / 2) {
        if (currentLine.items.length > 0) {
          lines.push(currentLine);
        }
        currentLine = { 
          items: [item], 
          y: itemY, 
          height: itemHeight 
        };
      } else {
        currentLine.items.push(item);
      }
      
      lastY = itemY;
    }
    
    if (currentLine.items.length > 0) {
      lines.push(currentLine);
    }
    
    // For each line, look for patterns that indicate a phone number or SSN split across items
    for (const line of lines) {
      const lineItems = [...line.items].sort((a, b) => a.transform[4] - b.transform[4]);
      
      // Look for split patterns across consecutive items (e.g., "443-" "232-" "4454")
      for (let i = 0; i < lineItems.length - 1; i++) {
        const currItem = lineItems[i];
        const nextItem = lineItems[i + 1];
        
        if (!currItem.str || !nextItem.str) continue;
        
        // Check for split phone number or SSN
        const combined = currItem.str + " " + nextItem.str;
        const hasPattern = /\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b|\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/.test(combined);
        
        if (hasPattern) {
          const PADDING = 3;
          // Create a rectangle covering just these two items
          const minX = currItem.transform[4] - PADDING;
          const maxX = nextItem.transform[4] + (nextItem.width || nextItem.str.length * 5) + PADDING;
          
          redactionRects.push({
            x: minX,
            y: line.y - PADDING,
            width: maxX - minX,
            height: line.height + PADDING * 2,
            text: combined,
            source: 'multi-item'
          });
          
          // Skip the next item since we've already processed it
          i++;
        }
      }
    }
    
    // 4. USE ENHANCED DETECTIONS: Add rectangles from the enhanced detection engine
    const enhancedDetections = pages[pageIndex].detections || [];
    
    // Handle detections - ensure we're not treating it as a Promise
    const processDetections = Array.isArray(enhancedDetections) ? enhancedDetections : [];
    for (const detection of processDetections) {
      // Find items that overlap with this detection
      if (detection.index !== undefined && detection.length !== undefined) {
        const detectionIndex = detection.index;
        const detectionLength = detection.length;
        const overlappingItems = items.filter(item => 
          item.start < detectionIndex + detectionLength && 
          item.end > detectionIndex
        );
      
        if (overlappingItems.length > 0) {
          // Calculate bounding box
          const PADDING = 3;
          
          const itemXs = overlappingItems.map(it => it.transform[4]);
          const itemYs = overlappingItems.map(it => it.transform[5]);
          const itemWidths = overlappingItems.map(it => it.width || it.str.length * 5);
          const itemHeights = overlappingItems.map(it => it.height || 12);
          
          const minX = Math.min(...itemXs) - PADDING;
          const maxY = Math.max(...itemYs.map((y, i) => y + itemHeights[i])) + PADDING;
          const maxX = Math.max(...itemXs.map((x, i) => x + itemWidths[i])) + PADDING;
          const minY = Math.min(...itemYs) - PADDING;
          
          redactionRects.push({
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            text: detection.value,
            source: 'enhanced-engine'
          });
        }
      }
    }
    
    // 5. ADD EXPLICIT MATCHES: Add rectangles from explicit user selections
    for (const detection of pageMatches) {
      try {
        const detectionText = pageText.substring(detection.index, detection.index + detection.length);
        
        // Find overlapping items
        const overlappingItems = items.filter(item => 
          item.start < detection.index + detection.length && 
          item.end > detection.index
        );
        
        if (overlappingItems.length > 0) {
          // Calculate bounding box
          const PADDING = 3;
          
          const itemXs = overlappingItems.map(it => it.transform[4]);
          const itemYs = overlappingItems.map(it => it.transform[5]);
          const itemWidths = overlappingItems.map(it => it.width || it.str.length * 5);
          const itemHeights = overlappingItems.map(it => it.height || 12);
          
          const minX = Math.min(...itemXs) - PADDING;
          const maxY = Math.max(...itemYs.map((y, i) => y + itemHeights[i])) + PADDING;
          const maxX = Math.max(...itemXs.map((x, i) => x + itemWidths[i])) + PADDING;
          const minY = Math.min(...itemYs) - PADDING;
          
          redactionRects.push({
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            text: detectionText,
            source: 'explicit'
          });
        }
      } catch (e) {
        console.error("Error processing explicit detection:", e);
      }
    }
    
    // 6. MODERATE MERGING: Merge overlapping rectangles with moderate distance
    const mergedRects = mergeOverlappingRectangles(redactionRects, 5);
    
    console.log(`Generated ${redactionRects.length} redaction rectangles, merged to ${mergedRects.length}`);
    
    // 7. DRAW REDACTION RECTANGLES
    for (const rect of mergedRects) {
      // Ensure rectangle is within page bounds
      const safeX = Math.max(0, Math.min(rect.x, width));
      const safeY = Math.max(0, Math.min(rect.y, height));
      const safeWidth = Math.min(rect.width, width - safeX);
      const safeHeight = Math.min(rect.height, height - safeY);
      
      if (safeWidth <= 0 || safeHeight <= 0) continue;
      
      // Draw black rectangle over redacted area
      page.drawRectangle({
        x: safeX,
        y: safeY,
        width: safeWidth,
        height: safeHeight,
        color: rgb(0, 0, 0),
        borderColor: rgb(0, 0, 0),
        borderWidth: 0,
        opacity: 1
      });
    }
  }
  
  // Set metadata
  pdfDoc.setTitle('Redacted PDF');
  pdfDoc.setSubject('Redacted');
  pdfDoc.setKeywords(['redacted']);
  pdfDoc.setProducer('ToolsJockey PDF Redaction Tool');
  pdfDoc.setCreator('ToolsJockey');
  
  console.log("Visual redaction process complete");
  
  // Save and return the PDF
  const redactedBytes = await pdfDoc.save();
  return redactedBytes;
}

/**
 * Merges overlapping or adjacent rectangles to reduce visual clutter
 * @param {Array<{x: number, y: number, width: number, height: number, text: string, source?: string}>} rectangles 
 * @param {number} mergeDistance - How close rectangles need to be to merge (in PDF points)
 * @returns {Array<{x: number, y: number, width: number, height: number, text: string, source?: string}>}
 */
function mergeOverlappingRectangles(
  rectangles: Array<{x: number, y: number, width: number, height: number, text: string, source?: string}>, 
  mergeDistance: number = 3
): Array<{x: number, y: number, width: number, height: number, text: string, source?: string}> {
  if (rectangles.length <= 1) return rectangles;
  
  let merged = [...rectangles];
  
  // Keep merging until no more merges are possible
  let mergeOccurred = true;
  let iterationCount = 0;
  const MAX_ITERATIONS = 100; // Safety limit
  
  while (mergeOccurred && iterationCount < MAX_ITERATIONS) {
    mergeOccurred = false;
    iterationCount++;
    
    for (let i = 0; i < merged.length; i++) {
      for (let j = i + 1; j < merged.length; j++) {
        const rect1 = merged[i];
        const rect2 = merged[j];
        
        // Calculate if rectangles overlap or are very close
        const overlapsX = (rect1.x - mergeDistance <= rect2.x + rect2.width) && 
                          (rect2.x - mergeDistance <= rect1.x + rect1.width);
        const overlapsY = (rect1.y - mergeDistance <= rect2.y + rect2.height) && 
                          (rect2.y - mergeDistance <= rect1.y + rect1.height);
        
        // Only merge rectangles that are actually overlapping or very close
        if (overlapsX && overlapsY) {
          // Merge these rectangles
          const minX = Math.min(rect1.x, rect2.x);
          const minY = Math.min(rect1.y, rect2.y);
          const maxX = Math.max(rect1.x + rect1.width, rect2.x + rect2.width);
          const maxY = Math.max(rect1.y + rect1.height, rect2.y + rect2.height);
          
          merged[i] = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            text: rect1.text + "," + rect2.text,
            source: (rect1.source || '') + ',' + (rect2.source || '')
          };
          
          // Remove the second rectangle
          merged.splice(j, 1);
          
          mergeOccurred = true;
          break;
        }
      }
      
      if (mergeOccurred) break;
    }
  }
  
  return merged;
}

/**
 * Apply precise redactions to a PDF using a pattern-based approach
 * This is a compatibility function that delegates to the new PyMuPDF-inspired implementation
 */
export async function applyPreciseRedactionToPDF(
  pdfData: Uint8Array,
  enabledPatternKeys: string[] = [],
  options: PDFRedactionOptions = {}
): Promise<Uint8Array> {
  try {
    // Import the new redaction implementation
    const { redactPDF } = await import('./PDFPreciseRedaction');
    const { REDACTION_PATTERNS } = await import('./RedactionPatterns');

    // Extract redaction terms from enabled patterns
    const redactionTerms: string[] = [];
    
    // Add specific patterns from the detection engine
    for (const key of enabledPatternKeys) {
      if (REDACTION_PATTERNS[key]) {
        // Get sample matches for this pattern type
        const pattern = REDACTION_PATTERNS[key].regex;
        const { pages } = await extractTextFromPDF(pdfData);
        
        // Process each page to find specific terms to redact
        for (const page of pages) {
          let match;
          const regex = new RegExp(pattern.source, pattern.flags);
          while ((match = regex.exec(page.text)) !== null) {
            if (match[0] && !redactionTerms.includes(match[0])) {
              redactionTerms.push(match[0]);
            }
            // Avoid infinite loops
            if (match.index === regex.lastIndex) {
              regex.lastIndex++;
            }
          }
        }
      }
    }
    
    // If no specific terms found, return original PDF
    if (redactionTerms.length === 0) {
      console.log("No redaction terms found in document");
      return pdfData;
    }
    
    console.log(`Found ${redactionTerms.length} redaction terms to process`);
    
    // Apply redactions using the new implementation
    const { redactedPdf } = await redactPDF(
      pdfData,
      redactionTerms,
      {
        color: [0, 0, 0], // Black redaction by default
        borderWidth: options.borderWidth || 0,
        borderColor: options.borderColor || [0, 0, 0]
      }
    );
    
    return redactedPdf;
  } catch (error) {
    console.error("Error in precise redaction:", error);
    throw error;
  }
} 