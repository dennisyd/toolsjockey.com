import React, { useRef, useState } from 'react';
import { Upload, X, File as FileIcon } from 'lucide-react';
import type { VideoFile } from '../../../types/video';

interface FileUploaderProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (acceptedFiles: File[]) => void;
  onFileRemove: (id: string) => void;
  files: VideoFile[];
  disabled: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  onFileDrop,
  onFileRemove,
  files,
  disabled,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFileDrop(droppedFiles);
    }
  };

  // Handle file input click
  const handleFileInputClick = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
      {/* Drag and drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleFileInputClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={onFileUpload}
          accept="video/*"
          multiple
          disabled={disabled}
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Click to upload or drag and drop
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          MP4, WebM, AVI, MOV, MKV (max 2GB)
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Uploaded videos</h3>
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center">
                  <FileIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onFileRemove(file.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  disabled={disabled}
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 