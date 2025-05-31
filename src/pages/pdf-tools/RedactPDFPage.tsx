import React from 'react';
import SEO from '../../components/SEO';
import PageHeading from '../../components/PageHeading';
import PDFRedactionTool from '../../components/tools/PDFRedactionTool';

const RedactPDFPage: React.FC = () => {
  return (
    <>
      <SEO 
        title="PDF Redaction Tool - Secure Document Redaction with PyMuPDF" 
        description="Professionally redact sensitive information like SSNs, phone numbers, and emails from PDF documents using WebAssembly-powered PyMuPDF technology. Enterprise-grade PDF redaction in your browser."
        keywords={["pdf redaction", "redact pdf", "remove sensitive information", "pdf redaction tool", "secure pdf redaction", "redact ssn", "redact phone numbers", "redact emails", "pymupdf", "professional redaction", "webassembly"]}
      />
      
      <div className="container mx-auto px-4 py-8">
        <PageHeading 
          title="PDF Redaction Tool" 
          subtitle="Securely remove sensitive information from PDF documents using PyMuPDF"
        />
        
        <div className="max-w-4xl mx-auto mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Professional-Grade Redaction with PyMuPDF</h2>
          
          <div className="prose max-w-none">
            <p>
              Our advanced PDF redaction tool uses PyMuPDF running in WebAssembly, providing the same high-quality redaction capabilities as professional desktop software, but running entirely in your browser.
            </p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    On first use, this tool will download the PyMuPDF WebAssembly library (~50MB). This is a one-time process, and the library will be cached in your browser for future visits.
                  </p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mt-4">Key Features:</h3>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Character-level precision for exact text redaction using PyMuPDF</li>
              <li>Complete content removal, not just visual masking</li>
              <li>Automatic detection of sensitive information patterns</li>
              <li>All processing happens locally - your documents never leave your browser</li>
              <li>Professional-quality results identical to desktop redaction software</li>
            </ul>
          </div>
        </div>
        
        <PDFRedactionTool />
        
        <div className="max-w-4xl mx-auto mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">About PyMuPDF Redaction</h2>
          
          <div className="prose max-w-none">
            <p>
              This tool uses WebAssembly to run PyMuPDF (the Python binding for MuPDF) directly in your browser. This provides true redaction capabilities, permanently removing sensitive information rather than just covering it with black boxes.
            </p>
            
            <p>
              Here's how the PyMuPDF redaction process works:
            </p>
            
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>Sensitive text is located using PyMuPDF's precise text search</li>
              <li>Redaction annotations are created over each text occurrence</li>
              <li>The redaction is applied, permanently removing the underlying content</li>
              <li>A new, redacted PDF is generated with the sensitive information completely removed</li>
            </ol>
            
            <h3 className="text-lg font-semibold mt-6">WebAssembly Technology</h3>
            <p>
              Using WebAssembly (Pyodide), we're able to run the same PyMuPDF library used in desktop applications directly in your browser. This gives you professional-grade redaction capabilities without requiring any software installation.
            </p>
            
            <h3 className="text-lg font-semibold mt-6">Privacy & Security</h3>
            <p>
              Your files never leave your device. All processing happens locally in your browser using WebAssembly. We do not store, transmit, or have access to your documents at any time.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RedactPDFPage; 