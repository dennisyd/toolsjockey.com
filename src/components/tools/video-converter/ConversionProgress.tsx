import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';

interface ConversionProgressProps {
  progress: number;
  currentTask: string;
  estimatedTimeRemaining: number | null;
}

const ConversionProgress: React.FC<ConversionProgressProps> = ({
  progress,
  currentTask,
  estimatedTimeRemaining,
}) => {
  // Format estimated time remaining in human-readable format
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <RefreshCw className="h-5 w-5 text-blue-500 animate-spin mr-2" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            {currentTask}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {progress}%
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Time remaining */}
      {estimatedTimeRemaining !== null && (
        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Clock className="h-4 w-4 mr-1" />
          <span>
            Estimated time remaining: {formatTimeRemaining(estimatedTimeRemaining)}
          </span>
        </div>
      )}
    </div>
  );
};

export default ConversionProgress; 