import React, { useState } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

interface GifPreviewProps {
  src: string;
  width: number;
  height?: number;
  className?: string;
}

const GifPreview: React.FC<GifPreviewProps> = ({
  src,
  width,
  height,
  className = '',
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPaused(!isPaused);
  };
  
  // Reload GIF
  const reloadGif = () => {
    setIsLoading(true);
    // Force reload by appending a timestamp query parameter
    const imgElement = document.getElementById('gif-preview') as HTMLImageElement;
    if (imgElement) {
      const timestamp = new Date().getTime();
      const srcWithoutQuery = src.split('?')[0];
      imgElement.src = `${srcWithoutQuery}?t=${timestamp}`;
    }
  };
  
  // Handle load complete
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  return (
    <div className={`relative ${className}`}>
      {/* GIF container */}
      <div className="relative bg-black rounded-lg overflow-hidden">
        <img
          id="gif-preview"
          src={src}
          alt="GIF Preview"
          width={width}
          height={height}
          style={{
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'contain',
            // Use CSS animation play state to pause/play GIF
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
          className={`mx-auto ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
          onLoad={handleLoad}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-gray-300"></div>
          </div>
        )}
        
        {/* Controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex justify-between items-center">
            <button
              onClick={togglePlayPause}
              className="text-white hover:text-blue-400 transition-colors"
              aria-label={isPaused ? 'Play' : 'Pause'}
            >
              {isPaused ? (
                <Play className="h-6 w-6" />
              ) : (
                <Pause className="h-6 w-6" />
              )}
            </button>
            
            <button
              onClick={reloadGif}
              className="text-white hover:text-blue-400 transition-colors"
              aria-label="Reload GIF"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Dimensions display */}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
        {width} × {height || 'auto'} pixels
      </div>
    </div>
  );
};

export default GifPreview; 