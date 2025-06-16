import React, { useRef, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (files: File[]) => void;
  acceptedFormats?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  description?: string;
  disabled?: boolean;
  files?: File[];
  onFileRemove?: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  acceptedFormats = "video/*",
  multiple = false,
  maxSize = 2 * 1024 * 1024 * 1024, // 2GB default
  description = "Upload your video file",
  disabled = false,
  files = [],
  onFileRemove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate files before uploading
  const validateFiles = (filesToValidate: File[]): File[] => {
    setError(null);
    
    // Filter files based on size and type
    const validFiles = filesToValidate.filter(file => {
      // Check file size
      if (file.size > maxSize) {
        setError(`File "${file.name}" exceeds the maximum size of ${formatFileSize(maxSize)}`);
        return false;
      }
      
      // Check file type if acceptedFormats is provided
      if (acceptedFormats && acceptedFormats !== "*") {
        const fileType = file.type;
        const acceptedTypes = acceptedFormats.split(',').map(type => type.trim());
        
        // Check if the file type matches any of the accepted types
        const isAccepted = acceptedTypes.some(type => {
          if (type.endsWith('/*')) {
            // Handle wildcard formats like "video/*"
            const typePrefix = type.split('/')[0];
            return fileType.startsWith(`${typePrefix}/`);
          }
          return type === fileType;
        });
        
        if (!isAccepted) {
          setError(`File "${file.name}" is not a supported format`);
          return false;
        }
      }
      
      return true;
    });
    
    return validFiles;
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    const validFiles = validateFiles(selectedFiles);
    
    if (validFiles.length > 0) {
      onFileSelect(validFiles);
    }
    
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(droppedFiles);
      
      if (validFiles.length > 0) {
        onFileSelect(validFiles);
      }
    }
  };

  // Trigger file input click
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      {/* Drag and drop area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 dark:hover:border-blue-500'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={acceptedFormats}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {files.length > 0 ? "Add more files" : "Click to upload or drag and drop"}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Maximum file size: {formatFileSize(maxSize)}
        </p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-start text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Uploaded files ({files.length})
          </h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                {onFileRemove && (
                  <button
                    type="button"
                    onClick={() => onFileRemove(file)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    disabled={disabled}
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 