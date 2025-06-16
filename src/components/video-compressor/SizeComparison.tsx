import React from 'react';
import { formatFileSize } from '../../utils/fileUtils';

interface SizeComparisonProps {
  originalSize: number;
  compressedSize: number;
  isEstimate?: boolean;
}

const SizeComparison: React.FC<SizeComparisonProps> = ({
  originalSize,
  compressedSize,
  isEstimate = false,
}) => {
  // Calculate size reduction
  const sizeDifference = originalSize - compressedSize;
  const percentReduction = (sizeDifference / originalSize) * 100;
  
  // Determine bar widths for visualization
  const originalBarWidth = '100%';
  const compressedBarWidth = `${Math.max(5, (compressedSize / originalSize) * 100)}%`;
  
  return (
    <div>
      {/* Size comparison bars */}
      <div className="space-y-4">
        {/* Original size */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Original Size
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(originalSize)}
            </span>
          </div>
          <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{ width: originalBarWidth }}
            />
          </div>
        </div>
        
        {/* Compressed size */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isEstimate ? 'Estimated Compressed Size' : 'Compressed Size'}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatFileSize(compressedSize)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{ width: compressedBarWidth }}
            />
          </div>
        </div>
      </div>
      
      {/* Summary statistics */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Space Saved</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatFileSize(sizeDifference)}
          </p>
        </div>
        
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Reduction</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEstimate ? '~' : ''}{Math.round(percentReduction)}%
          </p>
        </div>
      </div>
      
      {isEstimate && (
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic text-center">
          * These are estimated values. Actual compression results may vary.
        </p>
      )}
    </div>
  );
};

export default SizeComparison; 