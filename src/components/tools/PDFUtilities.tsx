import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import AdSlot from '../ads/AdSlot';

const PDFUtilities = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [splitUrls, setSplitUrls] = useState<{ url: string; name: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitRange, setSplitRange] = useState('1-1');

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      setPreviews(acceptedFiles.map(f => f.name));
      setResultUrl(null);
      setSplitUrls([]);
    },
  });

  // Merge PDFs
  const handleMerge = async () => {
    setIsProcessing(true);
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }
    const mergedBytes = await mergedPdf.save();
    const url = URL.createObjectURL(new Blob([mergedBytes], { type: 'application/pdf' }));
    setResultUrl(url);
    setIsProcessing(false);
  };

  // Split PDF by page range (e.g., 1-2,4)
  const handleSplit = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const file = files[0];
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const ranges = splitRange.split(',').map(r => r.trim());
    const urls: { url: string; name: string }[] = [];
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      let [start, end] = range.split('-').map(Number);
      if (!end) end = start;
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
    setIsProcessing(false);
  };

  // Basic compression: remove metadata, use save() with default options
  const handleCompress = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    const file = files[0];
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    pdf.setTitle('');
    pdf.setAuthor('');
    pdf.setSubject('');
    pdf.setKeywords([]);
    const compressedBytes = await pdf.save();
    const url = URL.createObjectURL(new Blob([compressedBytes], { type: 'application/pdf' }));
    setResultUrl(url);
    setIsProcessing(false);
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
    <div className="container-app grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Header Ad */}
      <div className="md:col-span-12">
        <AdSlot slot="header" className="mb-4" />
      </div>
      {/* Sidebar Ad */}
      <div className="hidden md:block md:col-span-3">
        <AdSlot slot="sidebar" className="sticky top-6" />
      </div>
      {/* Main Content */}
      <div className="md:col-span-6">
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 shadow-md mb-6">
          <h1 className="text-2xl font-bold mb-4">PDF Utilities</h1>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors mb-4">
            <input {...getInputProps()} />
            <span className="text-gray-500">Drag & drop PDF files here, or click to select (batch supported for merge)</span>
          </div>
          {files.length > 0 && (
            <>
              <div className="mb-4 flex gap-2 flex-wrap">
                <button className="btn btn-primary" onClick={handleMerge} disabled={isProcessing || files.length < 2}>
                  {isProcessing ? 'Processing...' : 'Merge PDFs'}
                </button>
                <button className="btn btn-secondary" onClick={handleSplit} disabled={isProcessing || files.length !== 1}>
                  Split PDF
                </button>
                <input
                  type="text"
                  className="p-1 border rounded w-32"
                  value={splitRange}
                  onChange={e => setSplitRange(e.target.value)}
                  placeholder="1-2,4"
                  disabled={files.length !== 1}
                  title="Page ranges (e.g., 1-2,4)"
                />
                <button className="btn btn-secondary" onClick={handleCompress} disabled={isProcessing || files.length !== 1}>
                  Compress PDF
                </button>
              </div>
              <div className="mb-4">
                <ul className="text-xs text-gray-600 dark:text-gray-300">
                  {previews.map(name => <li key={name}>{name}</li>)}
                </ul>
              </div>
              {resultUrl && (
                <a href={resultUrl} download="result.pdf" className="btn btn-primary block mb-2">Download Result PDF</a>
              )}
              {splitUrls.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    {splitUrls.map(s => (
                      <a key={s.url} href={s.url} download={s.name} className="btn btn-secondary block">{s.name}</a>
                    ))}
                  </div>
                  <button className="btn btn-primary w-full" onClick={handleDownloadAllSplits}>Download All as ZIP</button>
                </>
              )}
            </>
          )}
        </div>
        {/* Between tools ad */}
        <AdSlot slot="native" className="my-6" />
      </div>
      {/* Sidebar Ad (mobile) */}
      <div className="md:hidden col-span-12">
        <AdSlot slot="mobile" />
      </div>
      {/* Footer Ad */}
      <div className="md:col-span-12">
        <AdSlot slot="footer" className="mt-4" />
      </div>
    </div>
  );
};

export default PDFUtilities; 