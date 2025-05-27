import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
import { PDFDocument } from 'pdf-lib';

interface PageThumb {
  index: number;
  dataUrl: string;
}

const ReorderPDFPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<PageThumb[]>([]);
  const [order, setOrder] = useState<number[]>([]); // Current order of page indices
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    document.title = 'Reorder PDF Pages – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Rearrange pages with drag-and-drop thumbnail interface.');
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
    setResultUrl(null);
    setError(null);
    setProgress(0);
    setThumbnails([]);
    setOrder([]);
    setPageCount(0);
    // Load PDF and render thumbnails
    try {
      setIsProcessing(true);
      const bytes = await f.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      setPageCount(numPages);
      setOrder(Array.from({ length: numPages }, (_, i) => i));
      // Render thumbnails
      const thumbs: PageThumb[] = [];
      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round((i / numPages) * 80));
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.25 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        thumbs.push({ index: i - 1, dataUrl: canvas.toDataURL('image/png') });
      }
      setThumbnails(thumbs);
      setProgress(100);
    } catch (e) {
      setError('Failed to read PDF or render thumbnails.');
    }
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  // Drag-and-drop handlers
  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };
  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
  };
  const handleDragEnd = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;
    if (from === null || to === null || from === to) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }
    const newOrder = [...order];
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, moved);
    setOrder(newOrder);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Export reordered PDF
  const handleExport = async () => {
    if (!file || order.length === 0) return;
    setIsProcessing(true);
    setError(null);
    setResultUrl(null);
    setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const origPdf = await PDFDocument.load(bytes);
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(origPdf, order);
      copiedPages.forEach(page => newPdf.addPage(page));
      setProgress(90);
      const newBytes = await newPdf.save();
      setResultUrl(URL.createObjectURL(new Blob([newBytes], { type: 'application/pdf' })));
      setProgress(100);
    } catch (e) {
      setError('Failed to export reordered PDF.');
    }
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  // Download result
  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = file ? file.name.replace(/\.pdf$/, '-reordered.pdf') : 'reordered.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Drag-and-drop file
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <main className="container-app mx-auto px-2 md:px-0 py-8">
      <h1 className="text-2xl font-bold mb-4">Reorder PDF Pages</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-2">Rearrange pages with drag-and-drop thumbnails. Everything runs in your browser.</p>
      <div className="mb-6">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded text-yellow-900 dark:text-yellow-100 text-sm">
          <strong>Note:</strong> Drag and drop the thumbnails to reorder pages. No server upload. Large PDFs may take longer to render.
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
      {file && thumbnails.length > 0 && (
        <div className="mb-6">
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">PDF has <b>{pageCount}</b> page{pageCount !== 1 ? 's' : ''}.</div>
          <div className="flex flex-wrap gap-4 mb-6">
            {order.map((pageIdx, idx) => (
              <div
                key={pageIdx}
                className="flex flex-col items-center cursor-move border rounded shadow bg-white dark:bg-slate-800 p-2"
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
                onDragOver={e => e.preventDefault()}
                style={{ opacity: isProcessing ? 0.5 : 1 }}
                title={`Page ${pageIdx + 1}`}
              >
                <img
                  src={thumbnails[pageIdx]?.dataUrl}
                  alt={`Page ${pageIdx + 1}`}
                  className="w-24 h-32 object-contain border mb-1 bg-slate-100 dark:bg-slate-700"
                  draggable={false}
                />
                <span className="text-xs text-gray-600 dark:text-gray-300">Page {pageIdx + 1}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              className="btn btn-primary text-lg px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent"
              onClick={handleExport}
              disabled={isProcessing || order.length === 0}
            >
              {isProcessing ? 'Processing...' : 'Export Reordered PDF'}
            </button>
            <button
              className={`btn btn-success text-lg px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${!resultUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleDownload}
              disabled={!resultUrl}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
              Download Result PDF
            </button>
          </div>
          {isProcessing && (
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
    </main>
  );
};

export default ReorderPDFPage; 