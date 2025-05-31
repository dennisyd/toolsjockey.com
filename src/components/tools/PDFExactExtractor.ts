/**
 * PDFExactExtractor.ts
 * 
 * This module provides precise text extraction from PDF files with accurate coordinates,
 * similar to PyMuPDF's fitz module. It uses pdf.js under the hood but enhances the
 * extraction process to provide more detailed position information.
 */

import type { TextItem } from './types';

interface TextBlock {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontName: string;
  fontSize: number;
  color: string;
  transform: number[];
  charSpacing: number;
  startIndex: number;
  endIndex: number;
  direction: string;
  ascent: number;
  descent: number;
  characters: CharacterInfo[];
  spaceWidth?: number;
}

interface CharacterInfo {
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextPage {
  pageIndex: number;
  width: number;
  height: number;
  rotation: number;
  blocks: TextBlock[];
  text: string;
}

/**
 * Enhanced PDF text extractor that provides detailed positioning information for all text elements
 */
export class PDFExactExtractor {
  /**
   * Extract text with precise positioning from a PDF
   * @param pdfData The PDF data as an Uint8Array
   */
  public async extractText(pdfData: Uint8Array): Promise<TextPage[]> {
    // @ts-ignore - pdf.js is loaded globally
    const pdf = await window.pdfjsLib.getDocument({ data: pdfData }).promise;
    const pages: TextPage[] = [];

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const viewport = page.getViewport({ scale: 1.0 });
      const textContent = await page.getTextContent({ normalizeWhitespace: false });
      
      // Process text content to get precise character positions
      const blocks = this.processTextContent(textContent);
      
      // Combine the text from all blocks
      const text = blocks.map(block => block.text).join(' ');
      
      // Add page info
      pages.push({
        pageIndex: i,
        width: viewport.width,
        height: viewport.height,
        rotation: viewport.rotation,
        blocks,
        text
      });
    }
    
    return pages;
  }
  
  /**
   * Process the text content to extract precise character positions
   */
  private processTextContent(textContent: any): TextBlock[] {
    const blocks: TextBlock[] = [];
    let textIndex = 0;
    
    for (const item of textContent.items) {
      if (!item.str) continue;
      
      const transform = item.transform;
      // Calculate a more accurate font height - reduce by 25% for thinner boxes
      const fontHeight = Math.sqrt((transform[2] * transform[2]) + (transform[3] * transform[3])) * 0.75;
      
      // Calculate character positions
      const characters: CharacterInfo[] = [];
      let currentX = transform[4];
      // Important: In PDF, the y-coordinate is the text baseline
      // We need to adjust based on font metrics for proper alignment
      const currentY = transform[5];
      
      for (const char of item.str) {
        const charWidth = this.estimateCharWidth(char, fontHeight, item.fontName);
        
        characters.push({
          char,
          x: currentX,
          // Calculate y so it's at the top of the character for better redaction alignment
          // PDF coordinates have y=0 at the bottom, so we add most of the height to move up
          y: currentY + (fontHeight * 0.7), // Reduce this factor for thinner boxes
          width: charWidth,
          height: fontHeight
        });
        
        // Move to next character position
        currentX += charWidth;
      }
      
      // Create text block with precise positioning
      const block: TextBlock = {
        text: item.str,
        x: transform[4],
        // Adjust y position to be at the top of the text rather than the baseline
        y: transform[5] + (fontHeight * 0.7), // Same reduction as above
        width: item.width || characters.reduce((sum, c) => sum + c.width, 0),
        height: fontHeight,
        fontName: item.fontName,
        fontSize: fontHeight,
        color: this.extractColor(item),
        transform: item.transform,
        charSpacing: item.charSpacing || 0,
        startIndex: textIndex,
        endIndex: textIndex + item.str.length,
        direction: item.dir || 'ltr',
        ascent: item.ascent || (fontHeight * 0.7),
        descent: item.descent || (fontHeight * 0.3),
        characters,
        spaceWidth: fontHeight * 0.25
      };
      
      blocks.push(block);
      textIndex += item.str.length + 1; // +1 for space
    }
    
    return blocks;
  }
  
