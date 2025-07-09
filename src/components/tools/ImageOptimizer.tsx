import React, { useRef, useState } from 'react';

const formats = [
  { label: 'Keep Original', value: 'original' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'PNG', value: 'image/png' },
  { label: 'WebP', value: 'image/webp' },
  { label: 'AVIF', value: 'image/avif' },
];

function isFormatSupported(type: string) {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL(type).indexOf(`data:${type}`) === 0;
}

const ImageOptimizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [optimizedUrl, setOptimizedUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('original');
  const [quality, setQuality] = useState<number>(80);
  const [stripMetadata, setStripMetadata] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Filter formats for browser support
  const availableFormats = formats.filter(f => f.value === 'original' || isFormatSupported(f.value));

  // Handle file upload
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setOriginalUrl(url);
    setOptimizedUrl(null);
    setOriginalSize(f.size);
    setOptimizedSize(null);
  };

  // Optimize image
  const handleOptimize = () => {
    if (!file || !originalUrl) return;
    setIsProcessing(true);
    const img = new window.Image();
    img.onload = () => {
      // Dimension check
      if (img.width < 80 || img.height < 80 || img.width > 10000 || img.height > 10000) {
        alert('Image dimensions must be between 80x80 and 10000x10000 pixels.');
        setIsProcessing(false);
        return;
      }
      // Draw to canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      // Choose output format
      let type = outputFormat === 'original' ? file.type : outputFormat;
      if (type === 'original') type = file.type;
      // Quality only for lossy
      const opts: any = {};
      if (type === 'image/jpeg' || type === 'image/webp' || type === 'image/avif') {
        opts.quality = quality / 100;
      }
      // toBlob strips most metadata; toDataURL does too
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setOptimizedUrl(url);
          setOptimizedSize(blob.size);
        }
        setIsProcessing(false);
      }, type, opts.quality);
    };
    img.src = originalUrl;
  };

  // Download optimized image
  const handleDownload = () => {
    if (!optimizedUrl) return;
    const a = document.createElement('a');
    a.href = optimizedUrl;
    a.download = `optimized.${outputFormat === 'original' ? (file?.type.split('/')[1] || 'jpg') : outputFormat.split('/')[1]}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Image Optimizer</h2>
      <input type="file" accept="image/*" onChange={handleFile} />
      {originalUrl && (
        <div className="flex flex-col md:flex-row gap-8 mt-4">
          <div>
            <div className="mb-2 font-medium">Original</div>
            <img ref={imgRef} src={originalUrl} alt="Original" className="max-w-xs max-h-64 rounded border" />
            {originalSize && (
              <div className="text-xs text-gray-500 mt-1">Size: {(originalSize / 1024).toFixed(2)} KB</div>
            )}
          </div>
          <div>
            <div className="mb-2 font-medium">Optimization Options</div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Output Format</label>
              <select
                className="px-2 py-1 border rounded"
                value={outputFormat}
                onChange={e => setOutputFormat(e.target.value)}
              >
                {availableFormats.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            {(outputFormat === 'image/jpeg' || outputFormat === 'image/webp' || outputFormat === 'image/avif') && (
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Quality: {quality}</label>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={e => setQuality(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
            <div className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="strip-metadata"
                checked={stripMetadata}
                onChange={e => setStripMetadata(e.target.checked)}
                disabled
              />
              <label htmlFor="strip-metadata" className="text-sm">Strip Metadata (always enabled for browser)</label>
            </div>
            <button
              onClick={handleOptimize}
              disabled={isProcessing}
              className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark mt-2"
            >
              {isProcessing ? 'Optimizing...' : 'Optimize Image'}
            </button>
          </div>
          {optimizedUrl && (
            <div>
              <div className="mb-2 font-medium">Optimized</div>
              <img src={optimizedUrl} alt="Optimized" className="max-w-xs max-h-64 rounded border" />
              {optimizedSize && (
                <div className="text-xs text-gray-500 mt-1">Size: {(optimizedSize / 1024).toFixed(2)} KB</div>
              )}
              <div className="mt-2">
                <button onClick={handleDownload} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Download</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageOptimizer; 