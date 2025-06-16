import React from 'react';
import { AlertCircle, Loader } from 'lucide-react';
import { useFFmpeg } from '../../hooks/useFFmpeg';

interface FFmpegStatusProps {
  onRetry?: () => void;
}

/**
 * A component that displays FFmpeg loading status and errors
 * To be used across all video/audio processing tools
 */
const FFmpegStatus: React.FC<FFmpegStatusProps> = ({ onRetry }) => {
  const { 
    isFFmpegLoaded, 
    isFFmpegLoading, 
    ffmpegLoadingProgress, 
    error: ffmpegError,
    retryLoadFFmpeg 
  } = useFFmpeg();

  // If FFmpeg is loaded and there's no error, don't render anything
  if (isFFmpegLoaded && !ffmpegError) {
    return null;
  }

  // If FFmpeg is loading, show a loading indicator
  if (isFFmpegLoading) {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600 m-4">
        <div className="flex items-center">
          <Loader className="h-5 w-5 text-blue-400 dark:text-blue-300 mr-2 animate-spin" />
          <div>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Loading video processing engine... {ffmpegLoadingProgress > 0 ? `${ffmpegLoadingProgress}%` : ''}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If there's an error, show it
  if (ffmpegError) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 m-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300 mr-2" />
          <div>
            <p className="text-sm text-red-700 dark:text-red-200">{ffmpegError}</p>
            <button 
              onClick={onRetry || retryLoadFFmpeg}
              className="mt-2 px-3 py-1 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If FFmpeg is not loaded but not loading either, show a warning
  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 m-4">
      <div className="flex">
        <AlertCircle className="h-5 w-5 text-yellow-400 dark:text-yellow-300 mr-2" />
        <div>
          <p className="text-sm text-yellow-700 dark:text-yellow-200">
            Video processing engine is not loaded. Please click the button below to load it.
          </p>
          <button 
            onClick={onRetry || retryLoadFFmpeg}
            className="mt-2 px-3 py-1 text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
          >
            Load Processing Engine
          </button>
        </div>
      </div>
    </div>
  );
};

export default FFmpegStatus; 