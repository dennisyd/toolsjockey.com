// Maximum file size (2GB)
export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024;

// Common video mime types
export const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/x-msvideo', // AVI
  'video/quicktime', // MOV
  'video/x-matroska', // MKV
  'video/3gpp',
  'video/x-ms-wmv',
];

// Common audio mime types
export const AUDIO_MIME_TYPES = [
  'audio/mpeg', // MP3
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
];

// Common image mime types
export const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
];

/**
 * Format file size to human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format duration in seconds to HH:MM:SS format
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Parse duration string in HH:MM:SS format to seconds
 */
export const parseDuration = (durationStr: string): number => {
  const parts = durationStr.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  }
  
  return 0;
};

/**
 * Validate file type
 */
export const validateFileType = (file: File, acceptedTypes: string[]): boolean => {
  return acceptedTypes.some(type => {
    if (type.endsWith('/*')) {
      // Handle wildcard formats like "video/*"
      const typePrefix = type.split('/')[0];
      return file.type.startsWith(`${typePrefix}/`);
    }
    return type === file.type;
  });
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSize: number = MAX_FILE_SIZE): boolean => {
  return file.size <= maxSize;
};

/**
 * Generate a unique filename
 */
export const generateUniqueFilename = (originalName: string, suffix: string = ''): string => {
  const timestamp = new Date().getTime();
  const extension = originalName.substring(originalName.lastIndexOf('.'));
  const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
  
  return `${baseName}${suffix ? '_' + suffix : ''}_${timestamp}${extension}`;
};

/**
 * Create a download link for a blob
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Extract file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return filename.substring(filename.lastIndexOf('.')).toLowerCase();
};

/**
 * Get file base name without extension
 */
export const getFileBaseName = (filename: string): string => {
  return filename.substring(0, filename.lastIndexOf('.'));
}; 