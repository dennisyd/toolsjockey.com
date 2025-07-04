import React, { useRef, useState } from 'react';
// @ts-ignore
import * as Tesseract from 'tesseract.js';

import { useAnalytics } from '../../hooks/useAnalytics';

const TextFromImagePage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation

  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setImage(f);
    setImageUrl(URL.createObjectURL(f));
    setOcrText(null);
    setError(null);
    setProgress(0);
  };

  // Drag-and-drop image
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Run OCR
  const handleExtract = async () => {
    if (!image) return;
    setIsProcessing(true);
    setOcrText(null);
    setError(null);
    setProgress(0);
    try {
      const { data } = await Tesseract.recognize(image, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text' && m.progress) setProgress(Math.round(m.progress * 100));
        },
      });
      setOcrText(data.text);
      setProgress(100);
    } catch (e) {
      setError('Failed to extract text from image.');
    }
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  return (
    <main className="container-app mx-auto px-2 md:px-0 py-8">
      <h1 className="text-2xl font-bold mb-4">Text from Image</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-2">Extract text from a single image using OCR (Tesseract.js). Everything runs in your browser.</p>
      <div className="mb-6">
        <div className="bg-blue-100 border-l-4 border-blue-400 p-4 rounded text-blue-900 text-sm mb-4">
          <strong>Note:</strong> This tool is optimized for <b>typed (machine-printed) text only</b>. Handwriting and printed text (e.g., from books or forms) are not supported. For handwritten notes, a separate paid tool will be available in the future.
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
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
        <span className="text-gray-500">Drag & drop an image here, or click to select</span>
      </div>
      {imageUrl && (
        <div className="mb-6 flex flex-col items-center">
          <img src={imageUrl} alt="Preview" className="max-h-64 rounded shadow mb-2" />
        </div>
      )}
      {image && (
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            className="btn btn-primary text-lg px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent"
            onClick={handleExtract}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Extract Text'}
          </button>
        </div>
      )}
      {isProcessing && (
        <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
          <div
            className="bg-accent h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}
      {ocrText && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Extracted Text</h2>
          <pre className="bg-slate-50 dark:bg-slate-800 rounded p-3 shadow-sm whitespace-pre-wrap text-gray-800 dark:text-gray-200 text-sm max-h-96 overflow-auto">{ocrText}</pre>
        </div>
      )}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </main>
  );
};

export default TextFromImagePage; 