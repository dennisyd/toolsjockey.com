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

const DOWNSCALE_OPTIONS = [
  { label: '1920 x 1080', width: 1920, height: 1080 },
  { label: '1280 x 720', width: 1280, height: 720 },
  { label: '800 x 600', width: 800, height: 600 },
  { label: '640 x 480', width: 640, height: 480 },
  { label: '320 x 240', width: 320, height: 240 },
  // ...add more if needed
];

const ImageDownscaler: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [downscaledUrl, setDownscaledUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>('original');
  const [quality, setQuality] = useState<number>(80);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(null);
  const [downscaledSize, setDownscaledSize] = useState<number | null>(null);
  const [downscaleMode, setDownscaleMode] = useState<'dimensions' | 'filesize'>('dimensions');
  const [selectedSize, setSelectedSize] = useState<{ width: number; height: number }>(DOWNSCALE_OPTIONS[0]);
  const [customWidth, setCustomWidth] = useState<number>(1920);
  const [customHeight, setCustomHeight] = useState<number>(1080);
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [targetFileSizeMB, setTargetFileSizeMB] = useState<number>(1);
  const [fileSizeDownscaleError, setFileSizeDownscaleError] = useState<string | null>(null);
  const [downscaledDims, setDownscaledDims] = useState<{ width: number; height: number } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const availableFormats = formats.filter(f => f.value === 'original' || isFormatSupported(f.value));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setOriginalUrl(url);
    setDownscaledUrl(null);
    setOriginalSize({ width: 0, height: 0 }); // Initialize with 0, will be updated by img.onload
    setDownscaledSize(null);
    setDownscaledDims(null);
  };

  // Utility: Downscale to dimensions
  function downscaleToSize(img: HTMLImageElement, targetWidth: number, targetHeight: number, format: string, quality: number): Promise<{ url: string, width: number, height: number, size: number }> {
    return new Promise(resolve => {
      const scale = Math.min(targetWidth / img.width, targetHeight / img.height, 1); // never upscale
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob!);
        resolve({ url, width, height, size: blob!.size });
      }, format, quality);
    });
  }

  // Utility: Downscale to target file size (MB)
  async function downscaleToTargetFileSize(img: HTMLImageElement, minWidth: number, minHeight: number, targetMB: number, format: string = 'image/jpeg', quality: number = 0.92): Promise<{ url: string, width: number, height: number, size: number } | null> {
    let scale = Math.min(minWidth / img.width, minHeight / img.height, 1);
    let width = Math.round(img.width * scale);
    let height = Math.round(img.height * scale);
    let lastGood: { url: string, width: number, height: number, size: number } | null = null;
    for (let i = 0; i < 20; i++) {
      if (width < 80 || height < 80) break;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Failed to create blob')), format, quality);
      });
      const sizeMB = blob.size / (1024 * 1024);
      const url = URL.createObjectURL(blob);
      if (sizeMB < targetMB) {
        break;
      }
      lastGood = { url, width, height, size: blob.size };
      // Decrease scale for next iteration
      scale *= 0.85;
      width = Math.round(img.width * scale);
      height = Math.round(img.height * scale);
    }
    return lastGood;
  }

  const handleDownscale = async () => {
    if (!file || !originalUrl) return;
    setIsProcessing(true);
    setFileSizeDownscaleError(null);
    setDownscaledSize(null);
    setDownscaledDims(null);
    const img = new window.Image();
    img.onload = async () => {
      let result;
      if (downscaleMode === 'filesize') {
        const minW = useCustomSize ? customWidth : selectedSize.width;
        const minH = useCustomSize ? customHeight : selectedSize.height;
        result = await downscaleToTargetFileSize(img, minW, minH, targetFileSizeMB, outputFormat === 'original' ? file.type : outputFormat, quality / 100);
        if (!result) {
          setFileSizeDownscaleError('Could not reach target file size within min dimensions.');
          setIsProcessing(false);
          return;
        }
      } else {
        const w = useCustomSize ? customWidth : selectedSize.width;
        const h = useCustomSize ? customHeight : selectedSize.height;
        result = await downscaleToSize(img, w, h, outputFormat === 'original' ? file.type : outputFormat, quality / 100);
      }
      setDownscaledUrl(result.url);
      setDownscaledDims({ width: result.width, height: result.height });
      setDownscaledSize(result.size);
      setIsProcessing(false);
    };
    img.src = originalUrl!;
  };

  // Filter downscale options to only those smaller than the original image
  const filteredOptions = originalSize
    ? DOWNSCALE_OPTIONS.filter(
        opt => opt.width < originalSize.width && opt.height < originalSize.height
      )
    : DOWNSCALE_OPTIONS;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Image Downscaler</h2>
      <input type="file" accept="image/*" onChange={handleFile} />
      {originalUrl && (
        <div className="flex flex-col md:flex-row gap-8 mt-4">
          <div>
            <div className="mb-2 font-medium">Original</div>
            <img ref={imgRef} src={originalUrl} alt="Original" className="max-w-xs max-h-64 rounded border" />
            {originalSize && (
              <div className="text-xs text-gray-500 mt-1">Size: {(originalSize.width * originalSize.height / 1024).toFixed(2)} KB</div>
            )}
          </div>
          <div>
            <div className="mb-2 font-medium">Downscale Options</div>
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
            <div className="flex gap-2 mb-2">
              <button
                className={`px-3 py-1 rounded border ${downscaleMode === 'dimensions' ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                onClick={() => setDownscaleMode('dimensions')}
              >
                Downscale by Dimensions
              </button>
              <button
                className={`px-3 py-1 rounded border ${downscaleMode === 'filesize' ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                onClick={() => setDownscaleMode('filesize')}
              >
                Downscale by File Size
              </button>
            </div>
            {downscaleMode === 'dimensions' && (
              <>
                <label className="block text-sm font-medium mb-2">Downscale To:</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {filteredOptions.map(size => (
                    <button
                      key={size.label}
                      type="button"
                      className={`px-3 py-1 rounded border ${!useCustomSize && selectedSize.width === size.width && selectedSize.height === size.height ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                      onClick={() => { setUseCustomSize(false); setSelectedSize(size); }}
                    >
                      {size.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`px-3 py-1 rounded border ${useCustomSize ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                    onClick={() => setUseCustomSize(true)}
                  >
                    Custom
                  </button>
                </div>
                {useCustomSize && (
                  <div className="flex gap-2 mb-2">
                    <input
                      type="number"
                      min={1}
                      value={customWidth}
                      onChange={e => setCustomWidth(Number(e.target.value))}
                      className="w-24 px-2 py-1 border rounded"
                      placeholder="Width"
                    />
                    <span className="self-center">×</span>
                    <input
                      type="number"
                      min={1}
                      value={customHeight}
                      onChange={e => setCustomHeight(Number(e.target.value))}
                      className="w-24 px-2 py-1 border rounded"
                      placeholder="Height"
                    />
                  </div>
                )}
                <div className="mt-2">
                  <button
                    onClick={handleDownscale}
                    disabled={isProcessing}
                    className="btn btn-primary w-full"
                  >
                    {isProcessing ? 'Processing...' : `Downscale to ${useCustomSize ? `${customWidth}×${customHeight}` : `${selectedSize.width}×${selectedSize.height}`}`}
                  </button>
                </div>
              </>
            )}
            {downscaleMode === 'filesize' && (
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Target File Size (MB)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={targetFileSizeMB}
                  onChange={e => setTargetFileSizeMB(Number(e.target.value))}
                  className="w-32 px-2 py-1 border rounded"
                />
                <div className="mt-2">
                  <button
                    onClick={handleDownscale}
                    disabled={isProcessing}
                    className="btn btn-primary w-full"
                  >
                    {isProcessing ? 'Processing...' : `Downscale to ~${targetFileSizeMB} MB`}
                  </button>
                </div>
                {fileSizeDownscaleError && (
                  <div className="text-red-600 mt-2">{fileSizeDownscaleError}</div>
                )}
              </div>
            )}
          </div>
          {downscaledUrl && (
            <div>
              <div className="mb-2 font-medium">Downscaled</div>
              <img src={downscaledUrl} alt="Downscaled" className="max-w-xs max-h-64 rounded border" />
              {downscaledDims && (
                <div className="text-sm text-gray-500 mt-1">
                  Resolution: {downscaledDims.width} × {downscaledDims.height}
                  {downscaledSize != null && (
                    <> &nbsp;|&nbsp; File Size: {(downscaledSize / 1024 / 1024).toFixed(2)} MB</>
                  )}
                </div>
              )}
              <div className="mt-2">
                <a href={downscaledUrl} download={`downscaled.${outputFormat === 'original' ? (file?.type.split('/')[1] || 'jpg') : outputFormat.split('/')[1]}`} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Download</a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageDownscaler; 