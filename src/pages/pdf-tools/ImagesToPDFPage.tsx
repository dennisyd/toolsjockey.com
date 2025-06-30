import React, { useEffect, useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import PDFSuiteLayout from '../../components/layout/PDFSuiteLayout';

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ImgFile {
  file: File;
  url: string;
}

const ImagesToPDFPage: React.FC = () => {
  const [images, setImages] = useState<ImgFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    document.title = 'Convert Images to PDF – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Upload images and merge them into a single PDF file.');
  }, []);

  // Handle file selection
  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const validFiles = Array.from(fileList).filter(f => SUPPORTED_TYPES.includes(f.type));
    if (validFiles.length === 0) {
      setError('Please select image files (JPG, PNG, WebP).');
      return;
    }
    const newImgs = validFiles.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setImages(prev => [...prev, ...newImgs]);
    setPdfUrl(null);
    setError(null);
    setProgress(0);
  };

  // Drag-and-drop file
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Remove image
  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  // Drag-and-drop reorder
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
    const newOrder = [...images];
    const [moved] = newOrder.splice(from, 1);
    newOrder.splice(to, 0, moved);
    setImages(newOrder);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Convert images to PDF
  const handleConvert = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setPdfUrl(null);
    setError(null);
    setProgress(0);
    try {
      const pdfDoc = await PDFDocument.create();
      for (let i = 0; i < images.length; i++) {
        setProgress(Math.round(((i + 1) / images.length) * 90));
        const imgFile = images[i].file;
        const imgBytes = await imgFile.arrayBuffer();
        let embed, dims;
        if (imgFile.type === 'image/jpeg') {
          embed = await pdfDoc.embedJpg(imgBytes);
        } else if (imgFile.type === 'image/png') {
          embed = await pdfDoc.embedPng(imgBytes);
        } else if (imgFile.type === 'image/webp') {
          // Convert webp to png via canvas
          const img = new window.Image();
          img.src = images[i].url;
          await new Promise(res => { img.onload = res; });
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          const pngDataUrl = canvas.toDataURL('image/png');
          const pngBytes = await (await fetch(pngDataUrl)).arrayBuffer();
          embed = await pdfDoc.embedPng(pngBytes);
        } else {
          continue;
        }
        dims = embed.scale(1);
        const page = pdfDoc.addPage([dims.width, dims.height]);
        page.drawImage(embed, {
          x: 0,
          y: 0,
          width: dims.width,
          height: dims.height,
        });
      }
      setProgress(95);
      const pdfBytes = await pdfDoc.save();
      const url = URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
      setPdfUrl(url);
      setProgress(100);
    } catch (e) {
      setError('Failed to create PDF.');
    }
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  // Download PDF
  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'images-to-pdf.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PDFSuiteLayout title="Convert Images to PDF">
      <div className="mb-6">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded text-yellow-900 dark:text-yellow-100 text-sm">
          <strong>Note:</strong> Images are not uploaded to any server. Drag to reorder. Large images may increase PDF size.
        </div>
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={e => handleFiles(e.target.files)}
      />
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors mb-4"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <span className="text-gray-500">Drag & drop images here, or click to select (JPG, PNG, WebP)</span>
      </div>
      {images.length > 0 && (
        <div className="mb-6">
          <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">{images.length} image{images.length !== 1 ? 's' : ''} selected. Drag to reorder.</div>
          <div className="flex flex-wrap gap-4 mb-6">
            {images.map((img, idx) => (
              <div
                key={img.url}
                className="flex flex-col items-center cursor-move border rounded shadow bg-white dark:bg-slate-800 p-2"
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragEnter={() => handleDragEnter(idx)}
                onDragEnd={handleDragEnd}
                onDragOver={e => e.preventDefault()}
                style={{ opacity: isProcessing ? 0.5 : 1 }}
                title={`Image ${idx + 1}`}
              >
                <img
                  src={img.url}
                  alt={`Image ${idx + 1}`}
                  className="w-24 h-32 object-contain border mb-1 bg-slate-100 dark:bg-slate-700"
                  draggable={false}
                />
                <span className="text-xs text-gray-600 dark:text-gray-300 mb-1">Image {idx + 1}</span>
                <button
                  className="btn btn-xs btn-danger"
                  onClick={() => removeImage(idx)}
                  disabled={isProcessing}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              className="btn btn-primary text-lg px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent"
              onClick={handleConvert}
              disabled={isProcessing || images.length === 0}
            >
              {isProcessing ? 'Processing...' : 'Create PDF'}
            </button>
            <button
              className={`btn btn-success text-lg px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 ${!pdfUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleDownload}
              disabled={!pdfUrl}
            >
              Download PDF
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
      {pdfUrl && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Preview</h2>
          <iframe
            src={pdfUrl}
            className="w-full h-96 border rounded"
            title="PDF Preview"
          />
        </div>
      )}
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </PDFSuiteLayout>
  );
};

export default ImagesToPDFPage; 