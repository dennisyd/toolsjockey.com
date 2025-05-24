import { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

interface Color {
  hex: string;
  rgb: string;
  percentage: number;
}

const ColorPaletteGenerator = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [colors, setColors] = useState<Color[]>([]);
  const [paletteSize, setPaletteSize] = useState<number>(5);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setPreview(URL.createObjectURL(file));
      setColors([]);
    }
  });

  useEffect(() => {
    return () => {
      // Clean up the object URLs when component unmounts
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    if (preview) {
      extractColors();
    }
  }, [preview, paletteSize]);

  const extractColors = () => {
    if (!canvasRef.current || !preview) return;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        
        // Resize image for faster processing
        const maxDimension = 150; // Small enough for quick processing
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxDimension) {
            height = height * (maxDimension / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = width * (maxDimension / height);
            height = maxDimension;
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height).data;
        
        // Process colors
        const colorMap: Record<string, { count: number, r: number, g: number, b: number }> = {};
        const pixelCount = width * height;
        
        // Group similar colors by reducing precision
        for (let i = 0; i < imageData.length; i += 4) {
          // Skip transparent pixels
          if (imageData[i + 3] < 128) continue;
          
          // Reduce precision to group similar colors
          const r = Math.round(imageData[i] / 10) * 10;
          const g = Math.round(imageData[i + 1] / 10) * 10;
          const b = Math.round(imageData[i + 2] / 10) * 10;
          
          const key = `${r},${g},${b}`;
          
          if (!colorMap[key]) {
            colorMap[key] = { count: 0, r, g, b };
          }
          
          colorMap[key].count++;
        }
        
        // Convert to array and sort by count
        const colorArray = Object.values(colorMap).sort((a, b) => b.count - a.count);
        
        // Take top colors based on paletteSize
        const topColors = colorArray.slice(0, paletteSize).map(color => {
          const { r, g, b, count } = color;
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          const rgb = `rgb(${r}, ${g}, ${b})`;
          const percentage = Math.round((count / pixelCount) * 100);
          
          return { hex, rgb, percentage };
        });
        
        setColors(topColors);
        setIsProcessing(false);
      };
      
      img.src = preview;
    }, 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Could show a toast notification here
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="container-app">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Color Palette Generator</h1>
        <p className="text-gray-600 dark:text-gray-300">Extract dominant colors from your images</p>
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
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Number of Colors: {paletteSize}
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={paletteSize}
                onChange={(e) => setPaletteSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {isProcessing ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent"></div>
                <p className="mt-2">Extracting colors...</p>
              </div>
            ) : colors.length > 0 ? (
              <div>
                <h3 className="text-xl font-semibold mb-4">Color Palette</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {colors.map((color, index) => (
                    <div 
                      key={index}
                      className="bg-white dark:bg-primary border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm"
                    >
                      <div 
                        className="h-24 w-full" 
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <div className="p-3">
                        <div className="flex justify-between items-center mb-1">
                          <button 
                            onClick={() => copyToClipboard(color.hex)}
                            className="font-mono text-sm hover:text-accent transition-colors"
                            title="Click to copy HEX"
                          >
                            {color.hex}
                          </button>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{color.percentage}%</span>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(color.rgb)}
                          className="font-mono text-xs text-gray-600 dark:text-gray-300 hover:text-accent transition-colors"
                          title="Click to copy RGB"
                        >
                          {color.rgb}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Click on any color value to copy to clipboard</p>
                  <button 
                    onClick={() => copyToClipboard(colors.map(c => c.hex).join(', '))}
                    className="btn btn-primary"
                  >
                    Copy All HEX Values
                  </button>
                </div>
              </div>
            ) : null}
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

export default ColorPaletteGenerator; 