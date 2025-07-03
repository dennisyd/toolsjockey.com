import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useFFmpeg } from '../../hooks/useFFmpeg';

const FFmpegStatus: React.FC = () => {
  const { isFFmpegLoaded, isFFmpegLoading, ffmpegLoadingProgress, error, retryLoadFFmpeg } = useFFmpeg();
  
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
                Loading audio processing engine... This may take a moment.
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.max(5, ffmpegLoadingProgress)}%` }}
                ></div>
              </div>
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
              <button 
                onClick={retryLoadFFmpeg}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex items-center"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry Loading
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FFmpegStatus; 