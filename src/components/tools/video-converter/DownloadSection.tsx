import React from 'react';
import { Download, CheckCircle } from 'lucide-react';
import type { ConvertedFile, VideoFile } from '../../../types/video';

interface DownloadSectionProps {
  convertedFiles: ConvertedFile[];
  originalFiles: VideoFile[];
}

const DownloadSection: React.FC<DownloadSectionProps> = ({
  convertedFiles,
  originalFiles,
}) => {
  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate size reduction percentage
  const calculateSizeReduction = (
    originalSize: number,
    convertedSize: number
  ): number => {
    const reduction = ((originalSize - convertedSize) / originalSize) * 100;
    return Math.round(reduction);
  };

  // Handle download
  const handleDownload = (file: ConvertedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create a ZIP file with all converted videos
  const handleDownloadAll = () => {
    // For multiple files, we'd typically use JSZip to create a zip file
    // But for simplicity in this demo, if there's only one file,
    // we'll just download it directly
    if (convertedFiles.length === 1) {
      handleDownload(convertedFiles[0]);
      return;
    }

    // For multiple files, show a message that this would create a ZIP
    alert(
      'In a production environment, this would create a ZIP file containing all converted videos.'
    );
  };

  return (
    <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
      <div className="flex items-center mb-4">
        <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
        <h3 className="text-lg font-medium text-green-800 dark:text-green-300">
          Conversion Complete!
        </h3>
      </div>

      {/* File list with download buttons */}
      <div className="mb-6 divide-y divide-gray-200 dark:divide-gray-700">
        {convertedFiles.map((file) => {
          // Find original file to compare size
          const originalFile = originalFiles.find(
            (of) => of.id === file.originalId
          );
          const originalSize = originalFile?.size || 0;
          const sizeReduction = calculateSizeReduction(originalSize, file.size);

          return (
            <div
              key={file.id}
              className="py-3 flex flex-col md:flex-row md:items-center justify-between"
            >
              <div className="mb-2 md:mb-0">
                <p className="font-medium text-gray-900 dark:text-white">
                  {file.name}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="mr-3">
                    {formatFileSize(file.size)}{' '}
                    <span
                      className={
                        sizeReduction > 0
                          ? 'text-green-500 dark:text-green-400'
                          : 'text-amber-500 dark:text-amber-400'
                      }
                    >
                      ({sizeReduction > 0 ? '-' : '+'}
                      {Math.abs(sizeReduction)}%)
                    </span>
                  </span>
                  {file.metadata && (
                    <span className="flex items-center">
                      {file.metadata.width && file.metadata.height && (
                        <span className="flex items-center text-gray-400">
                          <span className="h-1 w-1 bg-gray-400 rounded-full mx-2" />
                          {file.metadata.width}×{file.metadata.height}
                        </span>
                      )}
                      {file.format && (
                        <span className="flex items-center text-gray-400">
                          <span className="h-1 w-1 bg-gray-400 rounded-full mx-2" />
                          {file.format.toUpperCase()}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                onClick={() => handleDownload(file)}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Download
              </button>
            </div>
          );
        })}
      </div>

      {/* Download all button */}
      {convertedFiles.length > 1 && (
        <div className="flex justify-center">
          <button
            className="inline-flex items-center px-5 py-3 border border-transparent rounded-md shadow-sm text-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={handleDownloadAll}
          >
            <Download className="h-5 w-5 mr-2" />
            Download All Files
          </button>
        </div>
      )}

      {/* Privacy reminder */}
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
        <p>
          Remember: All processing was done locally on your device. 
          Your videos were never uploaded to any server.
        </p>
      </div>
    </div>
  );
};

export default DownloadSection; 