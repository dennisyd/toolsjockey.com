import React, { useRef, useState, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';

const ROTATIONS = [0, 90, 180, 270];

const RotatePDFPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [rotations, setRotations] = useState<number[]>([]); // per-page
  const [globalRotation, setGlobalRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadLinkRef = useRef<HTMLAnchorElement>(null);

  // Auto-trigger download when resultUrl changes
  useEffect(() => {
    if (resultUrl && downloadLinkRef.current) {
      downloadLinkRef.current.click();
    }
  }, [resultUrl]);

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
    // Get page count
    try {
      const bytes = await f.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      setPageCount(pdfDoc.getPageCount());
      setRotations(Array(pdfDoc.getPageCount()).fill(0));
    } catch (e) {
      setError('Failed to read PDF.');
    }
  };

  // Drag-and-drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Set rotation for all pages
  const handleGlobalRotation = (rot: number) => {
    setGlobalRotation(rot);
    setRotations(Array(pageCount).fill(rot));
  };

  // Set rotation for a single page
  const handlePageRotation = (idx: number, rot: number) => {
    setRotations(prev => prev.map((r, i) => (i === idx ? rot : r)));
  };

  // Rotate and download
  const handleRotate = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setResultUrl(null);
    try {
      const bytes = await file.arrayBuffer();
      setProgress(10);
      const pdfDoc = await PDFDocument.load(bytes);
      setProgress(30);
      const pages = pdfDoc.getPages();
      for (let i = 0; i < pages.length; i++) {
        pages[i].setRotation(degrees(rotations[i]));
      }
      setProgress(70);
      const newBytes = await pdfDoc.save();
      setProgress(90);
      const url = URL.createObjectURL(new Blob([newBytes], { type: 'application/pdf' }));
      setResultUrl(url);
      setProgress(100);
    } catch (e: any) {
      setError('Failed to rotate PDF.');
    }
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  return (
    <main className="container-app mx-auto px-2 md:px-0 py-8">
      <h1 className="text-2xl font-bold mb-4">Rotate PDF Pages</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">Rotate all or selected pages in your PDF. Everything runs in your browser.</p>
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
      {file && pageCount > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <button
              className="btn btn-primary"
              onClick={handleRotate}
              disabled={isProcessing || !file}
            >
              {isProcessing ? 'Rotating...' : 'Apply Rotation & Download'}
            </button>
            <span className="font-medium ml-4">Rotate all pages:</span>
            {ROTATIONS.map(rot => (
              <button
                key={rot}
                className={`px-3 py-1 rounded border ${globalRotation === rot ? 'bg-accent text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
                onClick={() => handleGlobalRotation(rot)}
                disabled={isProcessing}
              >
                {rot}&deg;
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Page</th>
                  <th className="px-2 py-1 text-left">Rotation</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: pageCount }).map((_, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="px-2 py-1">{idx + 1}</td>
                    <td className="px-2 py-1">
                      <select
                        className="border rounded px-2 py-1"
                        value={rotations[idx]}
                        onChange={e => handlePageRotation(idx, Number(e.target.value))}
                        disabled={isProcessing}
                      >
                        {ROTATIONS.map(rot => (
                          <option key={rot} value={rot}>{rot}&deg;</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="btn btn-primary mt-4"
            onClick={handleRotate}
            disabled={isProcessing || !file}
          >
            {isProcessing ? 'Rotating...' : 'Apply Rotation & Download'}
          </button>
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
      {file && pageCount === 0 && (
        <div className="mb-6 text-red-600">This PDF has no pages.</div>
      )}
      {resultUrl && (
        <div className="mb-4">
          <a
            href={resultUrl}
            download={file ? file.name.replace(/\.pdf$/, '-rotated.pdf') : 'rotated.pdf'}
            className="btn btn-success"
            ref={downloadLinkRef}
            style={{ display: 'none' }}
          >
            Download Rotated PDF
          </a>
          <div className="text-green-700 text-sm">Your rotated PDF is downloading...</div>
        </div>
      )}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </main>
  );
};

export default RotatePDFPage; 