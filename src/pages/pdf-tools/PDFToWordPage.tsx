import React, { useRef, useState, useEffect } from 'react';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
import { Document, Packer, Paragraph, HeadingLevel, PageBreak } from 'docx';

const PDFToWordPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [textByPage, setTextByPage] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [docxUrl, setDocxUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Convert PDF to Word – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Extract and convert text to a simple Word document.');
  }, []);

  // Handle file selection
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    if (f.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }
    setFile(f);
    setTextByPage([]);
    setDocxUrl(null);
    setError(null);
    setProgress(0);
  };

  // Drag-and-drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Extract text and generate docx
  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setTextByPage([]);
    setDocxUrl(null);
    setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const allText: string[] = [];
      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round((i / numPages) * 80));
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        allText.push(pageText);
      }
      setTextByPage(allText);
      // Create docx
      setProgress(85);
      const docChildren: Paragraph[] = [];
      allText.forEach((txt, idx) => {
        if (idx > 0) {
          // Insert a page break before each new page except the first
          docChildren.push(new Paragraph({ children: [new PageBreak()] }));
        }
        if (numPages > 1) {
          docChildren.push(new Paragraph({
            text: `Page ${idx + 1}`,
            heading: HeadingLevel.HEADING_2,
          }));
        }
        txt.split(/\r?\n/).forEach(line => {
          docChildren.push(new Paragraph(line));
        });
      });
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docChildren,
          },
        ],
      });
      setProgress(95);
      const blob = await Packer.toBlob(doc);
      setDocxUrl(URL.createObjectURL(blob));
      setProgress(100);
    } catch (e: any) {
      setError('Failed to convert PDF to Word.');
    }
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  // Download docx
  const handleDownload = () => {
    if (!docxUrl) return;
    const link = document.createElement('a');
    link.href = docxUrl;
    link.download = file ? file.name.replace(/\.pdf$/, '.docx') : 'converted.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="container-app mx-auto px-2 md:px-0 py-8">
      <h1 className="text-2xl font-bold mb-4">Convert PDF to Word</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-2">Extract and convert text to a simple Word document. Everything runs in your browser.</p>
      <div className="mb-6">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded text-yellow-900 dark:text-yellow-100 text-sm">
          <strong>Note:</strong> This tool is designed to extract and convert the <b>text content</b> of your PDF to a Word document. It does <b>not</b> attempt to reproduce the original formatting, layout, fonts, or images from the PDF. The output is intended for quick text reuse, editing, or further formatting in Word, not for creating a visually identical copy of the original PDF.
        </div>
      </div>
      <input
        type="file"
        accept="application/pdf"
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
        <span className="text-gray-500">Drag & drop a PDF file here, or click to select</span>
      </div>
      {file && (
        <div className="mb-6">
          <button
            className="btn btn-primary mb-4"
            onClick={handleConvert}
            disabled={isProcessing}
          >
            {isProcessing ? 'Converting...' : 'Convert to Word (.docx)'}
          </button>
          {isProcessing && (
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div
                className="bg-accent h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
      {docxUrl && (
        <div className="mb-4">
          <button
            className="btn btn-primary text-lg px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent"
            onClick={handleDownload}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
            Download .docx
          </button>
        </div>
      )}
      {textByPage.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Preview (Extracted Text)</h2>
          <div className="space-y-4">
            {textByPage.map((txt, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800 rounded p-3 shadow-sm">
                <div className="font-semibold mb-1">Page {idx + 1}</div>
                <pre className="whitespace-pre-wrap text-xs text-gray-800 dark:text-gray-200">{txt}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </main>
  );
};

export default PDFToWordPage; 