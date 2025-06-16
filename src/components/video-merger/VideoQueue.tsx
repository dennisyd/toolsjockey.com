import React from 'react';
import { Trash2, GripVertical, Play, Clock } from 'lucide-react';
import { formatDuration, formatFileSize } from '../../utils/fileUtils';

interface VideoItem {
  id: string;
  file: File;
  url: string;
  duration: number;
}

interface VideoQueueProps {
  videos: VideoItem[];
  selectedVideoId: string | null;
  onVideoSelect: (id: string) => void;
  onVideoRemove: (id: string) => void;
  onVideoReorder: (sourceIndex: number, destinationIndex: number) => void;
}

const VideoQueue: React.FC<VideoQueueProps> = ({
  videos,
  selectedVideoId,
  onVideoSelect,
  onVideoRemove,
  onVideoReorder,
}) => {
  // Drag and drop functionality
  const [draggedItem, setDraggedItem] = React.useState<number | null>(null);
  
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;
    
    // Reorder the videos
    onVideoReorder(draggedItem, index);
    setDraggedItem(index);
  };
  
  const handleDragEnd = () => {
    setDraggedItem(null);
  };
  
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
      {videos.map((video, index) => (
        <div
          key={video.id}
          className={`flex items-center p-3 rounded-lg cursor-pointer border ${
            video.id === selectedVideoId
              ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700'
              : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700'
          }`}
          onClick={() => onVideoSelect(video.id)}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
        >
          {/* Drag handle */}
          <div className="cursor-grab p-1 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={(e) => { e.stopPropagation(); onVideoSelect(video.id); }}
              className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
              title="Preview video"
            >
              <Play className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onVideoRemove(video.id); }}
              className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              title="Remove video"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      
      {/* Instructions */}
      {videos.length > 1 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Drag and drop videos to reorder them.
        </p>
      )}
    </div>
  );
};

export default VideoQueue; 