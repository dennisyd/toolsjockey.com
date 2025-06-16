import React, { useState } from 'react';
import { Download, Trash2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { formatDuration, formatFileSize } from '../../utils/fileUtils';

interface ExtractedFrame {
  id: string;
  url: string;
  time: number;
  format: string;
  size: number;
}

interface FrameGalleryProps {
  frames: ExtractedFrame[];
  selectedFrameId: string | null;
  onFrameSelect: (id: string) => void;
  onFrameDownload: (id: string) => void;
  onFrameDelete: (id: string) => void;
}

const FrameGallery: React.FC<FrameGalleryProps> = ({
  frames,
  selectedFrameId,
  onFrameSelect,
  onFrameDownload,
  onFrameDelete,
}) => {
  const [gridView, setGridView] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Get selected frame
  const selectedFrame = frames.find(frame => frame.id === selectedFrameId) || frames[0];
  
  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };
  
  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };
  
  // Navigate to previous frame
  const navigateToPrevFrame = () => {
    if (!selectedFrameId || frames.length <= 1) return;
    
    const currentIndex = frames.findIndex(frame => frame.id === selectedFrameId);
    if (currentIndex > 0) {
      onFrameSelect(frames[currentIndex - 1].id);
    }
  };
  
  // Navigate to next frame
  const navigateToNextFrame = () => {
    if (!selectedFrameId || frames.length <= 1) return;
    
    const currentIndex = frames.findIndex(frame => frame.id === selectedFrameId);
    if (currentIndex < frames.length - 1) {
      onFrameSelect(frames[currentIndex + 1].id);
    }
  };
  
  // Toggle between grid and detail view
  const toggleView = () => {
    setGridView(prev => !prev);
  };
  
  // If no frames, show empty state
  if (frames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No frames extracted yet</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* View toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleView}
          className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          {gridView ? 'Detail View' : 'Grid View'}
        </button>
      </div>
      
      {gridView ? (
        // Grid view
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {frames.map(frame => (
            <div
              key={frame.id}
              className={`relative rounded-lg overflow-hidden border-2 ${
                frame.id === selectedFrameId
                  ? 'border-blue-500 dark:border-blue-600'
                  : 'border-transparent'
              }`}
              onClick={() => onFrameSelect(frame.id)}
            >
              <img
                src={frame.url}
                alt={`Frame at ${formatDuration(frame.time)}`}
                className="w-full h-32 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1">
                {formatDuration(frame.time)}
              </div>
              
              {/* Quick actions */}
              <div className="absolute top-0 right-0 flex space-x-1 p-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onFrameDownload(frame.id); }}
                  className="p-1 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80"
                  title="Download frame"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onFrameDelete(frame.id); }}
                  className="p-1 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80"
                  title="Delete frame"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Detail view
        <div>
          {selectedFrame && (
            <>
              {/* Frame navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={navigateToPrevFrame}
                  disabled={frames.findIndex(f => f.id === selectedFrameId) <= 0}
                  className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Frame {frames.findIndex(f => f.id === selectedFrameId) + 1} of {frames.length}
                </div>
                
                <button
                  onClick={navigateToNextFrame}
                  disabled={frames.findIndex(f => f.id === selectedFrameId) >= frames.length - 1}
                  className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              {/* Selected frame */}
              <div className="bg-black rounded-lg overflow-hidden mb-4">
                <div className="relative">
                  <img
                    src={selectedFrame.url}
                    alt={`Frame at ${formatDuration(selectedFrame.time)}`}
                    className="w-full h-auto"
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                  />
                  
                  {/* Zoom controls */}
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <button
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 0.5}
                      className="p-2 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 3}
                      className="p-2 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Frame details */}
              <div className="flex flex-wrap justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Time:</span> {formatDuration(selectedFrame.time)}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Format:</span> {selectedFrame.format.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Size:</span> {formatFileSize(selectedFrame.size)}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onFrameDownload(selectedFrame.id)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                  <button
                    onClick={() => onFrameDelete(selectedFrame.id)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
              
              {/* Thumbnail strip */}
              <div className="mt-4 overflow-x-auto">
                <div className="flex space-x-2 pb-2">
                  {frames.map(frame => (
                    <div
                      key={frame.id}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer ${
                        frame.id === selectedFrameId
                          ? 'border-blue-500 dark:border-blue-600'
                          : 'border-transparent'
                      }`}
                      onClick={() => onFrameSelect(frame.id)}
                    >
                      <img
                        src={frame.url}
                        alt={`Thumbnail at ${formatDuration(frame.time)}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FrameGallery; 