  /**
   * Convert TextBlocks to the format expected by the redaction engine
   */
  public convertToTextItems(pages: TextPage[]): TextItem[][] {
    return pages.map(page => {
      return page.blocks.map(block => {
        return {
          str: block.text,
          transform: block.transform,
          width: block.width,
          height: block.height,
          start: block.startIndex,
          end: block.endIndex,
          fontName: block.fontName,
          fontSize: block.fontSize,
          characters: block.characters.map(c => ({
            char: c.char,
            x: c.x,
            y: c.y,
            width: c.width,
            height: c.height
          }))
        };
      });
    });
  }
  
  /**
   * Estimate the width of a character based on font metrics
   * This is a simplified approach - a real implementation would use font metrics
   */
  private estimateCharWidth(char: string, fontHeight: number, fontName?: string): number {
    // For monospace fonts, all characters have the same width
    if (fontName && fontName.toLowerCase().includes('mono')) {
      return fontHeight * 0.6;
    }
    
    // Special cases for various characters
    if (char === ' ') return fontHeight * 0.25;
    if (char === 'i' || char === 'l' || char === 'I' || char === '.' || char === ',') return fontHeight * 0.3;
    if (char === 'w' || char === 'm' || char === 'W' || char === 'M') return fontHeight * 0.9;
    
    // Default for most characters
    return fontHeight * 0.6;
  }
  
  /**
   * Extract color information from text item
   */
  private extractColor(item: any): string {
    if (item.color) {
      const c = item.color;
      if (Array.isArray(c) && c.length >= 3) {
        return `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
      }
    }
    return 'rgb(0,0,0)';
  }
  
  /**
   * Finds the exact bounds of text matching a pattern
   * @param page The text page
   * @param pattern The regular expression pattern to match
   * @returns Array of matches with exact bounds
   */
  public findPattern(page: TextPage, pattern: RegExp): Array<{
    text: string;
    bounds: { x: number; y: number; width: number; height: number };
    pageIndex: number;
  }> {
    const matches: Array<{
      text: string;
      bounds: { x: number; y: number; width: number; height: number };
      pageIndex: number;
    }> = [];
    
    // Find matches in the full text
    const fullText = page.text;
    let match;
    
    while ((match = pattern.exec(fullText)) !== null) {
      if (pattern.global) {
        const matchText = match[0];
        const matchIndex = match.index;
        const matchEnd = matchIndex + matchText.length;
        
        // Find which blocks contain this match
        const containingBlocks = page.blocks.filter(block => 
          (block.startIndex <= matchIndex && block.endIndex > matchIndex) || 
          (block.startIndex < matchEnd && block.endIndex >= matchEnd) ||
          (block.startIndex >= matchIndex && block.endIndex <= matchEnd)
        );
        
        if (containingBlocks.length > 0) {
          // Calculate the exact bounds of the match
          const allXValues: number[] = [];
          const allYValues: number[] = [];
          
          for (const block of containingBlocks) {
            for (const char of block.characters) {
              allXValues.push(char.x);
              allXValues.push(char.x + char.width);
              // Use the character's adjusted y position
              allYValues.push(char.y - char.height);
              allYValues.push(char.y);
            }
          }
          
          const minX = Math.min(...allXValues);
          const maxX = Math.max(...allXValues);
          const minY = Math.min(...allYValues);
          const maxY = Math.max(...allYValues);
          
          // Add a smaller vertical adjustment to make boxes thinner
          const verticalAdjustment = (maxY - minY) * 0.05; // Reduced from 0.1 to 0.05 (5% adjustment)
          
          matches.push({
            text: matchText,
            bounds: {
              x: minX,
              // Adjust y position upward slightly to better cover text
              y: minY - verticalAdjustment,
              width: maxX - minX,
              // Reduce height to make boxes thinner
              height: (maxY - minY) + (verticalAdjustment * 1.5) // Reduced from 2 to 1.5
            },
            pageIndex: page.pageIndex
          });
        }
      }
    }
    
    return matches;
  }
}

/**
 * A simpler API that mimics PyMuPDF's behavior
 */
export async function extractPreciseText(pdfData: Uint8Array): Promise<{
  pages: Array<{
    pageIndex: number;
    width: number;
    height: number;
    text: string;
    blocks: TextBlock[];
  }>;
  getTextItems: () => TextItem[][];
}> {
  const extractor = new PDFExactExtractor();
  const pages = await extractor.extractText(pdfData);
  
  return {
    pages,
    getTextItems: () => extractor.convertToTextItems(pages)
  };
} 