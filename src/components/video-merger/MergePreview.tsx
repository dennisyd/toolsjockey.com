import React from 'react';
import { Download, Check } from 'lucide-react';
import VideoPreview from '../shared/VideoPreview';
import { formatFileSize } from '../../utils/fileUtils';

interface MergePreviewProps {
  src: string;
  size: number;
  format: string;
  onDownload: () => void;
}

const MergePreview: React.FC<MergePreviewProps> = ({
  src,
  size,
  format,
  onDownload,
}) => {
  return (
    <div className="space-y-4">
      {/* Success message */}
      <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-lg">
        <div className="flex items-center">
          <Check className="w-5 h-5 text-green-500 mr-2" />
          <p className="text-green-700 dark:text-green-400 font-medium">
            Videos successfully merged!
          </p>
        </div>
        <p className="text-sm text-green-600 dark:text-green-500 mt-1">
          Your merged video is ready to preview and download.
        </p>
      </div>
      
      {/* Video preview */}
      <VideoPreview
        src={src}
        title={`Merged Video (${format.toUpperCase()})`}
      />
      
      {/* Video details */}
      <div className="flex flex-wrap justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="space-y-1">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Format:</span> {format.toUpperCase()}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Size:</span> {formatFileSize(size)}
          </div>
        </div>
        
        <button
          onClick={onDownload}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Merged Video
        </button>
      </div>
      
      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Tips</h3>
        <ul className="text-xs text-blue-700 dark:text-blue-400 list-disc list-inside space-y-1">
          <li>If you need to make changes, you can reorder or remove videos and merge again</li>
          <li>For best quality, ensure all source videos have similar resolutions and formats</li>
          <li>Large videos may take longer to process and download</li>
        </ul>
      </div>
    </div>
  );
};

export default MergePreview; 