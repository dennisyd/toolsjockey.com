/**
 * Common types used in PDF processing tools
 */

/**
 * Represents a single text item in a PDF document
 */
export interface TextItem {
  str: string;
  transform: number[]; // PDF coordinate transform
  width: number;
  height: number;
  start: number; // Start index in the page text
  end: number;   // End index in the page text
  fontName?: string;
  fontSize?: number;
  characters?: CharInfo[]; // Individual character information
}

/**
 * Detailed information about a single character
 */
export interface CharInfo {
  char: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Options for PDF text extraction
 */
export interface PDFExtractionOptions {
  firstPage?: number;
  lastPage?: number;
  password?: string;
  normalizeWhitespace?: boolean;
  disableCombineTextItems?: boolean;
} 