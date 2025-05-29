import React, { useState, useRef } from 'react';
import { REDACTION_PATTERNS } from './RedactionPatterns';
import { detectSensitiveData } from './PDFRedactionEngine';
import { extractTextFromPDF, applyRedactionsToPDF } from './PDFProcessor';
import DonationHandler from './DonationHandler';

// Extend RedactionMatch locally to include pageIndex for this tool's state
export type RedactionMatchWithPage = {
  type: string;
  value: string;
  index: number;
  length: number;
  color: string;
  pageIndex: number;
};

const MAX_FILE_SIZE_MB = 50;

const PDFRedactionTool: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]); // Data URLs for thumbnails
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<RedactionMatchWithPage[][]>([]); // Per file
  const [redactedBlobs, setRedactedBlobs] = useState<Blob[]>([]);
  const [showDonation, setShowDonation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    setError(null);
    const validFiles = Array.from(fileList).filter(f => f.type === 'application/pdf' && f.size <= MAX_FILE_SIZE_MB * 1024 * 1024);
    if (validFiles.length === 0) {
      setError('Please upload valid PDF files (max 50MB each).');
      return;
    }
    setFiles(validFiles);
    // Generate previews (first page thumbnail)
    const urls: string[] = [];
    for (const file of validFiles) {
      const data = new Uint8Array(await file.arrayBuffer());
      // @ts-ignore
      const pdf = await window.pdfjsLib.getDocument({ data }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;
      urls.push(canvas.toDataURL());
    }
    setPreviews(urls);
  };

  // Run detection on all files
  const handleDetect = async () => {
    setProcessing(true);
    setError(null);
    const allDetections: RedactionMatchWithPage[][] = [];
    for (const file of files) {
      const data = new Uint8Array(await file.arrayBuffer());
      const { pages } = await extractTextFromPDF(data);
      const fileDetections: RedactionMatchWithPage[] = [];
      for (const page of pages) {
        const matches = detectSensitiveData(page.text, REDACTION_PATTERNS);
        fileDetections.push(...matches.map(m => ({ ...m, pageIndex: page.pageIndex })));
      }
      allDetections.push(fileDetections);
    }
    setDetections(allDetections);
    setProcessing(false);
  };

  // Redact and download all
  const handleRedactAndDownload = async () => {
    setProcessing(true);
    setError(null);
    const blobs: Blob[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const data = new Uint8Array(await file.arrayBuffer());
      // For demo: stub redactions (real mapping needed)
      const redactions = detections[i]?.map(d => ({ pageIndex: d.pageIndex, rect: { x: 100, y: 100, w: 200, h: 20 } })) || [];
      const redactedBytes = await applyRedactionsToPDF(data, redactions);
      blobs.push(new Blob([redactedBytes], { type: 'application/pdf' }));
    }
    setRedactedBlobs(blobs);
    setProcessing(false);
    setShowDonation(true);
  };

  // Download helpers
  const downloadBlob = (blob: Blob, name: string) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
  };

  // UI
  return (
    <div className="flex flex-col gap-8">
      {/* 1. File Upload */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-2">Step 1: Upload PDF(s)</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <button className="dropzone border-2 border-dashed border-blue-400 rounded-lg px-6 py-4 bg-blue-50 hover:bg-blue-100 transition" onClick={() => fileInputRef.current?.click()}>
            <span className="font-semibold">Click or drag PDF files here</span>
          </button>
          <input ref={fileInputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          {error && <span className="text-red-600 ml-4">{error}</span>}
        </div>
        {previews.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {previews.map((url, i) => (
              <img key={i} src={url} alt={`PDF preview ${i + 1}`} className="w-24 h-32 object-contain border rounded shadow" />
            ))}
          </div>
        )}
      </section>

      {/* 2. Detection Settings (stub for custom patterns) */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-2">Step 2: Detection Settings</h2>
        <div className="text-gray-600">Patterns detected: SSN, Credit Card, Email, Phone, IP Address. (Custom patterns coming soon!)</div>
      </section>

      {/* 3. Detection & Preview */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-2">Step 3: Detect & Preview</h2>
        <button className="bg-blue-600 text-white rounded px-4 py-2 font-semibold" onClick={handleDetect} disabled={processing || files.length === 0}>
          {processing ? 'Detecting...' : 'Detect Sensitive Data'}
        </button>
        {detections.length > 0 && (
          <div className="mt-4">
            {detections.map((fileDetections, i) => (
              <div key={i} className="mb-4">
                <div className="font-semibold mb-1">{files[i]?.name} - {fileDetections.length} items detected</div>
                <ul className="text-xs text-gray-700">
                  {fileDetections.map((d, j) => (
                    <li key={j} style={{ color: d.color }}>{d.type}: {d.value} (Page {d.pageIndex + 1})</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Redact & Download */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-2">Step 4: Redact & Download</h2>
        <button className="bg-red-600 text-white rounded px-4 py-2 font-semibold" onClick={handleRedactAndDownload} disabled={processing || detections.length === 0}>
          {processing ? 'Processing...' : 'Redact & Download All'}
        </button>
        {redactedBlobs.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {redactedBlobs.map((blob, i) => (
              <button key={i} className="bg-green-600 text-white rounded px-3 py-1" onClick={() => downloadBlob(blob, files[i].name.replace(/\.pdf$/i, '_redacted.pdf'))}>
                Download {files[i].name.replace(/\.pdf$/i, '_redacted.pdf')}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 5. Donation */}
      {showDonation && <DonationHandler />}
    </div>
  );
};

export default PDFRedactionTool; 