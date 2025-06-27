import { useState, useCallback, useEffect } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

// Singleton FFmpeg instance and loading state
let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;
let isLoaded = false;
let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

// Define local paths for FFmpeg core files
// Use local files instead of CDN to avoid network issues
const CORE_URL = '/ffmpeg-core.js';
const WASM_URL = '/ffmpeg-core.wasm';
const WORKER_URL = '/ffmpeg-core.worker.js';

// Check if FFmpeg core files exist
const checkFFmpegFilesExist = async (): Promise<boolean> => {
  try {
    const coreResponse = await fetch(CORE_URL, { method: 'HEAD' });
    const wasmResponse = await fetch(WASM_URL, { method: 'HEAD' });
    const workerResponse = await fetch(WORKER_URL, { method: 'HEAD' });
    
    return coreResponse.ok && wasmResponse.ok && workerResponse.ok;
  } catch (error) {
    console.error('Error checking FFmpeg files:', error);
    return false;
  }
};

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
      wasmPath: WASM_URL,
      workerPath: WORKER_URL,
    });
  }
  return ffmpegInstance;
};

// Detect browser
const detectBrowser = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('chrome') > -1) return 'Chrome';
  if (userAgent.indexOf('firefox') > -1) return 'Firefox';
  if (userAgent.indexOf('edg') > -1) return 'Edge';
  if (userAgent.indexOf('safari') > -1) return 'Safari';
  return 'Unknown';
};

// Helper function to get a more specific error message
const getDetailedErrorMessage = (error: any): string => {
  const errorString = String(error);
  const currentBrowser = detectBrowser();
  const isSupportedBrowser = ['Chrome', 'Edge', 'Firefox'].includes(currentBrowser);
  
  // Check for common error patterns
  if (errorString.includes('SharedArrayBuffer')) {
    if (isSupportedBrowser) {
      return `Your browser (${currentBrowser}) supports video processing, but may not be running in a secure context. The converter will use a fallback method which may be slower but should still work.`;
    }
    return `Your browser doesn't fully support the required features. Please try using Chrome, Edge, or Firefox.`;
  }
  
  if (errorString.includes('ERR_CACHE_WRITE_FAILURE') || errorString.includes('Failed to fetch')) {
    return 'Unable to load video processing engine. This could be due to a network issue or content blockers. Please check your internet connection, disable any ad blockers, and try again.';
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
  
  if (errorString.includes('ffmpeg.wasm was loaded')) {
    return 'Video processing engine is already loaded. This is likely a temporary issue. Please try your operation again.';
  }
  
  // Default message for unknown errors
  return 'Video processing engine failed to load. Please refresh the page and try again.';
};

// Global loading function that returns a promise
let loadingPromise: Promise<void> | null = null;

// Function to safely load FFmpeg once
const loadFFmpegOnce = async (): Promise<void> => {
  // If already loaded, return immediately
  if (isLoaded && ffmpegInstance) {
    try {
      // Double check that the instance is actually working
      if (ffmpegInstance.isLoaded()) {
        return;
      }
    } catch (e) {
      console.warn('FFmpeg instance claimed to be loaded but isLoaded() check failed:', e);
      // Continue with loading if the check failed
    }
  }
  
  // If currently loading, return the existing promise
  if (isLoading && loadingPromise) {
    return loadingPromise;
  }
  
  // Start loading
  isLoading = true;
  
  loadingPromise = new Promise<void>(async (resolve, reject) => {
    try {
      // First check if FFmpeg core files exist
      const filesExist = await checkFFmpegFilesExist();
      if (!filesExist) {
        throw new Error('FFmpeg core files not found. This could be due to a deployment issue.');
      }
      
      loadAttempts++;
      
      // Create FFmpeg instance if it doesn't exist
      if (!ffmpegInstance) {
        ffmpegInstance = createFFmpeg({
          log: true,
          progress: () => {
            // Progress handling is done in the hook
          },
          corePath: CORE_URL,
          wasmPath: WASM_URL,
          workerPath: WORKER_URL,
        });
      }
      
      // Check if FFmpeg is already loaded
      let alreadyLoaded = false;
      try {
        alreadyLoaded = ffmpegInstance.isLoaded();
      } catch (e) {
        console.log('Error checking if FFmpeg is loaded:', e);
        alreadyLoaded = false;
      }
      
      // Only load if not already loaded
      if (!alreadyLoaded) {
        try {
          await ffmpegInstance.load();
        } catch (loadError) {
          // Special handling for "already loaded" error
          if (String(loadError).includes('ffmpeg.wasm was loaded')) {
            console.log('FFmpeg was already loaded, continuing...');
            alreadyLoaded = true;
          } else {
            throw loadError;
          }
        }
      }
      
      // Test the FFmpeg instance with a simple operation to verify it's working correctly
      try {
        ffmpegInstance.FS('writeFile', 'test.txt', new Uint8Array([1, 2, 3]));
        ffmpegInstance.FS('readFile', 'test.txt');
        ffmpegInstance.FS('unlink', 'test.txt');
      } catch (testErr) {
        console.error('FFmpeg instance test failed:', testErr);
        throw new Error('Failed to initialize FFmpeg properly');
      }
      
      isLoaded = true;
      loadAttempts = 0; // Reset attempts on success
      resolve();
    } catch (err) {
      console.error('Error loading FFmpeg:', err);
      isLoaded = false;
      
      // If we haven't reached max attempts, try again with a delay
      if (loadAttempts < MAX_LOAD_ATTEMPTS) {
        setTimeout(() => {
          isLoading = false;
          loadingPromise = null;
          loadFFmpegOnce().then(resolve).catch(reject);
        }, 2000); // Wait 2 seconds before retrying
      } else {
        reject(err);
      }
    } finally {
      isLoading = false;
      loadingPromise = null;
    }
  });
  
  return loadingPromise;
};

export const useFFmpeg = () => {
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(isLoaded);
  const [isFFmpegLoading, setIsFFmpegLoading] = useState(isLoading);
  const [ffmpegLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Load FFmpeg
  const loadFFmpeg = useCallback(async () => {
    // If already loaded in this component, return immediately
    if (isFFmpegLoaded) return;
    
    try {
      setIsFFmpegLoading(true);
      setError(null);
      
      await loadFFmpegOnce();
      
      setIsFFmpegLoaded(true);
      setIsFFmpegLoading(false);
    } catch (err) {
      console.error('Error in useFFmpeg hook:', err);
      
      // Get a more user-friendly error message
      const detailedError = getDetailedErrorMessage(err);
      setError(detailedError);
      
      setIsFFmpegLoading(false);
    }
  }, [isFFmpegLoaded]);
  
  // Check if FFmpeg is already loaded on mount
  useEffect(() => {
    // If already loaded globally, just update state
    if (isLoaded && ffmpegInstance) {
      setIsFFmpegLoaded(true);
      return;
    }
    
    // Otherwise, load FFmpeg
    loadFFmpeg();
  }, [loadFFmpeg]);
  
  // Process a file with FFmpeg
  const processFile = useCallback(async (
    file: File,
    options: FFmpegProcessOptions
  ) => {
    if (!ffmpegInstance || !isLoaded) {
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
    isLoaded = false;
    isLoading = false;
    loadingPromise = null;
    loadAttempts = 0;
    loadFFmpeg();
  }, [loadFFmpeg]);
  
  return {
    isFFmpegLoaded,
    isFFmpegLoading,
    ffmpegLoadingProgress,
    error,
    loadFFmpeg,
    processFile,
    retryLoadFFmpeg,
  };
};