import { useState, useCallback, useEffect } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

// Singleton FFmpeg instance and loading state
let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;
let isLoaded = false;
let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 5;

// Define local paths for FFmpeg core files
// Use local files instead of CDN to avoid network issues
const CORE_URL = '/ffmpeg-core.js';
const WASM_URL = '/ffmpeg-core.wasm';
const WORKER_URL = '/ffmpeg-core.worker.js';

// CDN fallback URLs
const CDN_CORE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js';
const CDN_WASM_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm';
const CDN_WORKER_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.worker.js';

// Track loading progress
let currentLoadingProgress = 0;
let usingCDN = false;

// Check if FFmpeg core files exist with better error handling
const checkFFmpegFilesExist = async (useCDN = false): Promise<boolean> => {
  const coreUrl = useCDN ? CDN_CORE_URL : CORE_URL;
  const wasmUrl = useCDN ? CDN_WASM_URL : WASM_URL;
  const workerUrl = useCDN ? CDN_WORKER_URL : WORKER_URL;
  
  try {
    console.log(`Checking FFmpeg files existence (CDN: ${useCDN})`);
    
    // Use a more robust check that also validates file size
    const [coreResponse, wasmResponse, workerResponse] = await Promise.all([
      fetch(coreUrl, { method: 'HEAD' }),
      fetch(wasmUrl, { method: 'HEAD' }),
      fetch(workerUrl, { method: 'HEAD' })
    ]);
    
    const allFilesExist = coreResponse.ok && wasmResponse.ok && workerResponse.ok;
    
    if (allFilesExist) {
      // Check if WASM file has reasonable size (should be > 1MB)
      const wasmSize = wasmResponse.headers.get('content-length');
      if (wasmSize && parseInt(wasmSize) < 1000000) {
        console.warn('WASM file seems too small, might be corrupted');
        return false;
      }
      console.log(`FFmpeg files check passed (CDN: ${useCDN})`);
    } else {
      console.log(`FFmpeg files check failed (CDN: ${useCDN})`);
    }
    
    return allFilesExist;
  } catch (error) {
    console.error(`Error checking FFmpeg files (CDN: ${useCDN}):`, error);
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
export const getFFmpeg = (forceCDN = false): FFmpeg => {
  if (!ffmpegInstance || (forceCDN && !usingCDN)) {
    const coreUrl = forceCDN ? CDN_CORE_URL : CORE_URL;
    const wasmUrl = forceCDN ? CDN_WASM_URL : WASM_URL;
    const workerUrl = forceCDN ? CDN_WORKER_URL : WORKER_URL;
    
    usingCDN = forceCDN;
    
    console.log(`Creating FFmpeg instance (CDN: ${forceCDN})`);
    
    ffmpegInstance = createFFmpeg({
      log: true,
      progress: ({ ratio }) => {
        if (ratio >= 0 && ratio <= 1) {
          currentLoadingProgress = Math.round(10 + (ratio * 80)); // Progress from 10% to 90%
          console.log(`FFmpeg loading progress: ${currentLoadingProgress}%`);
        }
      },
      corePath: coreUrl,
      wasmPath: wasmUrl,
      workerPath: workerUrl,
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
  
  if (errorString.includes('timed out')) {
    return 'Loading timed out. This could be due to a slow network connection. Please try again or use a different network.';
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
        console.log('FFmpeg is already loaded and working properly');
        return;
      }
    } catch (e) {
      console.warn('FFmpeg instance claimed to be loaded but isLoaded() check failed:', e);
      // Reset the state since the instance isn't working properly
      isLoaded = false;
      ffmpegInstance = null;
      // Continue with loading if the check failed
    }
  }
  
  // If currently loading, return the existing promise
  if (isLoading && loadingPromise) {
    console.log('FFmpeg is already loading, waiting for existing promise');
    return loadingPromise;
  }
  
  // Start loading
  isLoading = true;
  currentLoadingProgress = 0;
  console.log('Starting FFmpeg loading process');
  
  loadingPromise = new Promise<void>(async (resolve, reject) => {
    // Create a timeout to prevent infinite loading (increased for production)
    const timeout = setTimeout(() => {
      console.error('FFmpeg loading timed out after 90 seconds');
      reject(new Error('Loading timed out. Please refresh the page and try again.'));
    }, 90000); // Increased from 60s to 90s for production
    
    try {
      loadAttempts++;
      console.log(`FFmpeg load attempt ${loadAttempts}/${MAX_LOAD_ATTEMPTS}`);
      currentLoadingProgress = 2;
      
      // First, try to check local files
      console.log('Checking local FFmpeg files...');
      let filesExist = await checkFFmpegFilesExist(false);
      let useCDN = false;
      
      if (!filesExist) {
        console.log('Local files not found, checking CDN...');
        currentLoadingProgress = 5;
        filesExist = await checkFFmpegFilesExist(true);
        useCDN = true;
        
        if (!filesExist) {
          console.error('Neither local nor CDN FFmpeg files are accessible');
          throw new Error('FFmpeg core files not accessible. This could be due to a network issue or deployment problem.');
        } else {
          console.log('CDN files are accessible, will use CDN');
        }
      } else {
        console.log('Local files are accessible');
      }
      
      currentLoadingProgress = 8;
      
      // Create FFmpeg instance with appropriate URLs
      try {
        ffmpegInstance = getFFmpeg(useCDN);
        console.log(`FFmpeg instance created (using ${useCDN ? 'CDN' : 'local'} files)`);
      } catch (instanceError) {
        console.error('Error creating FFmpeg instance:', instanceError);
        throw new Error('Failed to create FFmpeg instance');
      }
      
      // Check if FFmpeg is already loaded
      let alreadyLoaded = false;
      try {
        alreadyLoaded = ffmpegInstance.isLoaded();
        console.log('FFmpeg isLoaded check:', alreadyLoaded);
      } catch (e) {
        console.log('Error checking if FFmpeg is loaded:', e);
        alreadyLoaded = false;
      }
      
      currentLoadingProgress = 10;
      
      // Only load if not already loaded
      if (!alreadyLoaded) {
        try {
          console.log('Starting FFmpeg.load() operation...');
          
          // Add more detailed progress tracking
          const loadPromise = ffmpegInstance.load();
          
          // Create a more sophisticated timeout with progress checks
          const timeoutPromise = new Promise<never>((_, reject) => {
            let progressStuckTime = 0;
            let lastProgress = currentLoadingProgress;
            
            const progressCheck = setInterval(() => {
              if (currentLoadingProgress === lastProgress) {
                progressStuckTime += 2000;
                console.log(`Progress stuck at ${currentLoadingProgress}% for ${progressStuckTime/1000}s`);
                
                if (progressStuckTime >= 30000) { // 30 seconds stuck
                  clearInterval(progressCheck);
                  reject(new Error('FFmpeg loading appears to be stuck. This could be due to network issues or browser limitations.'));
                }
              } else {
                progressStuckTime = 0;
                lastProgress = currentLoadingProgress;
              }
            }, 2000);
            
            setTimeout(() => {
              clearInterval(progressCheck);
              reject(new Error('FFmpeg load operation timed out after 60 seconds'));
            }, 60000);
          });
          
          await Promise.race([loadPromise, timeoutPromise]);
          
          console.log('FFmpeg.load() completed successfully');
          currentLoadingProgress = 90;
        } catch (loadError) {
          console.error('Error in FFmpeg.load():', loadError);
          
          // Special handling for "already loaded" error
          if (String(loadError).includes('ffmpeg.wasm was loaded')) {
            console.log('FFmpeg was already loaded, continuing...');
            alreadyLoaded = true;
            currentLoadingProgress = 90;
          } else {
            // If local files failed and we haven't tried CDN yet, try CDN
            if (!useCDN && loadAttempts === 1) {
              console.log('Local loading failed, will retry with CDN');
              ffmpegInstance = null;
              isLoading = false;
              loadingPromise = null;
              throw new Error('RETRY_WITH_CDN');
            }
            throw loadError;
          }
        }
      } else {
        currentLoadingProgress = 90;
      }
      
      // Test the FFmpeg instance with a simple operation to verify it's working correctly
      try {
        console.log('Testing FFmpeg instance functionality...');
        const testData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello" in bytes
        ffmpegInstance.FS('writeFile', 'test.txt', testData);
        const readData = ffmpegInstance.FS('readFile', 'test.txt');
        
        if (readData.length !== testData.length) {
          throw new Error('File read/write test failed');
        }
        
        ffmpegInstance.FS('unlink', 'test.txt');
        console.log('FFmpeg instance test passed');
        currentLoadingProgress = 100;
      } catch (testErr) {
        console.error('FFmpeg instance test failed:', testErr);
        throw new Error('FFmpeg failed functionality test. The engine may not be properly initialized.');
      }
      
      isLoaded = true;
      loadAttempts = 0; // Reset attempts on success
      clearTimeout(timeout);
      console.log(`FFmpeg loaded successfully (using ${useCDN ? 'CDN' : 'local'} files)`);
      resolve();
      
    } catch (err) {
      console.error('Error loading FFmpeg:', err);
      isLoaded = false;
      
      // Special handling for CDN retry
      if (String(err).includes('RETRY_WITH_CDN')) {
        clearTimeout(timeout);
        console.log('Retrying with CDN fallback...');
        setTimeout(() => {
          loadFFmpegOnce().then(resolve).catch(reject);
        }, 1000);
        return;
      }
      
      // If we haven't reached max attempts, try again with a delay
      if (loadAttempts < MAX_LOAD_ATTEMPTS) {
        console.log(`Retrying FFmpeg load (attempt ${loadAttempts}/${MAX_LOAD_ATTEMPTS})`);
        clearTimeout(timeout);
        setTimeout(() => {
          isLoading = false;
          loadingPromise = null;
          loadFFmpegOnce().then(resolve).catch(reject);
        }, 3000); // Increased delay for production
      } else {
        clearTimeout(timeout);
        reject(err);
      }
    } finally {
      if (!isLoaded) {
        isLoading = false;
        loadingPromise = null;
      }
    }
  });
  
  return loadingPromise;
};

export const useFFmpeg = () => {
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(isLoaded);
  const [isFFmpegLoading, setIsFFmpegLoading] = useState(isLoading);
  const [ffmpegLoadingProgress, setFFmpegLoadingProgress] = useState(currentLoadingProgress);
  const [error, setError] = useState<string | null>(null);
  
  // Update progress periodically when loading
  useEffect(() => {
    if (isFFmpegLoading) {
      const progressInterval = setInterval(() => {
        setFFmpegLoadingProgress(currentLoadingProgress);
      }, 500);
      
      return () => clearInterval(progressInterval);
    }
  }, [isFFmpegLoading]);
  
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
      setFFmpegLoadingProgress(100);
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
      setFFmpegLoadingProgress(100);
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
    currentLoadingProgress = 0;
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