import React, { useState } from 'react';
import { Trash2, Scissors, Download, Edit2, Check, X, Play, Clock } from 'lucide-react';
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
  format?: string;
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
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

  // Handle play preview
  const handlePlayPreview = () => {
    setIsPreviewOpen(true);
  };
  
  // Close preview
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
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
              onClick={(e) => { e.stopPropagation(); handleCancelEdits(); }}
              disabled={disabled}
              className={`px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleSaveEdits(); }}
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
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">{clip.name}</h3>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDuration(clip.startTime)} - {formatDuration(clip.endTime)} 
                  <span className="ml-1 px-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    {formatDuration(clip.duration)}
                  </span>
                </div>
              </div>
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
          
          {clip.processed && clip.url ? (
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  {clip.format && <span className="uppercase mr-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-300 font-mono text-[10px]">{clip.format}</span>}
                  {clip.size && formatFileSize(clip.size)}
                </span>
                <div className="flex gap-2">
                  {clip.url && (
                    <button
                      onClick={(e) => { e.stopPropagation(); if (!disabled) handlePlayPreview(); }}
                      disabled={disabled}
                      className={`flex items-center px-2 py-1 text-xs bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Preview
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); if (!disabled) onDownload(); }}
                    disabled={disabled}
                    className={`flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </button>
                </div>
              </div>

              {/* Preview modal */}
              {isPreviewOpen && clip.url && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={handleClosePreview}>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">{clip.name}</h3>
                      <button onClick={handleClosePreview} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <video 
                      src={clip.url} 
                      controls 
                      autoPlay
                      className="w-full rounded"
                    />
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => { onDownload(); handleClosePreview(); }}
                        className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3">
              <button
                onClick={(e) => { e.stopPropagation(); if (!disabled) onProcess(); }}
                disabled={isProcessing || disabled}
                className={`flex items-center w-full justify-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 ${isProcessing || disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <Scissors className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Process Clip'}
              </button>
              {!isProcessing && (
                <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">
                  Process the clip to generate a downloadable file
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClipPreview; 