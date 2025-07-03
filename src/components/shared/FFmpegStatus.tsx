import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Info } from 'lucide-react';
import { useFFmpeg } from '../../hooks/useFFmpeg';

const FFmpegStatus: React.FC = () => {
  const { isFFmpegLoaded, isFFmpegLoading, ffmpegLoadingProgress, error, retryLoadFFmpeg } = useFFmpeg();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  
  // Show a timeout warning if loading takes more than 15 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isFFmpegLoading) {
      timeoutId = setTimeout(() => {
        setShowTimeoutWarning(true);
      }, 15000);
    } else {
      setShowTimeoutWarning(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isFFmpegLoading]);
  
  // If FFmpeg is loaded or there's no error, don't show anything
  if (isFFmpegLoaded || (!isFFmpegLoading && !error)) {
    return null;
  }
  
  return (
    <>
      {/* FFmpeg loading progress */}
      {isFFmpegLoading && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600 m-4">
          <div className="flex items-center">
            <div className="animate-spin mr-2">
              <RefreshCw className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Loading video processing engine... This may take a moment.
                {showTimeoutWarning && (
                  <span className="block mt-1 text-amber-600 dark:text-amber-400">
                    This is taking longer than expected. Please be patient, especially on slower connections.
                  </span>
                )}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.max(5, ffmpegLoadingProgress)}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                {ffmpegLoadingProgress}% complete
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* FFmpeg error */}
      {error && !isFFmpegLoading && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 m-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button 
                  onClick={retryLoadFFmpeg}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex items-center"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry Loading
                </button>
                
                <button 
                  onClick={() => window.location.reload()}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 flex items-center"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh Page
                </button>
              </div>
              
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                <div className="flex">
                  <Info className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-200">
                    Troubleshooting tips:
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Make sure you're using a modern browser (Chrome, Edge, or Firefox)</li>
                      <li>Try disabling any ad blockers or content blockers</li>
                      <li>Check your internet connection</li>
                      <li>Clear your browser cache and cookies</li>
                    </ul>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FFmpegStatus; 