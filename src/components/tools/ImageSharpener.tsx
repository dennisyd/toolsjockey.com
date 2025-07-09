import { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import AdSlot from '../ads/AdSlot';

// Utility: Upscale image using canvas
function upscaleImage(img: HTMLImageElement, scale: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

const presetSizes = [
  { label: '2400 × 1800', width: 2400, height: 1800 },
  { label: '1920 × 1080', width: 1920, height: 1080 },
  { label: '1024 × 1024', width: 1024, height: 1024 },
  { label: '800 × 800', width: 800, height: 800 },
];

const ImageSharpenerUpscaler = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sharpnessLevel, setSharpnessLevel] = useState<number>(50);
  const [sharpened, setSharpened] = useState<string | null>(null);
  const [upscaled, setUpscaled] = useState<string | null>(null);
  const [upscaledDims, setUpscaledDims] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mode, setMode] = useState<'sharpen' | 'upscale'>('sharpen');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [selectedSize, setSelectedSize] = useState<{ width: number; height: number }>(presetSizes[0]);
  const [customWidth, setCustomWidth] = useState(2400);
  const [customHeight, setCustomHeight] = useState(1800);
  const [upscaleMode, setUpscaleMode] = useState<'dimensions' | 'filesize'>('dimensions');
  const [targetFileSizeMB, setTargetFileSizeMB] = useState<number>(15);
  const [fileSizeUpscaleError, setFileSizeUpscaleError] = useState<string | null>(null);
  const [optimizedSize, setOptimizedSize] = useState<number | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setSharpened(null);
      setUpscaled(null);
    }
  });

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (preview && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
      };
      img.src = preview;
    }
  }, [preview]);

  // Sharpening logic (same as before)
  const applySharpening = () => {
    if (!canvasRef.current || !preview) return;
    setIsProcessing(true);
    setTimeout(() => {
      const canvas = canvasRef.current!;
      const resultCanvas = resultCanvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const resultCtx = resultCanvas.getContext('2d')!;
      resultCanvas.width = canvas.width;
      resultCanvas.height = canvas.height;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const resultImageData = new ImageData(
        new Uint8ClampedArray(data),
        canvas.width,
        canvas.height
      );
      const resultData = resultImageData.data;
      const strength = sharpnessLevel / 100 * 1.5;
      for (let y = 1; y < canvas.height - 1; y++) {
        for (let x = 1; x < canvas.width - 1; x++) {
          const centerIdx = (y * canvas.width + x) * 4;
          for (let c = 0; c < 3; c++) {
            const centerValue = data[centerIdx + c];
            const laplacian = 
              -data[((y - 1) * canvas.width + x) * 4 + c]
              -data[(y * canvas.width + (x - 1)) * 4 + c]
              + 4 * centerValue
              -data[(y * canvas.width + (x + 1)) * 4 + c]
              -data[((y + 1) * canvas.width + x) * 4 + c];
            resultData[centerIdx + c] = Math.max(0, Math.min(255, centerValue + laplacian * strength));
          }
        }
      }
      resultCtx.putImageData(resultImageData, 0, 0);
      setSharpened(resultCanvas.toDataURL('image/jpeg'));
      setIsProcessing(false);
    }, 100);
  };

  // Utility: Upscale image so both dimensions are at least the requested size, no cropping
  function upscaleToMinSize(img: HTMLImageElement, minWidth: number, minHeight: number): { url: string, width: number, height: number } {
    const scale = Math.max(minWidth / img.width, minHeight / img.height);
    const outWidth = Math.round(img.width * scale);
    const outHeight = Math.round(img.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, outWidth, outHeight);
    return { url: canvas.toDataURL('image/png'), width: outWidth, height: outHeight };
  }

  // Utility: Upscale to target file size (MB), no cropping, preserve aspect ratio
  async function upscaleToTargetFileSize(img: HTMLImageElement, minWidth: number, minHeight: number, targetMB: number, format: string = 'image/jpeg', quality: number = 0.92): Promise<{ url: string, width: number, height: number, size: number } | null> {
    let scale = Math.max(minWidth / img.width, minHeight / img.height);
    let width = Math.round(img.width * scale);
    let height = Math.round(img.height * scale);
    let lastGood: { url: string, width: number, height: number, size: number } | null = null;
    const maxDim = 10000;
    for (let i = 0; i < 20; i++) {
      if (width > maxDim || height > maxDim) break;
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
      if (sizeMB > targetMB) {
        break;
      }
      lastGood = { url, width, height, size: blob.size };
      // Increase scale for next iteration
      scale *= 1.15;
      width = Math.round(img.width * scale);
      height = Math.round(img.height * scale);
    }
    return lastGood;
  }

  // Upscaling logic
  const applyUpscaling = async () => {
    if (!preview) return;
    setIsProcessing(true);
    setFileSizeUpscaleError(null);
    setOptimizedSize(null);
    const img = new window.Image();
    img.onload = async () => {
      let upscaledUrl: string;
      let width: number;
      let height: number;
      let size: number | undefined;
      if (upscaleMode === 'filesize') {
        // Use JPEG for best compression, quality 0.92
        const minW = useCustomSize ? customWidth : selectedSize.width;
        const minH = useCustomSize ? customHeight : selectedSize.height;
        const result = await upscaleToTargetFileSize(img, minW, minH, targetFileSizeMB, 'image/jpeg', 0.92);
        if (!result) {
          setFileSizeUpscaleError('Could not reach target file size within max dimensions.');
          setIsProcessing(false);
          return;
        }
        upscaledUrl = result.url;
        width = result.width;
        height = result.height;
        size = result.size;
      } else if (useCustomSize || selectedSize) {
        const w = useCustomSize ? customWidth : selectedSize.width;
        const h = useCustomSize ? customHeight : selectedSize.height;
        const result = upscaleToMinSize(img, w, h);
        upscaledUrl = result.url;
        width = result.width;
        height = result.height;
        // Calculate file size for this mode as well
        const blob: Blob = await new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(b => b ? resolve(b) : reject(new Error('Failed to create blob')), 'image/jpeg', 0.92);
        });
        size = blob.size;
      } else {
        upscaledUrl = upscaleImage(img, 2); // Default upscale factor
        width = img.width * 2;
        height = img.height * 2;
        // Calculate file size for this mode as well
        const blob: Blob = await new Promise((resolve, reject) => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(b => b ? resolve(b) : reject(new Error('Failed to create blob')), 'image/jpeg', 0.92);
        });
        size = blob.size;
      }
      setUpscaled(upscaledUrl);
      setUpscaledDims({ width, height });
      if (size) setOptimizedSize(size);
      setIsProcessing(false);
    };
    img.src = preview;
  };

  const handleDownload = (type: 'sharpen' | 'upscale') => {
    const url = type === 'sharpen' ? sharpened : upscaled;
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-${image?.name || 'image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-app grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Header Ad */}
      <div className="md:col-span-12">
        <AdSlot slot="header" className="mb-4" />
      </div>
      
      {/* Sidebar Ad */}
      <div className="hidden md:block md:col-span-3 md:order-3">
        <AdSlot slot="sidebar" className="sticky top-6" />
      </div>
      
      {/* Main Content */}
      <div className="md:col-span-9 md:order-2">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Image Sharpener & Upscaler</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            <b>What is the difference?</b><br />
            <b>Sharpening</b> enhances the clarity and details of your image by increasing edge contrast, making it look crisper.<br />
            <b>Upscaling</b> increases the resolution (pixel dimensions) of your image, making it larger and suitable for high-DPI displays or printing. Upscaling does not add new details, but can make images less pixelated when enlarged.<br />
            <span className="text-xs text-yellow-700 bg-yellow-100 rounded p-1 inline-block mt-2">Tip: For best results, upscale first, then sharpen the upscaled image.</span>
          </p>
        </div>
        
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 shadow-md">
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors">
            <input {...getInputProps()} />
            {!preview ? (
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2">Drag & drop an image here, or click to select</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Supports JPG, PNG, WEBP</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-2">Drop a new image to replace the current one</p>
                <div className="relative max-w-md mx-auto">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-h-64 max-w-full mx-auto rounded"
                  />
                </div>
              </div>
            )}
          </div>
          
          {preview && (
            <div className="mt-6">
              <div className="flex gap-4 mb-4">
                <button className={`btn ${mode === 'sharpen' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('sharpen')}>Sharpen</button>
                <button className={`btn ${mode === 'upscale' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('upscale')}>Upscale</button>
              </div>
              {mode === 'sharpen' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sharpness Level: {sharpnessLevel}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sharpnessLevel}
                    onChange={(e) => setSharpnessLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="mt-4">
                    <button
                      onClick={applySharpening}
                      disabled={isProcessing}
                      className="btn btn-primary w-full"
                    >
                      {isProcessing ? 'Processing...' : 'Apply Sharpening'}
                    </button>
                  </div>
                </div>
              )}
              {mode === 'upscale' && (
                <div>
                  <div className="flex gap-2 mb-2">
                    <button
                      className={`px-3 py-1 rounded border ${upscaleMode === 'dimensions' ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                      onClick={() => setUpscaleMode('dimensions')}
                    >
                      Upscale by Dimensions
                    </button>
                    <button
                      className={`px-3 py-1 rounded border ${upscaleMode === 'filesize' ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
                      onClick={() => setUpscaleMode('filesize')}
                    >
                      Upscale by File Size
                    </button>
                  </div>
                  {upscaleMode === 'dimensions' && (
                    <>
                      <label className="block text-sm font-medium mb-2">Upscale To:</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {presetSizes.map(size => (
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
                          onClick={applyUpscaling}
                          disabled={isProcessing}
                          className="btn btn-primary w-full"
                        >
                          {isProcessing ? 'Processing...' : `Upscale to ${useCustomSize ? `${customWidth}×${customHeight}` : `${selectedSize.width}×${selectedSize.height}`}`}
                        </button>
                      </div>
                    </>
                  )}
                  {upscaleMode === 'filesize' && (
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
                          onClick={applyUpscaling}
                          disabled={isProcessing}
                          className="btn btn-primary w-full"
                        >
                          {isProcessing ? 'Processing...' : `Upscale to ~${targetFileSizeMB} MB`}
                        </button>
                      </div>
                      {fileSizeUpscaleError && (
                        <div className="text-red-600 mt-2">{fileSizeUpscaleError}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Results */}
          {mode === 'sharpen' && sharpened && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Sharpened Result</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Original</p>
                  <img src={preview!} alt="Original" className="w-full rounded" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Sharpened</p>
                  <img src={sharpened} alt="Sharpened" className="w-full rounded" />
                </div>
              </div>
              <div className="mt-4">
                <button onClick={() => handleDownload('sharpen')} className="btn btn-primary w-full">
                  Download Sharpened Image
                </button>
              </div>
            </div>
          )}
          
          {mode === 'upscale' && upscaled && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Upscaled Result</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Original</p>
                  <img src={preview!} alt="Original" className="w-full rounded" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">
                    Upscaled ({upscaledDims ? `${upscaledDims.width}×${upscaledDims.height}` : useCustomSize ? `${customWidth}×${customHeight}` : `${selectedSize.width}×${selectedSize.height}`})
                  </p>
                  <img src={upscaled} alt="Upscaled" className="w-full rounded" />
                  {upscaledDims && (
                    <div className="text-sm text-gray-500 mt-1">
                      Resolution: {upscaledDims.width} × {upscaledDims.height}
                      {optimizedSize != null && (
                        <> &nbsp;|&nbsp; File Size: {(optimizedSize / 1024 / 1024).toFixed(2)} MB</>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <button onClick={() => handleDownload('upscale')} className="btn btn-primary w-full">
                  Download Upscaled Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile Sidebar Ad */}
      <div className="md:hidden col-span-12 md:order-4">
        <AdSlot slot="mobile" />
      </div>
      
      {/* Footer Ad */}
      <div className="col-span-12 md:order-5">
        <AdSlot slot="footer" className="mt-4" />
      </div>
      
      {/* Hidden canvases for processing */}
      <div className="hidden">
        <canvas ref={canvasRef}></canvas>
        <canvas ref={resultCanvasRef}></canvas>
      </div>
    </div>
  );
};

export default ImageSharpenerUpscaler; 