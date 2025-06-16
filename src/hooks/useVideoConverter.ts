import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { fetchFile } from '@ffmpeg/ffmpeg';
import { getFFmpeg } from './useFFmpeg';
import type {
  VideoFile,
  ConversionOptions,
  ConvertedFile,
  VideoConverterHookReturn,
} from '../types/video';

export const useVideoConverter = (): VideoConverterHookReturn => {
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  
  const abortController = useRef<AbortController | null>(null);
  
  const getOutputFileName = (file: VideoFile, options: ConversionOptions): string => {
    const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    return `${originalName}_converted.${options.outputFormat}`;
  };
  
  const getFFmpegArgs = (
    inputFilename: string,
    outputFilename: string,
    options: ConversionOptions
  ): string[] => {
    const args: string[] = [
      '-i', inputFilename,
      '-y', // Overwrite output files without asking
    ];
    
    // Video codec
    if (options.videoCodec) {
      args.push('-c:v', options.videoCodec);
    }
    
    // Resolution
    if (options.resolution && options.resolution !== 'original') {
      args.push('-vf', `scale=${options.resolution.replace('x', ':')}`);
    }
    
    // Bitrate
    if (options.bitrate) {
      args.push('-b:v', options.bitrate);
    }
    
    // Framerate
    if (options.framerate) {
      args.push('-r', options.framerate);
    }
    
    // Audio codec
    if (options.audioCodec) {
      args.push('-c:a', options.audioCodec);
    }
    
    // Audio channels
    if (options.audioChannels) {
      args.push('-ac', options.audioChannels);
    }
    
    // Audio sample rate
    if (options.audioSampleRate) {
      args.push('-ar', options.audioSampleRate);
    }
    
    // Trim video
    if (options.trimStart || options.trimEnd) {
      if (options.trimStart) {
        args.push('-ss', options.trimStart);
      }
      
      if (options.trimEnd) {
        args.push('-to', options.trimEnd);
      }
    }
    
    // Include audio (or not)
    if (options.includeAudio === false) {
      args.push('-an');
    }
    
    // Compression level
    if (options.compressionLevel === 'low') {
      args.push('-crf', '28');
    } else if (options.compressionLevel === 'medium') {
      args.push('-crf', '23');
    } else if (options.compressionLevel === 'high') {
      args.push('-crf', '18');
    }
    
    // Output filename must be the last argument
    args.push(outputFilename);
    
    return args;
  };
  
  const convert = useCallback(async (files: VideoFile[], options: ConversionOptions) => {
    if (isConverting || files.length === 0) return;
    
    setIsConverting(true);
    setConversionProgress(0);
    setCurrentTask('Initializing conversion...');
    
    // Create a new abort controller
    abortController.current = new AbortController();
    const signal = abortController.current.signal;
    
    // Create a handler for abort signal
    const checkAbort = () => {
      if (signal.aborted) {
        throw new Error('Conversion aborted by user');
      }
    };
    
    const ffmpeg = getFFmpeg();
    
    try {
      const newConvertedFiles: ConvertedFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        if (signal.aborted) break;
        
        const file = files[i];
        const inputFilename = `input_${file.id}`;
        const outputFilename = `output_${file.id}.${options.outputFormat}`;
        
        setCurrentTask(`Processing file ${i + 1} of ${files.length}: ${file.name}`);
        
        // Write the input file to the virtual file system
        checkAbort();
        setCurrentTask(`Loading file ${i + 1} of ${files.length}...`);
        ffmpeg.FS('writeFile', inputFilename, await fetchFile(file.file));
        
        // Set up progress tracking
        let startTime = Date.now();
        let lastProgressUpdate = Date.now();
        
        ffmpeg.setProgress(({ ratio }) => {
          if (ratio < 0) return; // Invalid progress
          
          const progress = Math.round(ratio * 100);
          const overallProgress = Math.round((i / files.length) * 100 + (ratio * 100) / files.length);
          
          // Only update progress every 250ms to avoid excessive re-renders
          const now = Date.now();
          if (now - lastProgressUpdate > 250 || progress >= 100) {
            setConversionProgress(overallProgress);
            lastProgressUpdate = now;
            
            // Calculate estimated time remaining
            if (ratio > 0.05) { // Ignore initial progress which may be unstable
              const elapsedMs = now - startTime;
              const estimatedTotalMs = elapsedMs / ratio;
              const remainingMs = estimatedTotalMs - elapsedMs;
              setEstimatedTimeRemaining(Math.round(remainingMs / 1000));
            }
          }
        });
        
        // Run the FFmpeg command
        checkAbort();
        setCurrentTask(`Converting file ${i + 1} of ${files.length}...`);
        const args = getFFmpegArgs(inputFilename, outputFilename, options);
        await ffmpeg.run(...args);
        
        // Read the output file from the virtual file system
        checkAbort();
        setCurrentTask(`Finalizing file ${i + 1} of ${files.length}...`);
        const data = ffmpeg.FS('readFile', outputFilename);
        
        // Create a Blob from the file data
        const blob = new Blob([data.buffer], { type: `video/${options.outputFormat}` });
        const url = URL.createObjectURL(blob);
        
        // Add to converted files
        const convertedFile: ConvertedFile = {
          id: uuidv4(),
          originalId: file.id,
          name: getOutputFileName(file, options),
          size: blob.size,
          url,
          format: options.outputFormat,
          metadata: {
            // Could extract metadata from the converted file if needed
          },
        };
        
        newConvertedFiles.push(convertedFile);
        
        // Clean up files from the virtual file system
        ffmpeg.FS('unlink', inputFilename);
        ffmpeg.FS('unlink', outputFilename);
      }
      
      setConvertedFiles(prev => [...prev, ...newConvertedFiles]);
      setCurrentTask('Conversion complete!');
    } catch (error) {
      if (!signal.aborted) {
        console.error('Conversion error:', error);
        setCurrentTask(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } else {
        setCurrentTask('Conversion cancelled');
      }
    } finally {
      setIsConverting(false);
      abortController.current = null;
    }
  }, [isConverting]);
  
  const abort = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
      setCurrentTask('Cancelling conversion...');
    }
  }, []);
  
  return {
    isConverting,
    conversionProgress,
    currentTask,
    estimatedTimeRemaining,
    convertedFiles,
    convert,
    abort,
  };
}; 