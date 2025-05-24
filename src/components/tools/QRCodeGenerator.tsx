import { useState, useEffect, useRef } from 'react';

const QRCodeGenerator = () => {
  const [text, setText] = useState<string>('');
  const [size, setSize] = useState<number>(200);
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState<string>('M');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code using Google Charts API
  const generateQRCode = () => {
    if (!text.trim()) return;
    
    setIsGenerating(true);
    
    const encodedText = encodeURIComponent(text);
    const url = `https://chart.googleapis.com/chart?cht=qr&chl=${encodedText}&chs=${size}x${size}&chld=${errorCorrectionLevel}|0`;
    
    // Create an image element to load the QR code
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;
        
        // Set canvas size to match QR code
        canvas.width = size;
        canvas.height = size;
        
        // Clear canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code on canvas
        ctx.drawImage(img, 0, 0, size, size);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/png');
        setQrCodeUrl(dataUrl);
        setIsGenerating(false);
      }
    };
    
    img.onerror = () => {
      console.error('Failed to load QR code image');
      setIsGenerating(false);
    };
    
    img.src = url;
  };

  // Generate QR code when text, size, or error correction level changes
  useEffect(() => {
    if (text.trim()) {
      const debounceTimer = setTimeout(() => {
        generateQRCode();
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [text, size, errorCorrectionLevel]);

  // Handle download
  const handleDownload = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-app">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">QR Code Generator</h1>
        <p className="text-gray-600 dark:text-gray-300">Generate QR codes for URLs, text, or contact information</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 shadow-md">
          <div className="mb-4">
            <label htmlFor="text" className="block text-sm font-medium mb-2">
              Text or URL
            </label>
            <textarea
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or URL to generate QR code"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent focus:border-accent dark:bg-primary dark:text-white"
              rows={4}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="size" className="block text-sm font-medium mb-2">
              Size: {size}x{size} pixels
            </label>
            <input
              type="range"
              id="size"
              min="100"
              max="500"
              step="50"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="errorCorrection" className="block text-sm font-medium mb-2">
              Error Correction Level
            </label>
            <select
              id="errorCorrection"
              value={errorCorrectionLevel}
              onChange={(e) => setErrorCorrectionLevel(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-accent focus:border-accent dark:bg-primary dark:text-white"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Higher correction levels make QR codes more resistant to damage but increase complexity
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 shadow-md flex flex-col items-center justify-center">
          {isGenerating ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent"></div>
              <p className="mt-2">Generating QR Code...</p>
            </div>
          ) : qrCodeUrl ? (
            <div className="text-center">
              <div className="bg-white p-4 inline-block rounded-lg shadow-sm">
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
              </div>
              <button onClick={handleDownload} className="btn btn-primary mt-6 w-full">
                Download QR Code
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="mt-2">Enter text or URL to generate a QR code</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Ad Space */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Advertisement Space</p>
      </div>
      
      {/* Hidden canvas for QR code generation */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default QRCodeGenerator; 