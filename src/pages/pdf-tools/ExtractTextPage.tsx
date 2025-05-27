import React, { useRef, useState } from 'react';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// Remove the worker import and set the workerSrc to the public path
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

const ExtractTextPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [textByPage, setTextByPage] = useState<string[]>([]);
  const [fullText, setFullText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setFullText('');
    setError(null);
    setProgress(0);
  };

  // Drag-and-drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Extract text from PDF
  const handleExtract = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setTextByPage([]);
    setFullText('');
    setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const allText: string[] = [];
      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round((i / numPages) * 100));
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        allText.push(pageText);
      }
      setTextByPage(allText);
      setFullText(allText.join('\n\n'));
      setProgress(100);
    } catch (e: any) {
      setError('Failed to extract text from PDF.');
    }
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  // Download as .txt
  const handleDownload = () => {
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file ? file.name.replace(/\.pdf$/, '-extracted.txt') : 'extracted.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="container-app mx-auto px-2 md:px-0 py-8">
      <h1 className="text-2xl font-bold mb-4">Extract Text from PDF</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">Extract all text from your PDF, per page or as a single document. Everything runs in your browser.</p>
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
            onClick={handleExtract}
            disabled={isProcessing}
          >
            {isProcessing ? 'Extracting...' : 'Extract Text'}
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
      {fullText && (
        <div className="mb-4">
          <button className="btn btn-success mr-2" onClick={handleDownload}>Download as .txt</button>
          <button
            className="btn btn-secondary"
            onClick={() => navigator.clipboard.writeText(fullText)}
          >
            Copy All Text
          </button>
        </div>
      )}
      {textByPage.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Text by Page</h2>
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

export default ExtractTextPage; 