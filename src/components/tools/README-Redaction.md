# PDF Precise Redaction Tool

This folder contains our advanced PDF redaction implementation with PyMuPDF-like precision for character-level redaction.

## Overview

Our PDF redaction tool uses a multi-layered approach to provide precise redaction capabilities:

1. **Character-Level Precision**: Similar to PyMuPDF's fitz module, our implementation tracks the exact position of each character in the document, allowing for pixel-perfect redaction.

2. **Multi-Level Detection**: 
   - Pattern-based detection for known sensitive data formats
   - Context-aware detection for identifying sensitive data based on surrounding text
   - Split-text detection for finding data spread across multiple text items

3. **Balanced Approach**: We've fine-tuned the algorithm to avoid over-redaction while ensuring all sensitive data is properly protected.

## Key Components

### PDFExactExtractor.ts

This module provides precise text extraction capabilities:

- Extracts the exact position, size, and font information for each character
- Creates a hierarchical text structure (pages → blocks → characters)
- Implements pattern matching against the extracted text with exact position mapping
- Provides a PyMuPDF-like interface for working with PDF text content

### PDFPreciseRedaction.ts

The core redaction engine:

- Uses the exact extractor to find sensitive information
- Applies redactions with pixel-perfect accuracy
- Provides context-aware detection for sensitive data
- Merges nearby redaction areas when appropriate
- Supports configurable redaction options (padding, color, etc.)

### PDFProcessor.ts

Integration layer that provides the public API:

- `applyPreciseRedactionToPDF`: Main entry point for PyMuPDF-like redaction
- Backward compatibility with the original redaction approach
- Error handling and logging

## Implementation Details

### Character Position Calculation

The system calculates character positions by:

1. Extracting text content using PDF.js
2. Computing precise character dimensions and positions
3. Building a searchable text structure with position information
4. Matching patterns against this structure to get exact coordinates

### Contextual Detection

The context-aware detection looks for:

- Labels that typically precede sensitive information (e.g., "Phone:", "SSN:")
- Text formatting that suggests sensitive data (e.g., specific spacing patterns)
- Proximity relationships between text elements

### Redaction Application

Redactions are applied by:

1. Creating black rectangles covering the exact area of the sensitive content
2. Maintaining document structure and layout
3. Preserving all non-sensitive content

## How It's Better Than Standard Approaches

1. **Precision**: Only redacts the exact sensitive text, not entire lines or blocks
2. **Comprehensive**: Detects more types of sensitive data through multiple techniques
3. **Context-Aware**: Understands the semantic meaning of text based on context
4. **Maintainable**: Modular design with clear separation of concerns
5. **Configurable**: Easily adjustable for different security requirements

## Usage

The redaction tool is exposed through the PDFRedactionTool UI component, which provides:

- A toggle between standard and precise redaction
- Pattern selection options
- Visual preview of detection results
- Redaction and download capabilities

## Performance Considerations

The precise redaction approach is more computationally intensive than the standard approach, but provides significantly better results. For very large documents, consider the following optimizations:

- Process pages in batches
- Limit the number of patterns used simultaneously
- Use more specific patterns when possible

## Future Improvements

Potential enhancements:

- Use WebAssembly for even faster text extraction and pattern matching
- Implement machine learning for more accurate sensitive data detection
- Add support for redacting content in images using OCR
- Provide additional redaction styles (colored blocks, blurring, etc.) 