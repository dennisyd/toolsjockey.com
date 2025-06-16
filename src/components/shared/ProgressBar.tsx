import React from 'react';
import { Clock } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  currentTask?: string;
  estimatedTimeRemaining?: number | null;
  isIndeterminate?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  currentTask,
  estimatedTimeRemaining,
  isIndeterminate = false,
  className = '',
}) => {
  // Format estimated time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.floor(seconds)} seconds`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} minutes ${Math.floor(seconds % 60)} seconds`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} hours ${minutes} minutes`;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm ${className}`}>
      {/* Task description */}
      {currentTask && (
        <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentTask}
        </div>
      )}
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${isIndeterminate ? 'animate-pulse bg-blue-500' : 'bg-blue-600'}`}
          style={{ width: isIndeterminate ? '100%' : `${progress}%` }}
        />
      </div>
      
      {/* Progress percentage and time remaining */}
      <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
        <div>{isIndeterminate ? 'Processing...' : `${Math.round(progress)}%`}</div>
        
        {estimatedTimeRemaining !== null && estimatedTimeRemaining !== undefined && (
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              {estimatedTimeRemaining > 0
                ? `Estimated time remaining: ${formatTimeRemaining(estimatedTimeRemaining)}`
                : 'Finishing up...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar; 