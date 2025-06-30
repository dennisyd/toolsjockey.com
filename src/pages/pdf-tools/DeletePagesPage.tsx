import React, { useRef, useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import PDFSuiteLayout from '../../components/layout/PDFSuiteLayout';

const DeletePagesPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [deletePages, setDeletePages] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Delete PDF Pages – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Select pages to remove from your PDF and export a new file.');
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
    setResultUrl(null);
    setDeletePages([]);
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

  // Toggle page selection
  const togglePage = (page: number) => {
    setDeletePages(prev => prev.includes(page) ? prev.filter(p => p !== page) : [...prev, page]);
  };

  // Delete selected pages
  const handleDelete = async () => {
    if (!file || !pageCount) return;
    setIsProcessing(true);
    setError(null);
    setResultUrl(null);
    setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const keepPages = Array.from({ length: pageCount }, (_, i) => i).filter(i => !deletePages.includes(i + 1));
      if (keepPages.length === 0) {
        setError('You must keep at least one page.');
        setIsProcessing(false);
        return;
      }
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdf, keepPages.map(i => i));
      copiedPages.forEach(page => newPdf.addPage(page));
      setProgress(90);
      const newBytes = await newPdf.save();
      setResultUrl(URL.createObjectURL(new Blob([newBytes], { type: 'application/pdf' })));
      setProgress(100);
    } catch (e: any) {
      setError('Failed to delete pages.');
    }
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  // Download result
  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = file ? file.name.replace(/\.pdf$/, '-pages-deleted.pdf') : 'pages-deleted.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PDFSuiteLayout title="Delete PDF Pages">
      <div className="mb-6">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded text-yellow-900 dark:text-yellow-100 text-sm">
          <strong>Note:</strong> Select the pages you want to <b>delete</b> from your PDF. At least one page must remain. No server upload.
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
      {file && pageCount !== null && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              className="btn btn-primary text-lg px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent"
              onClick={handleDelete}
              disabled={isProcessing || deletePages.length === 0}
            >
              {isProcessing ? 'Processing...' : 'Delete Selected Pages'}
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
          <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">PDF has <b>{pageCount}</b> page{pageCount !== 1 ? 's' : ''}.</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.from({ length: pageCount }).map((_, idx) => (
              <label key={idx} className={`inline-flex items-center px-2 py-1 rounded border cursor-pointer select-none ${deletePages.includes(idx + 1) ? 'bg-red-100 border-red-400 text-red-700' : 'bg-slate-100 dark:bg-slate-800 border-gray-300 dark:border-gray-600'}`}>
                <input
                  type="checkbox"
                  className="mr-1 accent-red-500"
                  checked={deletePages.includes(idx + 1)}
                  onChange={() => togglePage(idx + 1)}
                  disabled={isProcessing}
                />
                {idx + 1}
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              className="btn btn-primary text-lg px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent"
              onClick={handleDelete}
              disabled={isProcessing || deletePages.length === 0}
            >
              {isProcessing ? 'Processing...' : 'Delete Selected Pages'}
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
    </PDFSuiteLayout>
  );
};

export default DeletePagesPage; 