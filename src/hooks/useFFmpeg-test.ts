import { useState, useCallback, useEffect } from 'react';
import { createFFmpeg } from '@ffmpeg/ffmpeg';
import type { FFmpeg } from '@ffmpeg/ffmpeg';

// Simple singleton approach
let ffmpegInstance: FFmpeg | null = null;
let isLoading = false;
let isLoaded = false;

// Use CDN directly for maximum compatibility
const createFFmpegInstance = () => {
  console.log('Creating simple FFmpeg instance');
  return createFFmpeg({
    log: true,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
    wasmPath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm',
    workerPath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.worker.js',
  });
};

// Simple loading function
const loadFFmpegSimple = async (): Promise<FFmpeg> => {
  if (isLoaded && ffmpegInstance) {
    console.log('FFmpeg already loaded');
    return ffmpegInstance;
  }

  if (isLoading) {
    console.log('FFmpeg is loading, waiting...');
    // Wait for loading to complete
    while (isLoading && !isLoaded) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (isLoaded && ffmpegInstance) {
      return ffmpegInstance;
    }
  }

  isLoading = true;
  console.log('Starting FFmpeg load...');

  try {
    if (!ffmpegInstance) {
      ffmpegInstance = createFFmpegInstance();
    }

    // Simple timeout
    const loadPromise = ffmpegInstance.load();
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Load timeout')), 30000);
    });

    await Promise.race([loadPromise, timeoutPromise]);
    
    console.log('FFmpeg loaded successfully');
    isLoaded = true;
    isLoading = false;
    
    return ffmpegInstance;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    isLoading = false;
    isLoaded = false;
    throw error;
  }
};

// Simple hook
export const useFFmpegTest = () => {
  const [ffmpegLoaded, setFFmpegLoaded] = useState(isLoaded);
  const [ffmpegLoading, setFFmpegLoading] = useState(isLoading);
  const [error, setError] = useState<string | null>(null);

  const loadFFmpeg = useCallback(async () => {
    if (ffmpegLoaded) return;

    try {
      setFFmpegLoading(true);
      setError(null);
      
      await loadFFmpegSimple();
      
      setFFmpegLoaded(true);
      setFFmpegLoading(false);
    } catch (err) {
      console.error('Error loading FFmpeg:', err);
      setError(err instanceof Error ? err.message : 'Failed to load FFmpeg');
      setFFmpegLoading(false);
    }
  }, [ffmpegLoaded]);

  // Auto-load on mount
  useEffect(() => {
    if (!ffmpegLoaded && !ffmpegLoading) {
      loadFFmpeg();
    }
  }, [loadFFmpeg, ffmpegLoaded, ffmpegLoading]);

  const getFFmpegInstance = useCallback(() => {
    if (!ffmpegInstance || !isLoaded) {
      throw new Error('FFmpeg not loaded');
    }
    return ffmpegInstance;
  }, []);

  return {
    isFFmpegLoaded: ffmpegLoaded,
    isFFmpegLoading: ffmpegLoading,
    error,
    loadFFmpeg,
    getFFmpeg: getFFmpegInstance,
  };
};

export default useFFmpegTest; 