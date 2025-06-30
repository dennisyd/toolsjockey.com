import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { HelpCircle, FileSpreadsheet, FileText, Info, ChevronDown, ChevronRight, FileType, File } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Utility: Text transforms
const transforms = {
  uppercase: (v: string) => v.toUpperCase(),
  lowercase: (v: string) => v.toLowerCase(),
  title: (v: string) => v.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()),
};

// Pre-built templates
const templateLibrary = [
  {
    name: 'Business Letter',
    content: `Dear {{Name}},\n\nThank you for your interest in {{Company}}. We are pleased to confirm your {{Position}} role.\n\nYour start date: {{StartDate}}\nYour manager: {{Manager}}\nYour email: {{Email}}\n\nWelcome to the team!\n\nBest regards,\nHR Department`,
  },
  {
    name: 'Event Invitation',
    content: `Dear {{Name}},\n\nYou're invited to {{EventName}}!\n\nDate: {{Date}}\nTime: {{Time}}\nLocation: {{Location}}\nRSVP: {{RSVPEmail}}\n\nWe look forward to seeing you there!\n\nBest regards,\n{{OrganizerName}}`,
  },
  {
    name: 'Invoice Template',
    content: 'INVOICE\n\nBill To: {{CustomerName}}\nCompany: {{CustomerCompany}}\nEmail: {{CustomerEmail}}\n\nInvoice #: {{InvoiceNumber}}\nDate: {{Date}}\nAmount: ${{Amount}}\nDue Date: {{DueDate}}\n\nDescription: {{Description}}\n\nThank you for your business!',
  },
];

// Sample data for example
const sampleData = [
  { Name: 'John Smith', Email: 'john@example.com', Company: 'ABC Corp', Position: 'Manager' },
  { Name: 'Jane Doe', Email: 'jane@example.com', Company: 'XYZ Inc', Position: 'Director' },
];

// Document format types
type DocumentFormat = 'txt' | 'pdf' | 'docx';

// Utility: Apply template to a row
function applyTemplate(template: string, row: Record<string, string>) {
  return template.replace(/{{(\w+)(\|\w+)?}}/g, (_unused, col, transform) => {
    let value = row[col] || '';
    if (transform) {
      const fn = transforms[transform.slice(1) as keyof typeof transforms];
      if (fn) value = fn(value);
    }
    return value;
  });
}

