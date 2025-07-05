import React, { useEffect, useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import PDFSuiteLayout from '../../components/layout/PDFSuiteLayout';

const EditMetadataPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState({ title: '', author: '', subject: '', keywords: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [resultUrl]);

  useEffect(() => {
    document.title = 'Edit PDF Metadata – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Edit document information like title, author, subject, and keywords.');
  }, []);

  // Handle PDF upload
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    if (f.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }
    // Clean up existing blob URL
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }
    setFile(f);
    setResultUrl(null);
    setError(null);
    setProgress(0);
    // Read metadata
    try {
      const bytes = await f.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const rawKeywords = pdfDoc.getKeywords();
      setMetadata({
        title: pdfDoc.getTitle() || '',
        author: pdfDoc.getAuthor() || '',
        subject: pdfDoc.getSubject() || '',
        keywords: Array.isArray(rawKeywords)
          ? rawKeywords.join(', ')
          : (typeof rawKeywords === 'string' ? rawKeywords : ''),
      });
    } catch {
      setMetadata({ title: '', author: '', subject: '', keywords: '' });
    }
  };

  // Drag-and-drop PDF
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Update metadata field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMetadata({ ...metadata, [e.target.name]: e.target.value });
  };

  // Save metadata and export
  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setResultUrl(null);
    setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      pdfDoc.setTitle(metadata.title);
      pdfDoc.setAuthor(metadata.author);
      pdfDoc.setSubject(metadata.subject);
      pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()).filter(Boolean));
      setProgress(90);
      const newBytes = await pdfDoc.save();
      setResultUrl(URL.createObjectURL(new Blob([newBytes], { type: 'application/pdf' })));
      setProgress(100);
    } catch (e) {
      setError('Failed to update metadata.');
    }
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  // Download result
  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = file ? file.name.replace(/\.pdf$/, '-metadata.pdf') : 'metadata.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL after download
    setTimeout(() => {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }, 100);
  };

  return (
    <PDFSuiteLayout title="Edit PDF Metadata">
      <div className="mb-6">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded text-yellow-900 dark:text-yellow-100 text-sm">
          <strong>Note:</strong> Your PDF never leaves your device. Metadata is updated instantly and safely.
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
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">Edit the fields below and click Save Metadata.</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="font-semibold">Title</span>
              <input
                type="text"
                name="title"
                value={metadata.title}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                disabled={isProcessing}
              />
            </label>
            <label className="block">
              <span className="font-semibold">Author</span>
              <input
                type="text"
                name="author"
                value={metadata.author}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                disabled={isProcessing}
              />
            </label>
            <label className="block md:col-span-2">
              <span className="font-semibold">Subject</span>
              <input
                type="text"
                name="subject"
                value={metadata.subject}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                disabled={isProcessing}
              />
            </label>
            <label className="block md:col-span-2">
              <span className="font-semibold">Keywords</span>
              <input
                type="text"
                name="keywords"
                value={metadata.keywords}
                onChange={handleChange}
                className="mt-1 p-2 border rounded w-full"
                disabled={isProcessing}
                placeholder="Comma-separated (e.g. pdf, tools, jockey)"
              />
            </label>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              className="btn btn-primary text-lg px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent"
              onClick={handleSave}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Save Metadata'}
            </button>
            <button
              className={`btn btn-success text-lg px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${!resultUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleDownload}
              disabled={!resultUrl}
            >
              Download Updated PDF
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

export default EditMetadataPage; 