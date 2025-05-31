import { useState } from 'react';
import type { ProcessingState } from '../../types';
import pyMuPDFBridge from './PyMuPDFBridge';
import { redactPDFUsingJS as jsRedact } from './pdfJSUtils';

/**
 * Custom hook for PDF redaction and text extraction logic
 */
export const useRedactionEngine = () => {
  const [processingState, setProcessingState] = useState<ProcessingState>({ status: 'idle', message: '' });

  /**
   * Redacts a PDF using either PyMuPDF (preferred) or JavaScript fallback
   */
  const redactPDF = async (pdfBytes: ArrayBuffer, patternsToRedact: string[]): Promise<ArrayBuffer> => {
    setProcessingState({ status: 'processing', message: 'Processing PDF...' });
    
    try {
      console.log(`Attempting to redact using PyMuPDF Bridge...`);
      console.log(`PyMuPDF loaded: ${pyMuPDFBridge.isLoaded}`);
      
      // Try to load PyMuPDF if it's not already loaded
      if (!pyMuPDFBridge.isLoaded) {
        console.log("PyMuPDF not loaded yet, attempting to load...");
        try {
          await pyMuPDFBridge.loadPyMuPDF();
          console.log("PyMuPDF loaded successfully!");
        } catch (error) {
          console.error("Failed to load PyMuPDF:", error);
          console.log("Falling back to JavaScript redaction...");
          throw new Error("PyMuPDF failed to load: " + (error instanceof Error ? error.message : String(error)));
        }
      }

      // If PyMuPDF is loaded, use it for redaction
      if (pyMuPDFBridge.isLoaded) {
        console.log("Using PyMuPDF for redaction");
        // Convert ArrayBuffer to Uint8Array for PyMuPDF
        const uint8Array = new Uint8Array(pdfBytes);
        
        try {
          const result = await pyMuPDFBridge.redactPDF(uint8Array, patternsToRedact);
          console.log("PyMuPDF redaction completed successfully");
          return result.buffer;
        } catch (redactError) {
          console.error("PyMuPDF redaction failed:", redactError);
          console.log("Falling back to JavaScript redaction due to PyMuPDF error");
          throw redactError;
        }
      } else {
        throw new Error("PyMuPDF not loaded after load attempt");
      }
    } catch (error) {
      console.log("Using JavaScript redaction");
      setProcessingState({ status: 'processing', message: 'Using JavaScript redaction' });
      
      // Fall back to JavaScript redaction
      return redactPDFUsingJS(pdfBytes, patternsToRedact);
    }
  };

  /**
   * JavaScript fallback for PDF redaction
   */
  const redactPDFUsingJS = async (pdfBytes: ArrayBuffer, patternsToRedact: string[]): Promise<ArrayBuffer> => {
    // Use the imported function from pdfJSUtils.ts
    return jsRedact(pdfBytes, patternsToRedact);
  };

  /**
   * Extracts text from a PDF using PDF.js
   */
  const extractTextFromPDF = async (_pdfBytes: ArrayBuffer): Promise<string[]> => {
    setProcessingState({ status: 'processing', message: 'Extracting text...' });
    
    try {
      // Implementation of text extraction logic
      // For now, just return a placeholder
      console.log("Extracting text from PDF...");
      
      setProcessingState({ status: 'completed', message: 'Text extraction completed' });
      return ["Sample extracted text"]; // Placeholder - replace with actual implementation
    } catch (error) {
      setProcessingState({ 
        status: 'error', 
        message: `Error extracting text: ${error instanceof Error ? error.message : String(error)}`
      });
      throw error;
    }
  };

  return {
    redactPDF,
    extractTextFromPDF,
    processingState
  };
}; 