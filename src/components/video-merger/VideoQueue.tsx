import React from 'react';
import { Trash2, GripVertical, Clock } from 'lucide-react';
import { formatDuration, formatFileSize } from '../../utils/fileUtils';

interface VideoItem {
  id: string;
  file: File;
  url: string;
  duration: number;
}

interface VideoQueueProps {
  videos: VideoItem[];
  onRemove: (id: string) => void;
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  disabled?: boolean;
}

const VideoQueue: React.FC<VideoQueueProps> = ({
  videos,
  onRemove,
  onReorder,
  disabled = false
}) => {
  // Drag and drop functionality
  const [draggedItem, setDraggedItem] = React.useState<number | null>(null);
  
  const handleDragStart = (index: number) => {
    if (disabled) return;
    setDraggedItem(index);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (disabled || draggedItem === null || draggedItem === index) return;
    
    // Reorder the videos
    onReorder(draggedItem, index);
    setDraggedItem(index);
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
  };
  
  // Calculate total duration
  const totalDuration = videos.reduce((sum, video) => sum + video.duration, 0);
  
  // If no videos, show empty state
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No videos added yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Upload videos to start merging</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {videos.length} video{videos.length !== 1 ? 's' : ''}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total Duration: {formatDuration(totalDuration)}
        </div>
      </div>
      
      {videos.map((video, index) => (
        <div
          key={video.id}
          className={`flex items-center p-3 rounded-lg ${disabled ? 'opacity-70' : 'cursor-pointer'} border
            bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700
          `}
          draggable={!disabled}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
        >
          {/* Drag handle */}
          <div className={`p-1 mr-2 text-gray-400 ${disabled ? 'cursor-not-allowed' : 'cursor-grab hover:text-gray-600 dark:hover:text-gray-300'}`}>
            <GripVertical className="w-4 h-4" />
          </div>
          
          {/* Video number */}
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{index + 1}</span>
          </div>
          
          {/* Video info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {video.file.name}
            </h3>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <Clock className="w-3 h-3 mr-1" />
              <span>{formatDuration(video.duration)}</span>
              <span className="mx-2">•</span>
              <span>{formatFileSize(video.file.size)}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center ml-4">
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(video.id); }}
              disabled={disabled}
              className={`p-1 ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'}`}
              title="Remove video"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      {/* Instructions */}
      {videos.length > 1 && !disabled && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Drag and drop videos to reorder them.
        </p>
      )}
    </div>
  );
};

export default VideoQueue; 