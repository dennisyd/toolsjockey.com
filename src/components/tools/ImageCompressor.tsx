import { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageCompressor = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressed, setCompressed] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [compressionRatio, setCompressionRatio] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setOriginalSize(file.size);
      setCompressed(null);
      setCompressedSize(0);
      setCompressionRatio(0);
    }
  });

  useEffect(() => {
    return () => {
      // Clean up the object URLs when component unmounts
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const compressImage = () => {
    if (!canvasRef.current || !preview) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas with new dimensions
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
        setCompressed(compressedDataUrl);
        
        // Calculate compressed size
        const base64str = compressedDataUrl.split(',')[1];
        const compressedBytes = atob(base64str).length;
        setCompressedSize(compressedBytes);
        
        // Calculate compression ratio
        const ratio = ((originalSize - compressedBytes) / originalSize) * 100;
        setCompressionRatio(Math.round(ratio * 100) / 100);
        
        setIsProcessing(false);
      };
      
      img.src = preview;
    }, 100);
  };

  const handleDownload = () => {
    if (!compressed) return;
    
    const link = document.createElement('a');
    link.href = compressed;
    link.download = `compressed-${image?.name || 'image.jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="container-app">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Image Compressor</h1>
        <p className="text-gray-600 dark:text-gray-300">Reduce image file size while maintaining quality</p>
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
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Original size: {formatFileSize(originalSize)}
              </p>
            </div>
          )}
        </div>
        
        {preview && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lower quality = smaller file size
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Max Width: {maxWidth}px
                </label>
                <input
                  type="range"
                  min="500"
                  max="3840"
                  step="100"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Larger images will be resized to this width
                </p>
              </div>
              
              <button
                onClick={compressImage}
                disabled={isProcessing}
                className="btn btn-primary w-full"
              >
                {isProcessing ? 'Compressing...' : 'Compress Image'}
              </button>
            </div>
            
            <div>
              {compressed && (
                <div className="text-center">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span>Original:</span>
                      <span>{formatFileSize(originalSize)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Compressed:</span>
                      <span>{formatFileSize(compressedSize)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Saved:</span>
                      <span className="text-green-600 dark:text-green-400">{compressionRatio}%</span>
                    </div>
                  </div>
                  
                  <img 
                    src={compressed} 
                    alt="Compressed" 
                    className="max-h-48 max-w-full mx-auto rounded mb-4"
                  />
                  
                  <button onClick={handleDownload} className="btn btn-primary w-full">
                    Download Compressed Image
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Ad Space */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Advertisement Space</p>
      </div>
      
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default ImageCompressor; 