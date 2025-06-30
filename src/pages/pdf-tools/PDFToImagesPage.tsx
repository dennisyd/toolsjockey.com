import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
import JSZip from 'jszip';
import PDFSuiteLayout from '../../components/layout/PDFSuiteLayout';

interface ImageResult {
  url: string;
  name: string;
  size?: number; // Add size property to track image sizes
}

const PDFToImagesPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [totalImageSize, setTotalImageSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Convert PDF to Images – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Export PDF pages as PNG or JPEG files.');
  }, []);

  // Calculate total size of images and set warning if needed
  useEffect(() => {
    if (images.length > 0) {
      // Estimate total size
      const total = images.reduce((sum, img) => sum + (img.size || 0), 0);
      setTotalImageSize(total);
      
      // Set warning if total size is large
      if (total > 100 * 1024 * 1024) { // 100MB
        setWarning('The total size of images is very large. ZIP creation may fail in the browser. Consider downloading images individually.');
      } else if (total > 50 * 1024 * 1024) { // 50MB
        setWarning('The total size of images is large. ZIP creation may be slow or fail in some browsers.');
      } else {
        setWarning(null);
      }
    } else {
      setTotalImageSize(0);
      setWarning(null);
    }
  }, [images]);

  // Handle file selection
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const f = fileList[0];
    if (f.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }
    setFile(f);
    setImages([]);
    setError(null);
    setWarning(null);
    setProgress(0);
  };

  // Drag-and-drop file
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Render all pages as images
  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    setImages([]);
    setError(null);
    setWarning(null);
    setProgress(0);
    try {
      const bytes = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const imgs: ImageResult[] = [];
      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round((i / numPages) * 90));
        const page = await pdf.getPage(i);
        // Render at 2x scale for better quality
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL(`image/${format}`);
        
        // Estimate size of the image
        const estimatedSize = Math.ceil(dataUrl.length * 0.75); // Base64 is ~33% larger than binary
        
        imgs.push({
          url: dataUrl,
          name: `${file.name.replace(/\.pdf$/, '')}-page-${i}.${format}`,
          size: estimatedSize
        });
      }
      setImages(imgs);
      setProgress(100);
    } catch (e) {
      setError('Failed to render PDF pages as images.');
    }
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  // Download a single image
  const handleDownloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all as ZIP
  const handleDownloadZip = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      const zip = new JSZip();
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        // Convert data URL to Blob more reliably
        const response = await fetch(img.url);
        if (!response.ok) throw new Error(`Failed to fetch image ${i+1}`);
        const blob = await response.blob();
        zip.file(img.name, blob);
        
        // Update progress as we add each file
        setProgress(Math.round((i / images.length) * 50));
      }
      
      try {
        const zipBlob = await zip.generateAsync({ 
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        }, (metadata) => {
          // Scale progress from 50-100% during zip generation
          setProgress(50 + Math.round(metadata.percent / 2));
        });
        
        // Create and trigger download
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file ? file.name.replace(/\.pdf$/, '-images.zip') : 'images.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL after a short delay
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } catch (zipError) {
        console.error("ZIP generation error:", zipError);
        setError('Failed to create ZIP file. The file might be too large or there was a browser error.');
      }
    } catch (e) {
      console.error("ZIP creation error:", e);
      setError('Failed to create ZIP file. Please try downloading images individually.');
    }
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <PDFSuiteLayout title="Convert PDF to Images">
      <div className="container-app mx-auto px-2 md:px-0 py-8">
        <h1 className="text-2xl font-bold mb-4">Convert PDF to Images</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-2">Export PDF pages as PNG or JPEG files. Everything runs in your browser.</p>
        <div className="mb-6">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded text-yellow-900 dark:text-yellow-100 text-sm">
            <strong>Note:</strong> Each page will be rendered as a high-quality image. No server upload. Large PDFs may take longer to process.
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
            <div className="mb-2 text-green-700 dark:text-green-400 font-medium">"{file.name}" successfully uploaded.</div>
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <button
                className="btn btn-primary text-lg px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-accent"
                onClick={handleConvert}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Convert to Images'}
              </button>
              <label className="ml-4 font-medium text-gray-700 dark:text-gray-300">
                Format:
                <select
                  className="ml-2 border rounded px-2 py-1"
                  value={format}
                  onChange={e => setFormat(e.target.value as 'png' | 'jpeg')}
                  disabled={isProcessing}
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                </select>
              </label>
              {images.length > 0 && (
                <button
                  className="btn btn-success text-lg px-6 py-2 rounded shadow font-semibold flex items-center gap-2 transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  onClick={handleDownloadZip}
                  disabled={isProcessing}
                  title={totalImageSize > 0 ? `Total size: ${formatFileSize(totalImageSize)}` : ''}
                >
                  Download All as ZIP
                </button>
              )}
            </div>
            {warning && (
              <div className="bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-400 dark:border-orange-600 p-3 rounded text-orange-900 dark:text-orange-100 text-sm mb-4">
                <strong>Warning:</strong> {warning}
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
          </div>
        )}
        {images.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Page Images</h2>
            <div className="flex flex-wrap gap-6">
              {images.map((img, idx) => (
                <div key={img.url} className="flex flex-col items-center border rounded shadow bg-white dark:bg-slate-800 p-2">
                  <img
                    src={img.url}
                    alt={`Page ${idx + 1}`}
                    className="w-40 h-56 object-contain border mb-1 bg-slate-100 dark:bg-slate-700"
                    draggable={false}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                    Page {idx + 1} {img.size && `(${formatFileSize(img.size)})`}
                  </span>
                  <button
                    className="btn btn-secondary btn-xs"
                    onClick={() => handleDownloadImage(img.url, img.name)}
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </div>
    </PDFSuiteLayout>
  );
};

export default PDFToImagesPage; 