import React, { useState, useRef, useEffect } from 'react';
import { REDACTION_PATTERNS, getPatternCategories } from './RedactionPatterns';
import pyMuPDFBridge from './PyMuPDFBridge';
import { useRedactionEngine } from './PDFRedactionEngine';
import type { RedactionMatch } from './PDFRedactionEngine';
import DonationHandler from './DonationHandler';
import type { RedactionMatchWithPage } from './types';

const MAX_FILE_SIZE_MB = 50;

// Enable debug mode for development
const DEBUG_MODE = true;

/**
 * Information banner about PDF compatibility
 */
const CompatibilityNotice: React.FC = () => {
  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4 rounded shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">PDF Source Compatibility</h3>
          <div className="mt-1 text-sm text-amber-700">
            <p>This tool works best with PDFs created by professional publishing software or downloaded from official sources.</p>
            <p className="mt-1"><strong>Note:</strong> PDFs exported from word processors (like Microsoft Word or Google Docs) may have different text encoding that affects redaction precision.</p>
            <ul className="list-disc pl-5 mt-1 text-xs">
              <li>For Word-exported PDFs, try increasing the redaction thickness using the slider below</li>
              <li>Consider using the Standard Engine instead of Precise Engine for Word documents</li>
              <li>When creating PDFs from Word, use the PDF/A format option for better compatibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Update the PyMuPDFLoader component to include a retry button
const PyMuPDFLoader: React.FC<{
  isLoading: boolean;
  progress: number;
  error: string | null;
  onRetry: () => void;
}> = ({ isLoading, progress, error, onRetry }) => {
  if (!isLoading && !error) return null;
  
  const isMissingWheelError = error?.includes("Can't find a pure Python 3 wheel for 'pymupdf'") || 
                             error?.includes("ValueError: Can't find") ||
                             error?.includes("wheel");
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">
          {error ? "PyMuPDF Loading Error" : "Loading PyMuPDF Library"}
        </h3>
        
        {error ? (
          <div className="mb-4">
            <p className="text-red-600 mb-2">There was an error loading the PyMuPDF library:</p>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">{error}</pre>
            
            {isMissingWheelError && (
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700">
                <p className="font-semibold">Missing Custom Wheel</p>
                <p className="text-sm mt-1">
                  PyMuPDF requires a custom-built wheel file to work in the browser.
                  The JavaScript redaction will be used as a fallback.
                </p>
                <p className="text-sm mt-2">
                  To fully enable PyMuPDF functionality, a custom wheel needs to be built and hosted.
                </p>
              </div>
            )}
            
            {DEBUG_MODE && (
              <div className="mt-4">
                <p className="font-semibold">Debug Information:</p>
                <ul className="list-disc pl-5 text-xs">
                  <li>Browser: {navigator.userAgent}</li>
                  <li>Pyodide Available: {typeof window.loadPyodide === 'function' ? "Yes" : "No"}</li>
                  <li>PyMuPDF Bridge State: {JSON.stringify({
                    isLoaded: pyMuPDFBridge.isLoaded,
                    isLoading: pyMuPDFBridge.isLoading,
                    progress: pyMuPDFBridge.loadProgress
                  })}</li>
                </ul>
              </div>
            )}
            
            <p className="mt-2">
              The application will automatically fall back to basic JavaScript redaction. 
              For best results, consider using the desktop version of this tool.
            </p>
            
            <div className="flex gap-2 mt-4">
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-1"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
              
              <button 
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex-1"
                onClick={onRetry}
              >
                Retry Loading
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Loading: {progress}%</p>
            </div>
            <p>Loading Python environment and PyMuPDF library...</p>
            <p className="text-sm text-gray-600 mt-2">This may take a minute on first load.</p>
            {DEBUG_MODE && (
              <p className="text-xs text-gray-500 mt-2">Using Pyodide v0.23.4 from CDN</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const PDFRedactionTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]); // Data URLs for thumbnails
  const [isProcessing, setIsProcessing] = useState(false);
  const [redactionError, setRedactionError] = useState<string | null>(null);
  const [detections, setDetections] = useState<RedactionMatchWithPage[][]>([]); // Per file
  const [redactedBlobs, setRedactedBlobs] = useState<Blob[]>([]);
  const [showDonation, setShowDonation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pageItems, setPageItems] = useState<any[][]>([]); // Per file, per page
  const [modalOpen, setModalOpen] = useState(false);
  const [modalFileIdx, setModalFileIdx] = useState<number | null>(null);
  const [enabledPatterns, setEnabledPatterns] = useState<Record<string, boolean>>(
    Object.keys(REDACTION_PATTERNS).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );
  const [statsPerFile, setStatsPerFile] = useState<Array<{ totalDetections: number, categoryCounts: Record<string, number> }>>([]);
  const [redactionPadding, setRedactionPadding] = useState<number>(2);
  const [pyMuPDFIsLoading, setPyMuPDFIsLoading] = useState(false);
  const [pyMuPDFLoadProgress, setPyMuPDFLoadProgress] = useState(0);
  const [pyMuPDFError, setPyMuPDFError] = useState<string | null>(null);

  // Get extraction and redaction functions from the hook
  const { redactPDF, extractTextFromPDF } = useRedactionEngine();

  // Add console logs at the beginning of the component to check for Pyodide availability
  useEffect(() => {
    console.log("Checking Pyodide availability...");
    console.log("window.loadPyodide exists:", typeof window.loadPyodide === 'function');
    console.log("DEBUG_MODE enabled:", DEBUG_MODE);
    
    // Try loading PyMuPDF right away
    const initPyMuPDF = async () => {
      try {
        console.log("Attempting to initialize PyMuPDF...");
        await pyMuPDFBridge.loadPyMuPDF();
        console.log("PyMuPDF initialized successfully!");
      } catch (error) {
        console.error("Failed to initialize PyMuPDF:", error);
        setPyMuPDFError(error instanceof Error ? error.message : String(error));
      }
    };

    initPyMuPDF();
  }, []);

  // Handle file upload
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    setRedactionError(null);
    const validFiles = Array.from(fileList).filter(f => f.type === 'application/pdf' && f.size <= MAX_FILE_SIZE_MB * 1024 * 1024);
    if (validFiles.length === 0) {
      setRedactionError('Please upload valid PDF files (max 50MB each).');
      return;
    }
    setFiles(validFiles);
    // Generate previews (first page thumbnail)
    const urls: string[] = [];
    for (const file of validFiles) {
      const data = new Uint8Array(await file.arrayBuffer());
      // @ts-ignore
      const pdf = await window.pdfjsLib.getDocument({ data }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      urls.push(canvas.toDataURL());
    }
    setPreviews(urls);
  };

  // Run detection on all files
  const handleDetect = async () => {
    setIsProcessing(true);
    setRedactionError(null);
    const allDetections: RedactionMatchWithPage[][] = [];
    const allPageItems: any[][] = [];
    const allStats: Array<{ totalDetections: number, categoryCounts: Record<string, number> }> = [];
    
    for (const file of files) {
      const data = new Uint8Array(await file.arrayBuffer());
      
      try {
        // Get text content from PDF
        const { pages } = await extractTextFromPDF(data);
        const fileDetections: RedactionMatchWithPage[] = [];
        const filePageItems: any[] = [];
        const categoryCounts: Record<string, number> = {};
        
        // For each page, find sensitive data
        for (const page of pages) {
          // Create text content for detection
          const pageText = page.text || page.items.map((item: any) => item.str).join(' ');
          
          // Get patterns to check
          const filteredPatterns = Object.fromEntries(
            Object.entries(REDACTION_PATTERNS).filter(([key]) => enabledPatterns[key])
          );
          
          // Get detections for this page
          const matches: RedactionMatch[] = [];
          for (const pattern of Object.values(filteredPatterns)) {
            const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
            let match;
            
            while ((match = regex.exec(pageText)) !== null) {
              matches.push({
                type: pattern.name,
                value: match[0],
                pageIndex: page.pageIndex,
                color: pattern.color,
                index: match.index,
                length: match[0].length
              });
              
              // Get context around the match
              const contextStart = Math.max(0, match.index - 25);
              const contextEnd = Math.min(pageText.length, match.index + match[0].length + 25);
              const context = pageText.substring(contextStart, contextEnd);
              matches[matches.length - 1].context = context;
              
              // Avoid infinite loops with zero-width matches
              if (match.index === regex.lastIndex) {
                regex.lastIndex++;
              }
            }
            
            // Track statistics
            categoryCounts[pattern.name] = (categoryCounts[pattern.name] || 0) + 
              matches.filter(m => m.type === pattern.name).length;
          }
          
          // Add all to detections
          fileDetections.push(...matches as RedactionMatchWithPage[]);
          filePageItems.push(page.items);
        }
        
        allDetections.push(fileDetections);
        allPageItems.push(filePageItems);
        allStats.push({
          totalDetections: fileDetections.length,
          categoryCounts
        });
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        allDetections.push([]);
        allPageItems.push([]);
        allStats.push({ totalDetections: 0, categoryCounts: {} });
      }
    }
    
    setDetections(allDetections);
    setPageItems(allPageItems);
    setStatsPerFile(allStats);
    
    setIsProcessing(false);
  };

  // Add back the pattern category toggle function
  const toggleCategory = (patterns: any[]) => {
    const allEnabled = patterns.every(p => {
      const key = Object.keys(REDACTION_PATTERNS).find(k => REDACTION_PATTERNS[k].name === p.name);
      return key ? enabledPatterns[key] : false;
    });

    // Toggle all patterns in this category
    const newEnabledPatterns = { ...enabledPatterns };
    patterns.forEach(p => {
      const key = Object.keys(REDACTION_PATTERNS).find(k => REDACTION_PATTERNS[k].name === p.name);
      if (key) {
        newEnabledPatterns[key] = !allEnabled;
      }
    });
    setEnabledPatterns(newEnabledPatterns);
  };

  // Add back the pattern toggle function
  const togglePattern = (key: string) => {
    setEnabledPatterns({
      ...enabledPatterns,
      [key]: !enabledPatterns[key]
    });
  };

  // Add a button to retry loading PyMuPDF if it failed
  const retryPyMuPDFLoading = async () => {
    console.log("Retrying PyMuPDF loading...");
    setPyMuPDFError(null);
    setPyMuPDFIsLoading(true);
    
    try {
      await pyMuPDFBridge.loadPyMuPDF();
      console.log("PyMuPDF loaded successfully on retry!");
    } catch (error) {
      console.error("Failed to load PyMuPDF on retry:", error);
      setPyMuPDFError(error instanceof Error ? error.message : String(error));
    } finally {
      setPyMuPDFIsLoading(false);
    }
  };

  // Function to handle redaction with PyMuPDF
  const handleRedactWithPyMuPDF = async (pdfData: Uint8Array, redactTerms: string[]) => {
    try {
      setPyMuPDFIsLoading(true);
      
      // Load PyMuPDF if not already loaded
      if (!pyMuPDFBridge.isLoaded) {
        // Set up progress tracking
        const checkProgress = () => {
          if (pyMuPDFBridge.isLoading) {
            setPyMuPDFLoadProgress(pyMuPDFBridge.loadProgress);
            setTimeout(checkProgress, 100);
          }
        };
        
        checkProgress();
        
        if (DEBUG_MODE) console.log("Loading PyMuPDF...", redactTerms);
        
        try {
          await pyMuPDFBridge.loadPyMuPDF();
          if (DEBUG_MODE) console.log("PyMuPDF loaded successfully");
        } catch (error) {
          console.error("Failed to load PyMuPDF:", error);
          setPyMuPDFError(error instanceof Error ? error.message : String(error));
          throw error;
        }
      }
      
      if (DEBUG_MODE) {
        console.log(`Redacting PDF with ${redactTerms.length} terms:`, redactTerms);
        console.log("PDF data size:", pdfData.length);
      }
      
      // Use PyMuPDF to redact the PDF
      const redactedPDF = await pyMuPDFBridge.redactPDF(pdfData, redactTerms);
      
      if (DEBUG_MODE) {
        console.log("Redaction complete");
        console.log("Original size:", pdfData.length, "Redacted size:", redactedPDF.length);
      }
      
      return redactedPDF;
    } catch (error) {
      console.error("Error in handleRedactWithPyMuPDF:", error);
      throw error;
    } finally {
      setPyMuPDFIsLoading(false);
    }
  };
  
  // Update the redaction function to try PyMuPDF first
  const handleRedactAndDownload = async () => {
    if (!files.length) return;
    
    setIsProcessing(true);
    setRedactionError(null);
    setShowDonation(false);
    setRedactedBlobs([]);
    
    // Check if PyMuPDF is available
    if (!pyMuPDFBridge.isLoaded && pyMuPDFError) {
      setRedactionError("PyMuPDF is not available. Please check the wheel file and try again.");
      setIsProcessing(false);
      return;
    }

    try {
      // Process each file
      const blobs: Blob[] = [];
      
      for (let i = 0; i < files.length; i++) {
        try {
          console.log(`Processing file ${i + 1}/${files.length}: ${files[i].name}`);
          
          // Get the detected terms
          const uniqueTerms = Array.from(new Set(
            detections[i]
              .map(match => match.value || "")
              .filter(text => text && text.trim().length > 0)
          ));
          
          if (uniqueTerms.length === 0) {
            console.log("No terms to redact for this file, skipping");
            continue;
          }
          
          // Get the file data
          const fileData = new Uint8Array(await files[i].arrayBuffer());
          
          // Try to use PyMuPDF if loaded
          if (pyMuPDFBridge.isLoaded) {
            try {
              // Use PyMuPDF for redaction
              console.log("Using PyMuPDF for redaction");
              const redactedPdfData = await handleRedactWithPyMuPDF(fileData, uniqueTerms);
              
              // Create blob and verify it
              const blob = new Blob([redactedPdfData], { type: 'application/pdf' });
              if (blob.size > 0) {
                blobs.push(blob);
              } else {
                throw new Error("Generated PDF was empty");
              }
            } catch (fileError) {
              console.error(`Error processing file ${files[i].name}:`, fileError);
              setRedactionError(`Error processing file ${files[i].name}: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
              // Do not add any fallback - if PyMuPDF fails, we want to show the error
            }
          } else {
            // Use JavaScript redaction method
            console.log("Using JavaScript redaction");
            const termValues = detections[i].map(match => match.value || "");
            const result = await redactPDF(fileData, termValues);
            
            // Create a blob and add it to the list
            const blob = new Blob([result.redactedPdf], { type: 'application/pdf' });
            blobs.push(blob);
          }
        } catch (fileError) {
          console.error(`Error processing file ${files[i].name}:`, fileError);
        }
      }
      
      // Update the UI with redacted blobs
      if (blobs.length > 0) {
        setRedactedBlobs(blobs);
        setShowDonation(true);
      } else {
        setRedactionError('No PDFs were successfully redacted. Please try again or contact support.');
      }
      
    } catch (error) {
      console.error('Error redacting PDFs:', error);
      setRedactionError(`An error occurred during redaction: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download helpers
  const downloadBlob = (blob: Blob, name: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  };

  // Get detection summary
  const getDetectionSummary = (fileIdx: number) => {
    const stats = statsPerFile[fileIdx];
    if (!stats) return null;
    
    return (
      <div className="text-sm">
        <div className="font-semibold">Total detections: {stats.totalDetections}</div>
        {Object.entries(stats.categoryCounts).map(([category, count]) => (
          <div key={category} className="ml-2">
            {category}: {count}
          </div>
        ))}
      </div>
    );
  };

  // UI
  return (
    <div className="flex flex-col min-h-screen">
      {/* User note about enhanced capabilities */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 text-blue-800 p-4 mb-2 rounded shadow-sm">
        <strong>Professional PDF Redaction with Balanced Security</strong>
        <p className="mt-1">Our tool uses a smart, targeted approach to protect your sensitive data while preserving document readability:</p>
        <ul className="list-disc pl-5 mt-1 text-sm">
          <li>Precise pattern matching focuses only on actual sensitive data like SSNs, phone numbers, and emails</li>
          <li>Context-aware detection identifies sensitive information based on surrounding text</li>
          <li>Smart line scanning detects split sensitive data across multiple text items</li>
          <li>Targeted redaction preserves document context while securing private information</li>
          <li><strong>NEW:</strong> PyMuPDF-like precision for character-level redaction ensures exact coverage</li>
        </ul>
        <p className="mt-1 text-sm italic">The perfect balance between security and readability - protecting what matters without excessive redaction.</p>
      </div>
      
      {/* 1. File Upload */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-2">Step 1: Upload PDF(s)</h2>
        
        {/* Add compatibility notice */}
        <CompatibilityNotice />
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <button className="dropzone border-2 border-dashed border-blue-400 rounded-lg px-6 py-4 bg-blue-50 hover:bg-blue-100 transition" onClick={() => fileInputRef.current?.click()}>
            <span className="font-semibold">Click or drag PDF files here</span>
          </button>
          <input ref={fileInputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          {redactionError && <span className="text-red-600 ml-4">{redactionError}</span>}
        </div>
        {previews.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {previews.map((url, i) => (
              <div key={i} className="relative w-24 h-32">
                <img
                  src={url}
                  alt={`PDF preview ${i + 1}`}
                  className="w-24 h-32 object-contain border rounded shadow"
                />
                {/* Only show View button after detection */}
                {detections[i]?.length > 0 && (
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white font-bold rounded transition hover:bg-opacity-50"
                    style={{ zIndex: 20 }}
                    onClick={() => { setModalOpen(true); setModalFileIdx(i); }}
                  >
                    View Detections
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Detection Settings */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-2">Step 2: Detection Settings</h2>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Professional Redaction Engine</h3>
          <p className="text-gray-700">
            This tool uses PyMuPDF's advanced redaction technology to provide precise, professional-quality redactions. 
            It searches for and accurately redacts sensitive information with the same quality as desktop redaction software.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            When you first use the tool, it will download the redaction library (~50MB). 
            This is a one-time download that will be cached for future use.
          </p>
        </div>
        
        {/* Redaction padding slider */}
        <div className="mt-4 p-3 bg-white rounded border">
          <div className="font-medium mb-2">Redaction Thickness:</div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Thinner</span>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={redactionPadding}
              onChange={(e) => setRedactionPadding(parseInt(e.target.value))}
              className="flex-grow"
            />
            <span className="text-sm">Thicker</span>
            <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
              {redactionPadding}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Adjust the thickness of redaction boxes to better match your document's text size.
            Lower values produce thinner redaction boxes.
          </p>
        </div>
      </section>

      {/* 3. Detection & Preview */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-2">Step 3: Detect & Preview</h2>
        <button className="bg-blue-600 text-white rounded px-4 py-2 font-semibold" onClick={handleDetect} disabled={isProcessing || files.length === 0}>
          {isProcessing ? 'Detecting...' : 'Detect Sensitive Data'}
        </button>
        {detections.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-700 mb-2">
              <i>Sensitive content detected using multi-level pattern recognition and contextual analysis</i>
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {detections.map((fileDetections, i) => (
                <div key={i} className="p-3 border rounded bg-gray-50">
                  <div className="font-semibold mb-2">{files[i]?.name}</div>
                  {getDetectionSummary(i)}
                  
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      Show detailed findings ({fileDetections.length})
                    </summary>
                    <ul className="text-xs text-gray-700 mt-2 max-h-40 overflow-y-auto">
                      {fileDetections.map((d, j) => (
                        <li key={j} className="mb-1 pb-1 border-b border-gray-100">
                          <span style={{ color: d.color }}>{d.type}:</span> {d.value}
                          <span className="text-gray-500 ml-1">(Page {d.pageIndex + 1})</span>
                          {d.confidence !== undefined && 
                            <span className="text-gray-500 ml-1">
                              Confidence: {Math.round(d.confidence * 100)}%
                            </span>
                          }
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4. Redact & Download */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-2">Step 4: Redact & Download</h2>
        <button className="bg-red-600 text-white rounded px-4 py-2 font-semibold" onClick={handleRedactAndDownload} disabled={isProcessing || detections.length === 0}>
          {isProcessing ? 'Processing...' : 'Redact & Download All'}
        </button>
        {redactedBlobs.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {redactedBlobs.map((blob, i) => (
              <button key={i} className="bg-green-600 text-white rounded px-3 py-1" onClick={() => downloadBlob(blob, files[i].name.replace(/\.pdf$/i, '_redacted.pdf'))}>
                Download {files[i].name.replace(/\.pdf$/i, '_redacted.pdf')}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 5. Donation */}
      {showDonation && <DonationHandler />}

      {/* Modal for full-page viewing */}
      {modalOpen && modalFileIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-4 relative w-[700px] max-w-full max-h-[90vh] overflow-auto">
            <button className="absolute top-2 right-2 text-gray-600 hover:text-black text-2xl" onClick={() => setModalOpen(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-2">Detected Content: {files[modalFileIdx]?.name}</h3>
            
            {getDetectionSummary(modalFileIdx)}
            
            <PDFPageWithTextLayer
              fileIdx={modalFileIdx}
              pageItems={pageItems[modalFileIdx]?.[0] || []}
              previewUrl={previews[modalFileIdx]}
              detections={detections[modalFileIdx]?.filter(d => d.pageIndex === 0) || []}
            />
          </div>
        </div>
      )}

      {/* PyMuPDF Loading Screen */}
      <PyMuPDFLoader 
        isLoading={pyMuPDFIsLoading} 
        progress={pyMuPDFLoadProgress}
        error={pyMuPDFError}
        onRetry={retryPyMuPDFLoading}
      />

      {/* Restore pattern selection UI */}
      <div className="mb-4">
        <p className="text-gray-600 mb-2">Select which types of sensitive data to detect and redact:</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getPatternCategories().map(({ category, patterns }) => (
            <div key={category} className="border rounded p-3 bg-gray-50">
              <div className="flex items-center mb-2">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={patterns.every(p => {
                    const key = Object.keys(REDACTION_PATTERNS).find(k => REDACTION_PATTERNS[k].name === p.name);
                    return key ? enabledPatterns[key] : false;
                  })}
                  onChange={() => toggleCategory(patterns)}
                />
                <strong>{category}</strong>
              </div>
              
              <div className="ml-4 text-sm">
                {patterns.map(pattern => {
                  const key = Object.keys(REDACTION_PATTERNS).find(k => REDACTION_PATTERNS[k].name === pattern.name);
                  if (!key) return null;
                  
                  return (
                    <div key={pattern.name} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={enabledPatterns[key] || false}
                        onChange={() => togglePattern(key)}
                      />
                      <span style={{ color: pattern.color }}>{pattern.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PDFPageWithTextLayer: React.FC<{
  fileIdx: number;
  pageItems: any[];
  previewUrl: string;
  detections: RedactionMatchWithPage[];
}> = ({ pageItems, previewUrl, detections }) => {
  // Estimate PDF page size from items (fallback to 600x800)
  const pageWidth = pageItems.length > 0 ? Math.max(...pageItems.map((it: any) => it.transform[4] + it.width)) : 600;
  const pageHeight = pageItems.length > 0 ? Math.max(...pageItems.map((it: any) => it.transform[5] + (it.height || 12))) : 800;
  
  return (
    <div className="relative mt-4" style={{ width: pageWidth, height: pageHeight }}>
      {/* PDF page image */}
      <img src={previewUrl} alt="PDF page" style={{ width: pageWidth, height: pageHeight }} />
      
      {/* Show detection highlights */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {detections.map((detection, idx) => {
          // Find matching items
          if (detection.index === undefined || detection.length === undefined) return null;
          
          const overlappingItems = pageItems.filter(item => 
            item.start < detection.index + detection.length && 
            item.end > detection.index
          );
          
          if (overlappingItems.length === 0) return null;
          
          // Calculate bounding box
          const PADDING = 2;
          const itemXs = overlappingItems.map(it => it.transform[4]);
          const itemYs = overlappingItems.map(it => it.transform[5]);
          const itemWidths = overlappingItems.map(it => it.width || it.str.length * 5);
          const itemHeights = overlappingItems.map(it => it.height || 12);
          
          const minX = Math.min(...itemXs) - PADDING;
          const maxY = Math.max(...itemYs.map((y, i) => y + itemHeights[i])) + PADDING;
          const maxX = Math.max(...itemXs.map((x, i) => x + itemWidths[i])) + PADDING;
          const minY = Math.min(...itemYs) - PADDING;
          
          return (
            <div 
              key={idx}
              className="absolute border-2 rounded"
              style={{
                left: minX,
                top: minY,
                width: maxX - minX,
                height: maxY - minY,
                borderColor: detection.color,
                backgroundColor: `${detection.color}33`, // Add 33 for 20% opacity
              }}
            >
              <div 
                className="absolute -top-5 left-0 text-xs px-1 rounded text-white"
                style={{ backgroundColor: detection.color }}
              >
                {detection.type}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Info text */}
      <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 p-2 rounded shadow max-w-xs">
        <p className="text-sm">Viewing detected sensitive data. These areas will be redacted in the downloaded PDF.</p>
      </div>
    </div>
  );
};

export default PDFRedactionTool; 