import React from 'react';
import { formatFileSize } from '../../utils/fileUtils';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
  const isLarger = sizeDifference < 0;
  const absoluteSizeDiff = Math.abs(sizeDifference);
  const percentChange = Math.abs((sizeDifference / originalSize) * 100);
  
  // Determine bar widths for visualization
  const maxBarWidth = Math.max(originalSize, compressedSize);
  const originalBarWidth = `${(originalSize / maxBarWidth) * 100}%`;
  const compressedBarWidth = `${(compressedSize / maxBarWidth) * 100}%`;
  
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
              className={`${isLarger ? 'bg-orange-500' : 'bg-green-500'} h-4 rounded-full`}
              style={{ width: compressedBarWidth }}
            />
          </div>
        </div>
      </div>
      
      {/* Summary statistics */}
      <div className="mt-6 grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLarger ? 'Size Increased' : 'Space Saved'}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatFileSize(absoluteSizeDiff)}
          </p>
        </div>
        
        <div className={`p-3 ${isLarger ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-green-50 dark:bg-green-900/20'} rounded-lg`}>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isLarger ? 'Increase' : 'Reduction'}
          </p>
          <p className={`text-lg font-semibold flex items-center justify-center ${isLarger ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
            {isLarger ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {isEstimate ? '~' : ''}{Math.round(percentChange)}%
          </p>
        </div>
      </div>
      
      {isEstimate && (
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic text-center">
          * These are estimated values. Actual compression results may vary.
        </p>
      )}
      
      {isLarger && !isEstimate && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            <strong>Note:</strong> The compressed file is larger than the original. This can happen when:
          </p>
          <ul className="text-xs text-orange-600 dark:text-orange-300 list-disc list-inside mt-1">
            <li>The source video is already highly optimized</li>
            <li>The selected quality settings are too high</li>
            <li>The video codec requires more space for certain content types</li>
          </ul>
          <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
            Try using lower quality settings or a different compression preset.
          </p>
        </div>
      )}
    </div>
  );
};

export default SizeComparison; 