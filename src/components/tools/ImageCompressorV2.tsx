import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import AdSlot from '../ads/AdSlot';

const FORMATS = [
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
];

const DEFAULT_QUALITY = 0.8;

const ImageCompressorV2 = () => {
  
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [compressed, setCompressed] = useState<{ url: string; size: number; name: string }[]>([]);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [format, setFormat] = useState('jpeg');
  const [isProcessing, setIsProcessing] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: true,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      setPreviews(acceptedFiles.map(f => URL.createObjectURL(f)));
      setCompressed([]);
    },
  });

  const compressAll = async () => {
    setIsProcessing(true);
    const results: { url: string; size: number; name: string }[] = [];
    for (const file of files) {
      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: quality,
        fileType: format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp',
      };
      const output = await imageCompression(file, options);
      const url = URL.createObjectURL(output);
      results.push({ url, size: output.size, name: file.name.replace(/\.[^.]+$/, '') + '.' + format });
    }
    setCompressed(results);
    setIsProcessing(false);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    for (const img of compressed) {
      const res = await fetch(img.url);
      const blob = await res.blob();
      zip.file(img.name, blob);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'compressed-images.zip';
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
          <h1 className="text-2xl font-bold mb-4">Image Compressor</h1>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors mb-4">
            <input {...getInputProps()} />
            <span className="text-gray-500">Drag & drop images here, or click to select (batch supported)</span>
          </div>
          {files.length > 0 && (
            <>
              <div className="flex gap-4 mb-4">
                <div>
                  <label className="block text-xs mb-1">Quality: {Math.round(quality * 100)}%</label>
                  <input type="range" min={0.1} max={1} step={0.01} value={quality} onChange={e => setQuality(Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-xs mb-1">Format</label>
                  <select value={format} onChange={e => setFormat(e.target.value)} className="p-1 border rounded">
                    {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <button className="btn btn-primary mt-4" onClick={compressAll} disabled={isProcessing}>
                  {isProcessing ? 'Compressing...' : 'Compress All'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file, i) => (
                  <div key={file.name} className="bg-gray-50 dark:bg-primary rounded p-3 shadow">
                    <div className="mb-2 font-medium text-sm">{file.name}</div>
                    <div className="flex gap-2">
                      <div>
                        <div className="text-xs text-gray-500">Original</div>
                        <img src={previews[i]} alt="original" className="max-h-32 rounded mb-1" />
                        <div className="text-xs">{(file.size / 1024).toFixed(1)} KB</div>
                      </div>
                      {compressed[i] && (
                        <div>
                          <div className="text-xs text-gray-500">Compressed</div>
                          <img src={compressed[i].url} alt="compressed" className="max-h-32 rounded mb-1" />
                          <div className="text-xs">{(compressed[i].size / 1024).toFixed(1)} KB</div>
                          <div className="text-xs text-green-600 font-semibold">
                            -{Math.round((1 - compressed[i].size / file.size) * 100)}%
                          </div>
                          <a href={compressed[i].url} download={compressed[i].name} className="btn btn-secondary mt-1 block text-center">Download</a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {compressed.length === files.length && (
                <button className="btn btn-primary mt-6 w-full" onClick={handleDownloadAll}>Download All as ZIP</button>
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

export default ImageCompressorV2; 