const MailMergeTool: React.FC = () => {
  // State
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileStats, setFileStats] = useState<{ rows: number; columns: number; fileType: string }>({ rows: 0, columns: 0, fileType: '' });
  const [fileError, setFileError] = useState<string | null>(null);
  const [template, setTemplate] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('');
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [mergeResults, setMergeResults] = useState<string[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSampleData, setShowSampleData] = useState(false);
  const [documentFormat, setDocumentFormat] = useState<DocumentFormat>('txt');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process CSV file
  const handleCsvFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (!results.data || !Array.isArray(results.data)) {
          setFileError('Failed to parse CSV.');
          setIsProcessing(false);
          return;
        }
        const parsedData = results.data as Record<string, string>[];
        if (parsedData.length === 0) {
          setFileError('CSV contains no data.');
          setIsProcessing(false);
          return;
        }
        setData(parsedData);
        setHeaders(Object.keys(parsedData[0]));
        setFileStats({
          rows: parsedData.length,
          columns: Object.keys(parsedData[0]).length,
          fileType: 'CSV'
        });
        setShowToast('CSV file uploaded successfully!');
        setIsProcessing(false);
      },
      error: (err) => {
        setFileError('CSV parse error: ' + err.message);
        setIsProcessing(false);
      },
    });
  };

  // Process Excel file
  const handleExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { header: 'A' });
      
      // Extract headers from the first row
      const headers = Object.keys(jsonData[0]).map(key => String(jsonData[0][key]));
      
      // Remove the header row and convert data to the right format
      const rows = jsonData.slice(1).map(row => {
        const formattedRow: Record<string, string> = {};
        Object.keys(row).forEach((cell, index) => {
          formattedRow[headers[index]] = String(row[cell]);
        });
        return formattedRow;
      });
      
      if (rows.length === 0) {
        setFileError('Excel file contains no data.');
        setIsProcessing(false);
        return;
      }
      
      setData(rows);
      setHeaders(headers);
      setFileStats({
        rows: rows.length,
        columns: headers.length,
        fileType: 'Excel'
      });
      setShowToast('Excel file uploaded successfully!');
      setIsProcessing(false);
    } catch (error) {
      setFileError(`Excel parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  // File Upload Handler
  const handleFile = (file: File) => {
    setFileError(null);
    setIsProcessing(true);
    
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    if (fileType === 'csv') {
      handleCsvFile(file);
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      handleExcelFile(file);
    } else {
      setFileError('Unsupported file format. Please upload a CSV or Excel file.');
      setIsProcessing(false);
    }
  };

  // Template Save/Load
  const saveTemplate = () => {
    localStorage.setItem('mailmerge_template', template);
    setShowToast('Template saved!');
  };
  const loadTemplate = () => {
    const t = localStorage.getItem('mailmerge_template');
    if (t) setTemplate(t);
    setShowToast('Template loaded!');
  };

  // Merge
  const handleMerge = () => {
    if (!template || headers.length === 0) return;
    setIsMerging(true);
    setTimeout(() => {
      const results = data.map(row => applyTemplate(template, row));
      setMergeResults(results);
      setPreviewIndex(0);
      setIsMerging(false);
      setShowToast('Mail merge complete!');
    }, 100);
  };

  // Create PDF from text content
  const createPDF = (content: string): Blob => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set font size
    doc.setFontSize(11);
    
    // Get page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    // Split content by newlines
    const lines = content.split('\n');
    let y = margin;
    
    // Process each line
    for (const line of lines) {
      // Handle text wrapping for long lines
      const textLines = doc.splitTextToSize(line, maxWidth);
      
      // Add each wrapped line to the PDF
      for (const textLine of textLines) {
        // Check if we need a new page
        if (y > (doc.internal.pageSize.height - margin)) {
          doc.addPage();
          y = margin;
        }
        
        // Add the line with proper margins
        doc.text(textLine, margin, y);
        y += 7; // Line spacing
      }
      
      // Add extra spacing after paragraphs
      if (line.trim() === '') {
        y += 3;
      }
    }
    
    return doc.output('blob');
  };

  // Create Word document from text content
  const createWordDoc = async (content: string): Promise<Blob> => {
    // Split content by newlines
    const paragraphs = content.split('\n');
    
    // Create document with paragraphs
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs.map(text => 
            new Paragraph({
              children: [new TextRun(text)]
            })
          )
        }
      ]
    });
    
    // Generate blob
    return await Packer.toBlob(doc);
  };

  // Download single document
  const downloadSingle = async () => {
    if (!mergeResults.length) return;
    
    const content = mergeResults[previewIndex];
    let blob: Blob;
    let fileExtension: string;
    
    switch (documentFormat) {
      case 'pdf':
        blob = createPDF(content);
        fileExtension = 'pdf';
        break;
      case 'docx':
        blob = await createWordDoc(content);
        fileExtension = 'docx';
        break;
      case 'txt':
      default:
        blob = new Blob([content], { type: 'text/plain' });
        fileExtension = 'txt';
        break;
    }
    
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `document_${previewIndex + 1}.${fileExtension}`;
    a.click();
  };

  // Download all as ZIP
  const downloadAll = async () => {
    if (!mergeResults.length) return;
    
    setIsProcessing(true);
    const zip = new JSZip();
    
    try {
      // Process each document
      for (let i = 0; i < mergeResults.length; i++) {
        const content = mergeResults[i];
        let blob: Blob;
        let fileExtension: string;
        
        switch (documentFormat) {
          case 'pdf':
            blob = createPDF(content);
            fileExtension = 'pdf';
            break;
          case 'docx':
            blob = await createWordDoc(content);
            fileExtension = 'docx';
            break;
          case 'txt':
          default:
            blob = new Blob([content], { type: 'text/plain' });
            fileExtension = 'txt';
            break;
        }
        
        // Add file to zip
        zip.file(`document_${i + 1}.${fileExtension}`, blob);
      }
      
      // Generate and download zip
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `mailmerge_documents.zip`;
      a.click();
    } catch (error) {
      setShowToast(`Error creating ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Placeholder validation
  const unmatchedPlaceholders = template.match(/{{(\w+)}}/g)?.filter(ph => !headers.includes(ph.replace(/[{}]/g, '')));

  // Toast auto-hide
  React.useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  // UI
  return (
    <div className="flex flex-col gap-6">
      {/* Byline */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Mail Merging Made Simpler!</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Create personalized documents in multiple formats with ease</p>
      </div>
      
      {/* Help & Examples Section */}
      <div className="space-y-3">
        {/* How to Use (Collapsible) */}
        <div className="border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
          <button 
            className="w-full flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-left"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <h3 className="font-semibold text-blue-700 dark:text-blue-300">How to Use Mail Merge</h3>
            </div>
            {showInstructions ? 
              <ChevronDown className="h-5 w-5 text-blue-500" /> : 
              <ChevronRight className="h-5 w-5 text-blue-500" />
            }
          </button>
          
          {showInstructions && (
            <div className="p-4 bg-white dark:bg-gray-800/50">
              <ol className="list-decimal list-inside text-sm text-gray-800 dark:text-gray-200 space-y-1">
                <li>Upload a CSV or Excel file with your data (first row should contain column headers)</li>
                <li>Create or select a template with placeholders like <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{"{{ColumnName}}"}</code></li>
                <li>Generate documents to preview the merged results</li>
                <li>Choose your preferred document format (TXT, PDF, or Word)</li>
                <li>Download individual documents or all as a ZIP file</li>
              </ol>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                <strong>Pro tip:</strong> Use transforms like <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{"{{Name|uppercase}}"}</code> to format text
              </p>
            </div>
          )}
        </div>
        
        {/* Sample Data Format (Collapsible) */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button 
            className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-left"
            onClick={() => setShowSampleData(!showSampleData)}
          >
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">Sample Data Format</h3>
            </div>
            {showSampleData ? 
              <ChevronDown className="h-5 w-5 text-gray-500" /> : 
              <ChevronRight className="h-5 w-5 text-gray-500" />
            }
          </button>
          
          {showSampleData && (
            <div className="p-4 bg-white dark:bg-gray-800/30">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Your CSV/Excel file should look like this:
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border border-gray-300 dark:border-gray-700">
                  <thead>
                    <tr>
                      {Object.keys(sampleData[0]).map(header => (
                        <th key={header} className="border border-gray-300 dark:border-gray-700 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sampleData.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((value, j) => (
                          <td key={j} className="border border-gray-300 dark:border-gray-700 px-2 py-1 bg-white dark:bg-gray-800">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                <p>✓ First row contains column headers</p>
                <p>✓ Each row represents one record</p>
                <p>✓ Column headers will be available as <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{"{{Name}}"}</code>, <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">{"{{Email}}"}</code>, etc.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Step 1: File Upload */}
      <section className="card p-6 bg-white dark:bg-primary-light rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Step 1: Upload Data File</h2>
        <div className="flex flex-col gap-4">
          <button 
            className="dropzone border-2 border-dashed border-blue-400 rounded-lg px-6 py-8 bg-blue-50 hover:bg-blue-100 transition flex flex-col items-center gap-3" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-500" />
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <span className="font-semibold text-lg">
              {isProcessing ? 'Processing...' : 'Click to upload CSV or Excel file'}
            </span>
            <span className="text-sm text-gray-500">Supported formats: .csv, .xlsx, .xls</span>
          </button>
          <input 
            ref={fileInputRef} 
            type="file" 
            accept=".csv,.xlsx,.xls" 
            className="hidden" 
            onChange={e => e.target.files && handleFile(e.target.files[0])} 
            disabled={isProcessing}
          />
          {fileError && <div className="text-red-600 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200">{fileError}</div>}
        </div>
        {data.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">
              {fileStats.rows} records, {fileStats.columns} columns ({fileStats.fileType} file)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border">
                <thead><tr>{headers.map(h => <th key={h} className="border px-2 py-1 bg-gray-100">{h}</th>)}</tr></thead>
                <tbody>
                  {data.slice(0, 3).map((row, i) => (
                    <tr key={i}>{headers.map(h => <td key={h} className="border px-2 py-1">{row[h]}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Step 2: Template Editor */}
      <section className="card p-6 bg-white dark:bg-primary-light rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Step 2: Edit Template</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <textarea
            className="w-full min-h-[180px] border rounded p-2 font-mono text-sm"
            placeholder="Type your template here using {{ColumnName}} placeholders..."
            value={template}
            onChange={e => setTemplate(e.target.value)}
          />
          <div className="flex flex-col gap-2 min-w-[220px]">
            <label className="font-semibold">Pre-built Templates</label>
            <select className="border rounded p-1" value={templateName} onChange={e => {
              const t = templateLibrary.find(t => t.name === e.target.value);
              setTemplateName(e.target.value);
              if (t) setTemplate(t.content);
            }}>
              <option value="">Select a template...</option>
              {templateLibrary.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
            </select>
            <button className="mt-2 bg-blue-600 text-white rounded px-3 py-1" onClick={saveTemplate}>Save Template</button>
            <button className="bg-gray-300 text-gray-800 rounded px-3 py-1" onClick={loadTemplate}>Load Saved</button>
            <div className="text-xs text-gray-500 mt-2">Placeholders: <code>{headers.map(h => `{{${h}}}`).join(', ')}</code></div>
            {unmatchedPlaceholders && unmatchedPlaceholders.length > 0 && (
              <div className="text-xs text-red-600 mt-2">Unmatched: {unmatchedPlaceholders.join(', ')}</div>
            )}
            <div className="text-xs text-gray-400 mt-2">{template.length} characters</div>
          </div>
        </div>
      </section>

      {/* Step 3: Preview & Generate */}
      <section className="card p-6 bg-white dark:bg-primary-light rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Step 3: Preview & Generate</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <button 
            className="bg-green-600 text-white rounded px-4 py-2 font-semibold" 
            onClick={handleMerge} 
            disabled={!template || headers.length === 0 || isMerging}
          >
            {isMerging ? 'Merging...' : 'Generate Documents'}
          </button>
          
          {mergeResults.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Format:</label>
                <div className="flex border rounded overflow-hidden">
                  <button 
                    className={`flex items-center gap-1 px-3 py-1 text-sm ${documentFormat === 'txt' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setDocumentFormat('txt')}
                  >
                    <FileText className="w-4 h-4" />
                    <span>TXT</span>
                  </button>
                  <button 
                    className={`flex items-center gap-1 px-3 py-1 text-sm ${documentFormat === 'pdf' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setDocumentFormat('pdf')}
                  >
                    <File className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                  <button 
                    className={`flex items-center gap-1 px-3 py-1 text-sm ${documentFormat === 'docx' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setDocumentFormat('docx')}
                  >
                    <FileType className="w-4 h-4" />
                    <span>Word</span>
                  </button>
                </div>
              </div>
              
              <button 
                className="bg-blue-600 text-white rounded px-3 py-1 flex items-center gap-1" 
                onClick={downloadSingle}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Download Current'}
              </button>
              
              <button 
                className="bg-blue-700 text-white rounded px-3 py-1 flex items-center gap-1" 
                onClick={downloadAll}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Download All as ZIP'}
              </button>
              
              <span className="text-xs text-gray-500">{mergeResults.length} documents generated</span>
            </>
          )}
        </div>
        {mergeResults.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <button className="px-2 py-1 rounded bg-gray-200" onClick={() => setPreviewIndex(i => Math.max(0, i - 1))} disabled={previewIndex === 0}>Prev</button>
              <span className="text-xs">{previewIndex + 1} / {mergeResults.length}</span>
              <button className="px-2 py-1 rounded bg-gray-200" onClick={() => setPreviewIndex(i => Math.min(mergeResults.length - 1, i + 1))} disabled={previewIndex === mergeResults.length - 1}>Next</button>
            </div>
            <pre className="bg-gray-100 rounded p-3 text-xs overflow-x-auto max-h-64">{mergeResults[previewIndex]}</pre>
          </div>
        )}
      </section>

      {/* Toast */}
      {showToast && <div className="toast fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow">{showToast}</div>}
    </div>
  );
};

export default MailMergeTool; 