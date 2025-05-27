import React, { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';

const MergePDFPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setFiles(prev => [...prev, ...Array.from(fileList).filter(f => f.type === 'application/pdf')]);
  };

  // Drag-and-drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Remove file
  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
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

  // Merge PDFs using pdf-lib
  const handleMerge = async () => {
    setIsMerging(true);
    setError(null);
    setProgress(0);
    try {
      const mergedPdf = await PDFDocument.create();
      for (let i = 0; i < files.length; i++) {
        setProgress(Math.round((i / files.length) * 100));
        const bytes = await files[i].arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
      setProgress(100);
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      setError('Failed to merge PDFs.');
    }
    setIsMerging(false);
    setProgress(0);
  };

  return (
    <main className="container-app mx-auto px-2 md:px-0 py-8">
      <h1 className="text-2xl font-bold mb-4">Merge PDFs</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">Combine multiple PDF files into one. Drag, drop, reorder, and download instantly.</p>
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
    </main>
  );
};

export default MergePDFPage; 