import React, { useRef, useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

const SplitPDFPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [splitRange, setSplitRange] = useState('1-1');
  const [splitUrls, setSplitUrls] = useState<{ url: string; name: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Split PDF – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Extract specific pages or ranges and save as separate files.');
  }, []);

  // Handle file selection
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    if (f.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }
    setFile(f);
    setSplitUrls([]);
    setError(null);
    setProgress(0);
    setPageCount(null);
    // Get page count
    f.arrayBuffer().then(bytes => {
      PDFDocument.load(bytes).then(pdf => setPageCount(pdf.getPageCount())).catch(() => setPageCount(null));
    });
  };

  // Drag-and-drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Split PDF by page range (e.g., 1-2,4)
  const handleSplit = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setSplitUrls([]);
    setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const ranges = splitRange.split(',').map(r => r.trim());
      const urls: { url: string; name: string }[] = [];
      for (let i = 0; i < ranges.length; i++) {
        setProgress(Math.round((i / ranges.length) * 90));
        const range = ranges[i];
        let [start, end] = range.split('-').map(Number);
        if (!end) end = start;
        if (isNaN(start) || isNaN(end) || start < 1 || end > pdf.getPageCount() || start > end) {
          setError(`Invalid range: ${range}`);
          setIsProcessing(false);
          return;
        }
        const newPdf = await PDFDocument.create();
        const indices = [];
        for (let p = start - 1; p < end; p++) indices.push(p);
        const copiedPages = await newPdf.copyPages(pdf, indices);
        copiedPages.forEach(page => newPdf.addPage(page));
        const newBytes = await newPdf.save();
        const url = URL.createObjectURL(new Blob([newBytes], { type: 'application/pdf' }));
        urls.push({ url, name: `${file.name.replace(/\.pdf$/, '')}-pages-${range}.pdf` });
      }
      setSplitUrls(urls);
      setProgress(100);
    } catch (e: any) {
      setError('Failed to split PDF.');
    }
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  // Download all split PDFs as ZIP
  const handleDownloadAllSplits = async () => {
    const zip = new JSZip();
    for (const s of splitUrls) {
      const res = await fetch(s.url);
      const blob = await res.blob();
      zip.file(s.name, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'split-pdfs.zip';
    link.click();
  };

  return (
    <main className="container-app mx-auto px-2 md:px-0 py-8">
      <h1 className="text-2xl font-bold mb-4">Split PDF</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-2">Extract specific pages or ranges and save as separate files. Everything runs in your browser.</p>
      <div className="mb-6">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded text-yellow-900 dark:text-yellow-100 text-sm">
          <strong>Note:</strong> Enter page ranges as <b>1-2,4</b> to extract pages 1-2 and 4. Each range will be saved as a separate PDF. No server upload.
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
          {pageCount !== null && (
            <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">PDF has <b>{pageCount}</b> page{pageCount !== 1 ? 's' : ''}.</div>
          )}
          <div className="flex flex-wrap gap-2 items-center mb-4">
            <input
              type="text"
              className="p-2 border rounded w-40"
              value={splitRange}
              onChange={e => setSplitRange(e.target.value)}
              placeholder="1-2,4"
              title="Page ranges (e.g., 1-2,4)"
              disabled={isProcessing}
            />
            <button
              className="btn btn-primary"
              onClick={handleSplit}
              disabled={isProcessing}
            >
              {isProcessing ? 'Splitting...' : 'Split PDF'}
            </button>
          </div>
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
      {splitUrls.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            {splitUrls.map(s => (
              <a key={s.url} href={s.url} download={s.name} className="btn btn-secondary block">{s.name}</a>
            ))}
          </div>
          <button className="btn btn-primary w-full" onClick={handleDownloadAllSplits}>Download All as ZIP</button>
        </div>
      )}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </main>
  );
};

export default SplitPDFPage; 