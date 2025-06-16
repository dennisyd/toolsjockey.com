import React, { useState } from 'react';
import { Trash2, Scissors, Download, Edit2, Check, X } from 'lucide-react';
import { formatDuration, formatFileSize } from '../../utils/fileUtils';

interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  name: string;
  processed?: boolean;
  url?: string;
  size?: number;
}

interface ClipPreviewProps {
  clip: VideoClip;
  isSelected: boolean;
  isProcessing: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onProcess: () => void;
  onDownload: () => void;
  onNameChange: (name: string) => void;
  onTimeChange: (startTime: number, endTime: number) => void;
  disabled?: boolean;
}

const ClipPreview: React.FC<ClipPreviewProps> = ({
  clip,
  isSelected,
  isProcessing,
  onSelect,
  onRemove,
  onProcess,
  onDownload,
  onNameChange,
  onTimeChange,
  disabled = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(clip.name);
  const [editStartTime, setEditStartTime] = useState(formatDuration(clip.startTime));
  const [editEndTime, setEditEndTime] = useState(formatDuration(clip.endTime));
  
  // Handle save edits
  const handleSaveEdits = () => {
    // Parse time strings to seconds
    const parseTime = (timeStr: string): number => {
      const parts = timeStr.split(':').map(part => parseInt(part, 10));
      if (parts.length === 3) {
        // HH:MM:SS format
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        // MM:SS format
        return parts[0] * 60 + parts[1];
      }
      return 0;
    };
    
    const startTime = parseTime(editStartTime);
    const endTime = parseTime(editEndTime);
    
    // Validate times
    if (startTime >= endTime) {
      alert('Start time must be before end time');
      return;
    }
    
    onNameChange(editName);
    onTimeChange(startTime, endTime);
    setIsEditing(false);
  };
  
  // Handle cancel edits
  const handleCancelEdits = () => {
    setEditName(clip.name);
    setEditStartTime(formatDuration(clip.startTime));
    setEditEndTime(formatDuration(clip.endTime));
    setIsEditing(false);
  };
  
  return (
    <div 
      className={`p-4 rounded-lg transition-colors ${
        isSelected 
          ? 'bg-blue-50 border border-blue-300 dark:bg-blue-900/20 dark:border-blue-700' 
          : 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700'
      } ${disabled ? 'opacity-70' : ''}`}
      onClick={disabled ? undefined : onSelect}
    >
      {isEditing ? (
        // Edit mode
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Clip Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${disabled ? 'cursor-not-allowed' : ''}`}
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <input
                type="text"
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                placeholder="00:00"
                disabled={disabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${disabled ? 'cursor-not-allowed' : ''}`}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <input
                type="text"
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                placeholder="00:00"
                disabled={disabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${disabled ? 'cursor-not-allowed' : ''}`}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={handleCancelEdits}
              disabled={disabled}
              className={`px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveEdits}
              disabled={disabled}
              className={`px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // View mode
        <>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{clip.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDuration(clip.startTime)} - {formatDuration(clip.endTime)} ({formatDuration(clip.duration)})
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={(e) => { e.stopPropagation(); if (!disabled) setIsEditing(true); }}
                disabled={disabled}
                className={`p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                title="Edit clip"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); if (!disabled) onRemove(); }}
                disabled={disabled}
                className={`p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                title="Delete clip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {clip.processed && clip.url && (
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {clip.size ? formatFileSize(clip.size) : ''}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); if (!disabled) onDownload(); }}
                disabled={disabled}
                className={`flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Download className="w-3 h-3 mr-1" />
                Download
              </button>
            </div>
          )}
          
          {!clip.processed && (
            <div className="mt-2">
              <button
                onClick={(e) => { e.stopPropagation(); if (!disabled) onProcess(); }}
                disabled={isProcessing || disabled}
                className={`flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 ${isProcessing || disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Scissors className="w-3 h-3 mr-1" />
                {isProcessing ? 'Processing...' : 'Process Clip'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClipPreview; 