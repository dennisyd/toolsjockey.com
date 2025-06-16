import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { VideoFile, FileHandlerOptions, FileHandlerHookReturn } from '../types/video';

// Maximum file size: 2GB
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

// Supported input formats
const SUPPORTED_FORMATS = [
  'video/mp4',
  'video/x-msvideo', // AVI
  'video/quicktime', // MOV
  'video/x-matroska', // MKV
  'video/webm',
  'video/x-flv',
  'video/3gpp',
  'video/x-ms-wmv'
];

export const useFileHandler = ({ setVideoFiles, setErrorMessage }: FileHandlerOptions): FileHandlerHookReturn => {
  
  // Function to check if a file is valid (correct format, size)
  const validateFile = useCallback((file: File): boolean => {
    // Check file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      setErrorMessage(`Unsupported format: ${file.type}. Please use MP4, AVI, MOV, MKV, WebM, FLV, 3GP, or WMV.`);
      return false;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`File too large: ${(file.size / (1024 * 1024)).toFixed(2)} MB exceeds the 2GB limit.`);
      return false;
    }
    
    return true;
  }, [setErrorMessage]);

  // Extract video metadata and generate thumbnail
  const processVideoFile = useCallback(async (file: File): Promise<VideoFile> => {
    // Create blob URL for preview
    const url = URL.createObjectURL(file);
    
    // Create a video element to get metadata
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    videoElement.src = url;
    
    // Get video metadata
    const metadata = await new Promise<VideoFile['metadata']>((resolve) => {
      videoElement.onloadedmetadata = () => {
        resolve({
          width: videoElement.videoWidth,
          height: videoElement.videoHeight,
          duration: videoElement.duration,
          format: file.type.split('/')[1],
          fileSize: file.size,
        });
      };
      
      // Handle errors
      videoElement.onerror = () => {
        resolve({
          format: file.type.split('/')[1],
          fileSize: file.size,
        });
      };
    });
    
    // Generate thumbnail at 1 second
    const thumbnail = await new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        resolve(''); // Canvas not supported
        return;
      }
      
      // Set video to 1 second for thumbnail
      videoElement.currentTime = 1;
      
      videoElement.onseeked = () => {
        // Set canvas dimensions
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        // Draw video frame on canvas
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL (thumbnail)
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        } catch (error) {
          console.error('Failed to create thumbnail:', error);
          resolve('');
        }
      };
      
      videoElement.onerror = () => {
        resolve(''); // Error loading video
      };
    });
    
    // Create VideoFile object
    return {
      id: uuidv4(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url,
      metadata,
      thumbnail
    };
  }, []);

  // Handle file upload from input element
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const files = Array.from(event.target.files);
    
    // Reset input value to allow uploading the same file again
    event.target.value = '';
    
    // Filter valid files
    const validFiles = files.filter(validateFile);
    
    if (validFiles.length === 0) {
      return;
    }
    
    setErrorMessage(null);
    
    try {
      // Process files to get metadata and thumbnails
      const processedFiles = await Promise.all(validFiles.map(processVideoFile));
      
      // Add to video files state
      setVideoFiles(prevFiles => [...prevFiles, ...processedFiles]);
    } catch (error) {
      setErrorMessage(`Error processing files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [validateFile, processVideoFile, setVideoFiles, setErrorMessage]);

  // Handle file drop from drag and drop
  const handleFileDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      return;
    }
    
    // Filter valid files
    const validFiles = acceptedFiles.filter(validateFile);
    
    if (validFiles.length === 0) {
      return;
    }
    
    setErrorMessage(null);
    
    try {
      // Process files to get metadata and thumbnails
      const processedFiles = await Promise.all(validFiles.map(processVideoFile));
      
      // Add to video files state
      setVideoFiles(prevFiles => [...prevFiles, ...processedFiles]);
    } catch (error) {
      setErrorMessage(`Error processing files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [validateFile, processVideoFile, setVideoFiles, setErrorMessage]);

  // Remove a file from the list
  const removeFile = useCallback((id: string) => {
    setVideoFiles(prevFiles => {
      // Find the file to remove
      const fileToRemove = prevFiles.find(file => file.id === id);
      
      // Revoke the URL to free memory
      if (fileToRemove && fileToRemove.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      
      // Return a new array without the removed file
      return prevFiles.filter(file => file.id !== id);
    });
  }, [setVideoFiles]);

  return {
    handleFileUpload,
    handleFileDrop,
    validateFile,
    removeFile
  };
}; 