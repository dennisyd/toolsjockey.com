/**
 * PyMuPDFBridge.ts
 * 
 * This file provides a bridge to use Python's PyMuPDF (fitz) library directly in the browser
 * using Pyodide (WebAssembly-compiled Python runtime).
 */

// Type definitions for our PyMuPDF bridge
type PyMuPDFBridgeType = {
  isLoaded: boolean;
  isLoading: boolean;
  loadProgress: number;
  pyodide: any;
  loadPyMuPDF(): Promise<void>;
  redactPDF(pdfData: Uint8Array, terms: string[]): Promise<Uint8Array>;
}

// Type extension for Window to access global Pyodide
declare global {
  interface Window {
    pyodidePromise: Promise<any> | null;
    loadPyodide: (options: any) => Promise<any>;
  }
}

// Pyodide CDN URL
const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/';

/**
 * PyMuPDF Bridge to use Python's fitz library in the browser via Pyodide
 */
class PyMuPDFBridge implements PyMuPDFBridgeType {
  isLoaded: boolean = false;
  isLoading: boolean = false;
  loadProgress: number = 0;
  pyodide: any = null;
  loadError: string | null = null;

  /**
   * Load the Pyodide runtime and PyMuPDF library
   */
  async loadPyMuPDF(): Promise<void> {
    // If already loaded, return immediately
    if (this.isLoaded) return;
    
    // If currently loading, wait for it to complete
    if (this.isLoading) {
      while (this.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isLoading = true;
    this.loadProgress = 0;
    
    try {
      console.log("Starting PyMuPDF loading process...");
      
      // Initialize Pyodide
      this.loadProgress = 10;
      this.pyodide = await this.initializePyodide();
      this.loadProgress = 50;
      
      // Install and import PyMuPDF (fitz)
      console.log("Installing PyMuPDF...");
      await this.installPyMuPDF();
      this.loadProgress = 90;
      
      // Setup PDF redaction function
      await this.setupRedactionFunction();
      this.loadProgress = 100;
      
      this.isLoaded = true;
      console.log("PyMuPDF successfully loaded and ready!");
    } catch (error) {
      console.error("Failed to load PyMuPDF:", error);
      this.loadError = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Initialize the Pyodide runtime
   */
  private async initializePyodide(): Promise<any> {
    try {
      console.log("Initializing Pyodide...");
      
      // Check if window.loadPyodide is available, if not, wait for it
      if (typeof window.loadPyodide !== 'function') {
        console.log("loadPyodide not available yet, waiting...");
        
        // Wait for loadPyodide to become available (max 30 seconds)
        for (let i = 0; i < 60; i++) {
          await new Promise(resolve => setTimeout(resolve, 500));
          if (typeof window.loadPyodide === 'function') {
            console.log("loadPyodide became available after waiting");
            break;
          }
          if (i % 10 === 0) {
            console.log(`Still waiting for loadPyodide... (${i/2}s)`);
          }
        }
        
        // If still not available, try dynamically loading the script
        if (typeof window.loadPyodide !== 'function') {
          console.log("loadPyodide still not available, loading script dynamically");
          
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js';
            script.onload = () => {
              console.log("Pyodide script loaded dynamically");
              resolve();
            };
            script.onerror = () => {
              reject(new Error("Failed to load Pyodide script dynamically"));
            };
            document.head.appendChild(script);
          });
          
          // Wait a bit more for initialization
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Final check before proceeding
      if (typeof window.loadPyodide !== 'function') {
        throw new Error("loadPyodide function not available after waiting and dynamic loading");
      }
      
      console.log("loadPyodide is available, initializing...");
      const pyodide = await window.loadPyodide({
        indexURL: PYODIDE_CDN_URL,
        stdout: (text: string) => console.log("Pyodide stdout:", text),
        stderr: (text: string) => console.error("Pyodide stderr:", text)
      });
      
      console.log("Pyodide initialized successfully!");
      return pyodide;
    } catch (error) {
      console.error("Error initializing Pyodide:", error);
      throw new Error(`Failed to initialize Pyodide: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Install PyMuPDF using micropip
   */
  private async installPyMuPDF(): Promise<void> {
    try {
      // Load micropip for package installation
      await this.pyodide.loadPackage('micropip');
      const micropip = this.pyodide.pyimport('micropip');
      
      // First, install dependencies that PyMuPDF might need
      await this.pyodide.loadPackage(['numpy']);
      
      // Try to install PyMuPDF using micropip
      console.log("Installing PyMuPDF package...");
      await micropip.install('pymupdf');
      
      // Verify installation by importing and checking version
      const pyMuPDFVersion = await this.pyodide.runPythonAsync(`
        import fitz
        fitz.__version__
      `);
      
      console.log(`PyMuPDF version ${pyMuPDFVersion} installed successfully`);
    } catch (error) {
      console.error("Error installing PyMuPDF:", error);
      throw new Error(`Failed to install PyMuPDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Set up the Python function for PDF redaction
   */
  private async setupRedactionFunction(): Promise<void> {
    try {
      await this.pyodide.runPythonAsync(`
        import io
        import fitz  # PyMuPDF

        def redact_pdf(pdf_data, terms_to_redact):
            """
            Redact sensitive information from a PDF
            
            Args:
                pdf_data: Bytes containing the PDF
                terms_to_redact: List of strings to redact
                
            Returns:
                Bytes of the redacted PDF
            """
            # Load the PDF from bytes
            memory_file = io.BytesIO(pdf_data)
            doc = fitz.open(stream=memory_file, filetype="pdf")
            
            # Process each page
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Process each term
                for term in terms_to_redact:
                    if not term or term.strip() == "":
                        continue
                        
                    # Find all instances of the term
                    instances = page.search_for(term)
                    
                    # Skip if no instances found
                    if not instances:
                        continue
                    
                    # Add redaction annotations for each instance
                    for inst in instances:
                        # Add some padding to make sure the entire term is covered
                        inst.x0 -= 2
                        inst.y0 -= 2
                        inst.x1 += 2
                        inst.y1 += 2
                        
                        # Add redaction annotation with black fill
                        annot = page.add_redact_annot(inst, fill=(0, 0, 0))
                
                # Apply all redactions at once
                page.apply_redactions()
            
            # Save to bytes
            output_buffer = io.BytesIO()
            doc.save(output_buffer)
            doc.close()
            
            # Return the redacted PDF as bytes
            return output_buffer.getvalue()
      `);
      
      console.log("Redaction function set up successfully");
    } catch (error) {
      console.error("Error setting up redaction function:", error);
      throw new Error(`Failed to set up redaction function: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Redact a PDF using PyMuPDF
   * 
   * @param pdfData - Binary PDF data as Uint8Array
   * @param terms - List of terms to redact
   * @returns Redacted PDF data as Uint8Array
   */
  async redactPDF(pdfData: Uint8Array, terms: string[]): Promise<Uint8Array> {
    // Ensure PyMuPDF is loaded
    if (!this.isLoaded) {
      await this.loadPyMuPDF();
    }
    
    try {
      console.log(`Redacting PDF with ${terms.length} terms...`);
      
      // Filter out empty terms
      const validTerms = terms.filter(term => term && term.trim() !== "");
      if (validTerms.length === 0) {
        console.warn("No valid terms to redact");
        return pdfData; // Return original if nothing to redact
      }
      
      // Convert PDF data to Python bytes
      const pdfBytes = this.pyodide.toPy(Array.from(pdfData));
      
      // Convert terms to Python list
      const pyTerms = this.pyodide.toPy(validTerms);
      
      // Call the redaction function
      console.log("Calling Python redaction function...");
      const result = await this.pyodide.runPythonAsync(`redact_pdf(${pdfBytes}, ${pyTerms})`);
      
      // Convert result back to JavaScript Uint8Array
      const resultBytes = result.toJs();
      return new Uint8Array(resultBytes);
    } catch (error) {
      console.error("Error during PDF redaction:", error);
      throw new Error(`PDF redaction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Create and export a singleton instance
const pyMuPDFBridge = new PyMuPDFBridge();
export default pyMuPDFBridge; 