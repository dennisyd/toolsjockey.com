/**
 * Utilities for working with PDF.js
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

/**
 * Extracts text from a PDF using PDF.js
 * 
 * @param pdfBytes - ArrayBuffer containing the PDF data
 * @returns Promise resolving to an array of text content by page
 */
export const extractTextFromPDFUsingJS = async (
  pdfBytes: ArrayBuffer
): Promise<string[]> => {
  try {
    console.log("Extracting text using PDF.js");
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdf = await loadingTask.promise;
    
    const numPages = pdf.numPages;
    const textContent: string[] = [];
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContentItems = await page.getTextContent();
      
      // Combine all text items from the page
      const pageText = textContentItems.items
        .map((item: any) => item.str)
        .join(' ');
      
      textContent.push(pageText);
    }
    
    return textContent;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. The file might be corrupted or password protected.');
  }
};

/**
 * Gets PDF metadata using PDF.js
 * 
 * @param pdfBytes - ArrayBuffer containing the PDF data
 * @returns Promise resolving to PDF metadata
 */
export const getPDFMetadata = async (
  pdfBytes: ArrayBuffer
): Promise<{
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  numPages: number;
}> => {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdf = await loadingTask.promise;
    
    const metadata = await pdf.getMetadata();
    const info = metadata?.info || {};
    
    return {
      title: info.Title,
      author: info.Author,
      subject: info.Subject,
      creator: info.Creator,
      producer: info.Producer,
      creationDate: info.CreationDate,
      modificationDate: info.ModDate,
      numPages: pdf.numPages
    };
  } catch (error) {
    console.error('Error getting PDF metadata:', error);
    throw new Error('Failed to get PDF metadata.');
  }
};

/**
 * Checks if a PDF is password protected
 * 
 * @param pdfBytes - ArrayBuffer containing the PDF data
 * @returns Promise resolving to boolean indicating if PDF is password protected
 */
export const isPDFPasswordProtected = async (
  pdfBytes: ArrayBuffer
): Promise<boolean> => {
  try {
    const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
    await loadingTask.promise;
    return false; // If we can load it without password, it's not protected
  } catch (error: any) {
    // Check if the error indicates password protection
    if (error.name === 'PasswordException' || 
        error.message?.includes('password') ||
        error.message?.includes('encrypted')) {
      return true;
    }
    // Other errors might indicate corrupted file
    throw new Error('Failed to check PDF password protection.');
  }
};

/**
 * Loads a PDF with password if needed
 * 
 * @param pdfBytes - ArrayBuffer containing the PDF data
 * @param password - Optional password for protected PDFs
 * @returns Promise resolving to the PDF document
 */
export const loadPDFWithPassword = async (
  pdfBytes: ArrayBuffer,
  password?: string
): Promise<any> => {
  try {
    const loadingTask = pdfjsLib.getDocument({ 
      data: pdfBytes,
      password: password || undefined
    });
    return await loadingTask.promise;
  } catch (error: any) {
    if (error.name === 'PasswordException') {
      throw new Error('PDF is password protected. Please provide the correct password.');
    }
    throw new Error('Failed to load PDF. The file might be corrupted.');
  }
}; 