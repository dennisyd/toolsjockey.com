import React, { useRef, useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import PDFSuiteLayout from '../../components/layout/PDFSuiteLayout';

const MergePDFPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup any blob URLs if needed
    };
  }, []);

  // Handle file selection
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList).filter(f => f.type === 'application/pdf');
    if (newFiles.length === 0) {
      setError('No PDF files selected. Please select valid PDF files.');
      return;
    }
    setFiles(prev => [...prev, ...newFiles]);
    setError(null);
    setDebugInfo(null);
  };

  // Drag-and-drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Remove file
  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setError(null);
    setDebugInfo(null);
  };

  // Reorder files (simple up/down)
  const moveFile = (from: number, to: number) => {
    setFiles(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
  };

  // Validate PDF file
  const validatePDF = async (file: File): Promise<boolean> => {
    try {
      // Check file size (prevent memory issues)
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setError(`File too large: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB). Maximum size is 100MB.`);
        return false;
      }

      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pageCount = pdf.getPageCount();
      
      if (pageCount === 0) {
        setError(`Invalid PDF file: ${file.name} - No pages found`);
        return false;
      }
      
      setDebugInfo(prev => `${prev ? prev + '\n' : ''}${file.name}: ${pageCount} pages`);
      return pageCount > 0;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      
      // Handle specific PDF errors
      if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
        setError(`Password-protected PDF: ${file.name} - Please remove password protection first`);
      } else if (errorMessage.includes('corrupted') || errorMessage.includes('invalid')) {
        setError(`Corrupted PDF file: ${file.name} - Please try a different file`);
      } else if (errorMessage.includes('memory') || errorMessage.includes('out of memory')) {
        setError(`File too large: ${file.name} - Please try a smaller file`);
      } else {
        setError(`Invalid PDF file: ${file.name} - ${errorMessage}`);
      }
      return false;
    }
  };

  // Merge PDFs using pdf-lib
  const handleMerge = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    setError(null);
    setDebugInfo('Starting PDF merge process...');
    setProgress(0);

    try {
      // Validate all PDFs first
      setDebugInfo(prev => `${prev}\nValidating PDF files...`);
      for (let i = 0; i < files.length; i++) {
        const isValid = await validatePDF(files[i]);
        if (!isValid) {
          setIsMerging(false);
          setProgress(0);
          return;
        }
        setProgress(Math.round((i / files.length) * 20));
      }

      setDebugInfo(prev => `${prev}\nCreating merged PDF...`);
      const mergedPdf = await PDFDocument.create();
      
      for (let i = 0; i < files.length; i++) {
        setProgress(20 + Math.round((i / files.length) * 70));
        setDebugInfo(prev => `${prev}\nProcessing ${files[i].name}...`);
        
        try {
          const bytes = await files[i].arrayBuffer();
          const pdf = await PDFDocument.load(bytes);
          const pageIndices = pdf.getPageIndices();
          
          if (pageIndices.length === 0) {
            throw new Error(`No pages found in ${files[i].name}`);
          }
          
          const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
          copiedPages.forEach(page => mergedPdf.addPage(page));
          
          setDebugInfo(prev => `${prev}\nAdded ${pageIndices.length} pages from ${files[i].name}`);
        } catch (fileError) {
          throw new Error(`Error processing ${files[i].name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
        }
      }

      setProgress(90);
      setDebugInfo(prev => `${prev}\nSaving merged PDF...`);
      const mergedBytes = await mergedPdf.save();
      
      if (mergedBytes.length === 0) {
        throw new Error('Generated PDF is empty');
      }

      setProgress(95);
      setDebugInfo(prev => `${prev}\nCreating download...`);
      
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup the blob URL
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      setProgress(100);
      setDebugInfo(prev => `${prev}\nMerge completed successfully!`);
      
    } catch (e: any) {
      console.error('PDF merge error:', e);
      setError(`Failed to merge PDFs: ${e.message || 'Unknown error'}`);
      setDebugInfo(prev => `${prev}\nError: ${e.message || 'Unknown error'}`);
    }
    
    setIsMerging(false);
    setProgress(0);
  };

  return (
    <PDFSuiteLayout title="Merge PDFs">
      <input
        type="file"
        accept="application/pdf"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors mb-4"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <span className="text-gray-500">Drag & drop PDF files here, or click to select</span>
      </div>
      {files.length > 0 && (
        <div className="mb-6">
          <div className="font-semibold mb-2">Files to merge:</div>
          <ul className="mb-2">
            {files.map((file, idx) => (
              <li key={file.name + idx} className="flex items-center gap-2 mb-1">
                <span className="truncate max-w-xs">{file.name}</span>
                <button className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded" onClick={() => removeFile(idx)}>Remove</button>
                <button className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded" onClick={() => moveFile(idx, idx - 1)} disabled={idx === 0}>↑</button>
                <button className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded" onClick={() => moveFile(idx, idx + 1)} disabled={idx === files.length - 1}>↓</button>
              </li>
            ))}
          </ul>
          <button
            className="btn btn-primary"
            onClick={handleMerge}
            disabled={isMerging || files.length < 2}
          >
            {isMerging ? 'Merging...' : 'Merge & Download'}
          </button>
          {isMerging && (
            <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
              <div
                className="bg-accent h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      {debugInfo && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-4">
          <h3 className="font-semibold mb-2">Processing Details:</h3>
          <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-48 bg-black text-green-400 p-2 rounded">
            {debugInfo}
          </pre>
        </div>
      )}
    </PDFSuiteLayout>
  );
};

export default MergePDFPage; 