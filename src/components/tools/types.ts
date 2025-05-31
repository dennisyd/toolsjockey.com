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
 * Information about a match found for redaction
 */
export interface RedactionMatch {
  type: string;      // Type of sensitive data (e.g., "Email", "SSN")
  value: string;     // The matched text
  index: number;     // Start index in the text
  length: number;    // Length of the match
  color: string;     // Color for highlighting
  confidence?: number; // Confidence score (0-1)
  itemIndices?: number[]; // Indices of TextItems containing this match
}

/**
 * RedactionMatch with page information
 */
export interface RedactionMatchWithPage extends RedactionMatch {
  pageIndex: number;
  context?: string;  // Context around the match for better validation
}

/**
 * A precise redaction area with exact coordinates
 */
export interface RedactionArea {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  pageIndex: number;
  source: string;  // The source of detection (pattern, context, etc.)
  type?: string;   // The type of sensitive data
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

/**
 * Options for PDF redaction
 */
export interface PDFRedactionOptions {
  padding?: number;
  mergeDistance?: number;
  fillColor?: [number, number, number];
  color?: [number, number, number]; // RGB color for redaction rectangles
  borderColor?: [number, number, number]; // RGB color for borders
  borderWidth?: number; // Width of border in pts
  caseSensitive?: boolean; // Whether to match case sensitively
} 