import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';

const SUPPORTED_TYPES = ['jpg', 'jpeg', 'png', 'webp'];
const OUTPUT_FORMATS = [
  { value: 'jpeg', label: 'JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WEBP' },
];

const ImageFormatConverter = () => {
  // State
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [converted, setConverted] = useState<{ url: string; name: string }[]>([]);
  const [outputFormat, setOutputFormat] = useState('jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // File upload logic (batch)
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    multiple: true,
    onDrop: (acceptedFiles) => {
      setError(null);
      setFiles(acceptedFiles);
      setPreviews(acceptedFiles.map(f => URL.createObjectURL(f)));
      setConverted([]);
      setSelected(new Set());
    }
  });

  // Convert a single image to the selected format
  const convertImage = (file: File): Promise<{ url: string; name: string }> => {
    return new Promise((resolve, reject) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !SUPPORTED_TYPES.includes(ext)) {
        reject('Unsupported file type.');
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = canvasRef.current!;
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          let mime = 'image/jpeg';
          let extOut = 'jpg';
          if (outputFormat === 'png') { mime = 'image/png'; extOut = 'png'; }
          if (outputFormat === 'webp') { mime = 'image/webp'; extOut = 'webp'; }
          const url = canvas.toDataURL(mime, 0.95);
          const name = file.name.replace(/\.[^.]+$/, '') + '.' + extOut;
          resolve({ url, name });
        };
        img.onerror = () => reject('Failed to load image.');
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject('Failed to read file.');
      reader.readAsDataURL(file);
    });
  };

  // Batch convert all files
  const handleConvert = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const results: { url: string; name: string }[] = [];
      for (const file of files) {
        // eslint-disable-next-line no-await-in-loop
        const result = await convertImage(file);
        results.push(result);
      }
      setConverted(results);
      setSelected(new Set(results.map((_, i) => i))); // Select all by default
    } catch (e: any) {
      setError(e.message || 'Failed to convert images.');
    }
    setIsProcessing(false);
  };

  // Download single converted image
  const handleDownload = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download selected as ZIP
  const handleDownloadZip = async () => {
    const zip = new JSZip();
    Array.from(selected).forEach(i => {
      const { url, name } = converted[i];
      zip.file(name, fetch(url).then(r => r.arrayBuffer()));
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'converted-images.zip';
    link.click();
  };

  // Toggle selection for ZIP
  const toggleSelect = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* File upload */}
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors">
        <input {...getInputProps()} />
        {files.length === 0 ? (
          <div>
            <p className="font-semibold">Drag & drop JPG, PNG, or WEBP images here, or click to select (batch supported)</p>
            <p className="text-sm text-gray-500 mt-1">Supported: JPG, PNG, WEBP</p>
          </div>
        ) : (
          <div>
            <p className="mb-2">Selected: <b>{files.map(f => f.name).join(', ')}</b></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previews.map((url, i) => (
                <div key={url} className="flex flex-col items-center">
                  <span className="text-xs mb-1">Original</span>
                  <img src={url} alt={`Original ${i}`} className="max-h-40 rounded shadow" />
                  <span className="text-xs text-gray-500">{files[i].name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Output format selection */}
      {files.length > 0 && (
        <div className="flex gap-4 items-center">
          <label className="font-semibold">Convert to:</label>
          <select value={outputFormat} onChange={e => setOutputFormat(e.target.value)} className="p-2 border rounded">
            {OUTPUT_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <button className="btn btn-primary" onClick={handleConvert} disabled={isProcessing}>
            {isProcessing ? 'Converting...' : 'Convert'}
          </button>
        </div>
      )}
      {/* Error */}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {/* Converted images preview and download */}
      {converted.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Converted Images</h3>
          <div className="flex gap-4 mb-2 flex-wrap">
            <button className="btn btn-secondary" onClick={() => setSelected(new Set(converted.map((_, i) => i)))}>Select All</button>
            <button className="btn btn-secondary" onClick={() => setSelected(new Set())}>Deselect All</button>
            <button className="btn btn-primary" onClick={handleDownloadZip} disabled={selected.size === 0}>Download Selected as ZIP</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {converted.map(({ url, name }, i) => (
              <div key={url} className="flex flex-col items-center gap-2 border rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={selected.has(i)} onChange={() => toggleSelect(i)} />
                  <span className="text-xs">Select</span>
                </div>
                <img src={url} alt={`Converted ${i}`} className="max-h-40 rounded shadow border-2 border-blue-400" />
                <span className="text-xs text-gray-500">{name}</span>
                <button className="btn btn-secondary w-full" onClick={() => handleDownload(url, name)}>
                  Download</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ImageFormatConverter; 