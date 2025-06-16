import { useState, useCallback, useEffect } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

// Singleton FFmpeg instance
let ffmpegInstance: FFmpeg | null = null;
let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

// Define FFmpeg version and CDN paths to ensure consistency
const FFMPEG_VERSION = '0.11.0';
const CORE_URL = `https://unpkg.com/@ffmpeg/core@${FFMPEG_VERSION}/dist/ffmpeg-core.js`;

export interface FFmpegProcessOptions {
  command: string[];
  outputExtension: string;
  outputMimeType: string;
  onProgress?: (progress: number) => void;
  preparationSteps?: (ffmpeg: FFmpeg) => Promise<void>;
}

// Create and get FFmpeg instance
export const getFFmpeg = (): FFmpeg => {
  if (!ffmpegInstance) {
    ffmpegInstance = createFFmpeg({
      log: true,
      progress: () => {
        // Progress handling is done in the hook
      },
      corePath: CORE_URL,
    });
  }
  return ffmpegInstance;
};

// Helper function to get a more specific error message
const getDetailedErrorMessage = (error: any): string => {
  const errorString = String(error);
  
  // Check for common error patterns
  if (errorString.includes('SharedArrayBuffer')) {
    return 'Your browser doesn\'t fully support the required features. Please try using Chrome or Edge with HTTPS.';
  }
  
  if (errorString.includes('fetch') || errorString.includes('network')) {
    return 'Failed to download video processing engine. Please check your internet connection and try again.';
  }
  
  if (errorString.includes('memory') || errorString.includes('allocation')) {
    return 'Not enough memory available. Try closing other tabs or applications and refresh the page.';
  }
  
  if (errorString.includes('WASM')) {
    return 'Your browser has trouble loading the video processing engine. Try using a different browser like Chrome or Edge.';
  }
  
  if (errorString.includes('lengthBytesUTF8') || errorString.includes('Core')) {
    return 'Video processing engine failed to initialize properly. Please refresh the page and try again.';
  }
  
  // Default message for unknown errors
  return 'Video processing engine failed to load. Please refresh the page and try again.';
};

export const useFFmpeg = () => {
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const [isFFmpegLoading, setIsFFmpegLoading] = useState(false);
  const [ffmpegLoadingProgress, setFFmpegLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Load FFmpeg
  const loadFFmpeg = useCallback(async () => {
    if (ffmpegInstance && isFFmpegLoaded) return;
    
    try {
      setIsFFmpegLoading(true);
      setError(null);
      loadAttempts++;
      
      // If we have an existing instance but it failed, reset it
      if (ffmpegInstance && !isFFmpegLoaded && loadAttempts > 1) {
        ffmpegInstance = null;
      }
      
      const ffmpeg = ffmpegInstance || createFFmpeg({
        log: true,
        progress: ({ ratio }) => {
          setFFmpegLoadingProgress(Math.round(ratio * 100));
        },
        corePath: CORE_URL,
      });
      
      // Ensure WASM is loaded before proceeding
      await ffmpeg.load();
      
      // Test the FFmpeg instance with a simple operation to verify it's working correctly
      try {
        ffmpeg.FS('writeFile', 'test.txt', new Uint8Array([1, 2, 3]));
        ffmpeg.FS('readFile', 'test.txt');
        ffmpeg.FS('unlink', 'test.txt');
      } catch (testErr) {
        console.error('FFmpeg instance test failed:', testErr);
        throw new Error('Failed to initialize FFmpeg properly');
      }
      
      ffmpegInstance = ffmpeg;
      setIsFFmpegLoaded(true);
      setIsFFmpegLoading(false);
      loadAttempts = 0; // Reset attempts on success
    } catch (err) {
      console.error('Error loading FFmpeg:', err);
      
      // Get a more user-friendly error message
      const detailedError = getDetailedErrorMessage(err);
      setError(detailedError);
      
      setIsFFmpegLoading(false);
      
      // If we haven't reached max attempts, try again with a delay
      if (loadAttempts < MAX_LOAD_ATTEMPTS) {
        setTimeout(() => {
          loadFFmpeg();
        }, 2000); // Wait 2 seconds before retrying
      }
    }
  }, [isFFmpegLoaded]);
  
  // Check if FFmpeg is already loaded on mount
  useEffect(() => {
    if (ffmpegInstance) {
      try {
        if (ffmpegInstance.isLoaded()) {
          // Verify the instance is working correctly
          try {
            ffmpegInstance.FS('writeFile', 'test.txt', new Uint8Array([1, 2, 3]));
            ffmpegInstance.FS('readFile', 'test.txt');
            ffmpegInstance.FS('unlink', 'test.txt');
            setIsFFmpegLoaded(true);
          } catch (testErr) {
            console.error('FFmpeg instance verification failed:', testErr);
            // Instance is not working correctly, reload it
            ffmpegInstance = null;
            loadFFmpeg();
          }
        } else {
          loadFFmpeg();
        }
      } catch (err) {
        console.error('Error checking FFmpeg loaded state:', err);
        ffmpegInstance = null;
        loadFFmpeg();
      }
    } else {
      loadFFmpeg();
    }
  }, [loadFFmpeg]);
  
  // Process a file with FFmpeg
  const processFile = useCallback(async (
    file: File,
    options: FFmpegProcessOptions
  ) => {
    if (!ffmpegInstance) {
      throw new Error('FFmpeg not loaded');
    }
    
    const { command, outputExtension, outputMimeType, preparationSteps } = options;
    const ffmpeg = ffmpegInstance;
    
    // Prepare input file name
    const inputFileName = 'input' + (file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '');
    const outputFileName = `output.${outputExtension}`;
    
    try {
      // Write the input file to memory using fetchFile for better compatibility
      ffmpeg.FS('writeFile', inputFileName, await fetchFile(file));
      
      // Run any preparation steps if provided
      if (preparationSteps) {
        await preparationSteps(ffmpeg);
      }
      
      // Run FFmpeg command
      await ffmpeg.run(
        '-i', inputFileName,
        ...command,
        outputFileName
      );
      
      // Read the output file
      const data = ffmpeg.FS('readFile', outputFileName);
      
      // Create a blob URL
      const blob = new Blob([data.buffer], { type: outputMimeType });
      const url = URL.createObjectURL(blob);
      
      // Clean up
      try {
        ffmpeg.FS('unlink', inputFileName);
        ffmpeg.FS('unlink', outputFileName);
      } catch (e) {
        console.warn('Error cleaning up FFmpeg files:', e);
      }
      
      return {
        url,
        size: blob.size,
        filename: outputFileName,
      };
    } catch (err) {
      console.error('Error processing file with FFmpeg:', err);
      throw err;
    }
  }, []);
  
  // Function to retry loading FFmpeg
  const retryLoadFFmpeg = useCallback(() => {
    // Reset the instance to force a clean reload
    ffmpegInstance = null;
    loadAttempts = 0;
    loadFFmpeg();
  }, [loadFFmpeg]);
  
  return {
    isFFmpegLoaded,
    isFFmpegLoading,
    ffmpegLoadingProgress,
    loadFFmpeg,
    retryLoadFFmpeg,
    getFFmpeg,
    processFile,
    error,
  };
};