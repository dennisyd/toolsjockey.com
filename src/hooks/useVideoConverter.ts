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
    
    // Add movflags only for MP4/MOV containers
    if (options.outputFormat === 'mp4' || options.outputFormat === 'mov') {
      args.push('-movflags', '+faststart'); // Optimize for web playback
    }
    
    // Video codec with fallback
    if (options.videoCodec) {
      args.push('-c:v', options.videoCodec);
    } else {
      // Default codec based on output format
      if (options.outputFormat === 'mp4') {
        args.push('-c:v', 'libx264');
      } else if (options.outputFormat === 'webm') {
        args.push('-c:v', 'libvpx-vp9');
      } else if (options.outputFormat === 'avi') {
        args.push('-c:v', 'libx264');
      } else if (options.outputFormat === 'mov') {
        args.push('-c:v', 'libx264');
      } else {
        // Fallback to libx264 for unknown formats
        args.push('-c:v', 'libx264');
      }
    }
    
    // Resolution
    if (options.resolution && options.resolution !== 'original') {
      args.push('-vf', `scale=${options.resolution.replace('x', ':')}`);
    }
    
    // Bitrate
    if (options.bitrate) {
      args.push('-b:v', options.bitrate);
    }
    
    // Framerate (skip if 'original' is specified or invalid)
    if (options.framerate && options.framerate !== 'original' && !isNaN(Number(options.framerate))) {
      args.push('-r', options.framerate);
    }
    
    // Audio codec with fallback
    if (options.audioCodec) {
      args.push('-c:a', options.audioCodec);
    } else {
      // Default audio codec based on output format
      if (options.outputFormat === 'mp4') {
        args.push('-c:a', 'aac');
      } else if (options.outputFormat === 'webm') {
        args.push('-c:a', 'libopus');
      } else if (options.outputFormat === 'avi') {
        args.push('-c:a', 'aac');
      } else if (options.outputFormat === 'mov') {
        args.push('-c:a', 'aac');
      } else {
        // Fallback to aac for unknown formats
        args.push('-c:a', 'aac');
      }
    }
    
    // Audio channels (skip if 'original' is specified or invalid)
    if (options.audioChannels && 
        options.audioChannels !== 'original' && 
        !isNaN(Number(options.audioChannels))) {
      args.push('-ac', options.audioChannels);
    }
    
    // Audio sample rate (skip if 'original' is specified or invalid)
    if (options.audioSampleRate && 
        options.audioSampleRate !== 'original' && 
        !isNaN(Number(options.audioSampleRate))) {
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
    
    // Compression level (only for h264/h265 codecs and specific formats)
    const videoCodec = options.videoCodec || 'libx264';
    if ((videoCodec.includes('x264') || videoCodec.includes('x265')) && 
        (options.outputFormat === 'mp4' || options.outputFormat === 'mov' || options.outputFormat === 'avi')) {
      if (options.compressionLevel === 'low') {
        args.push('-crf', '28');
      } else if (options.compressionLevel === 'medium') {
        args.push('-crf', '23');
      } else if (options.compressionLevel === 'high') {
        args.push('-crf', '18');
      } else {
        // Default to medium quality
        args.push('-crf', '23');
      }
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
        
        console.log('FFmpeg command args:', args);
        
        // Create a simplified fallback command if the main one might be problematic
        const fallbackArgs = [
          '-i', inputFilename,
          '-y', // Overwrite output files
          '-c:v', 'libx264', // Simple video codec
          '-c:a', 'aac', // Simple audio codec
          '-crf', '23', // Reasonable quality
          outputFilename
        ];
        console.log('Fallback command would be:', fallbackArgs.join(' '));
        
        // Validate command arguments before running
        console.log('Validating FFmpeg arguments:', args);
        for (let j = 0; j < args.length; j++) {
          const arg = args[j];
          if (arg === '-ac' && j + 1 < args.length) {
            const value = args[j + 1];
            if (value === 'original' || isNaN(Number(value))) {
              console.error(`Invalid audio channels value: "${value}". Expected a number.`);
              throw new Error(`Invalid audio channels value: "${value}". Expected a number.`);
            }
          }
          if (arg === '-ar' && j + 1 < args.length) {
            const value = args[j + 1];
            if (value === 'original' || isNaN(Number(value))) {
              console.error(`Invalid audio sample rate value: "${value}". Expected a number.`);
              throw new Error(`Invalid audio sample rate value: "${value}". Expected a number.`);
            }
          }
          if (arg === '-r' && j + 1 < args.length) {
            const value = args[j + 1];
            if (value === 'original' || isNaN(Number(value))) {
              console.error(`Invalid framerate value: "${value}". Expected a number.`);
              throw new Error(`Invalid framerate value: "${value}". Expected a number.`);
            }
          }
        }
        
        try {
          console.log('Running FFmpeg with command:', args.join(' '));
          console.log('Full FFmpeg args array:', args);
          console.log('Input filename:', inputFilename);
          console.log('Output filename:', outputFilename);
          console.log('Options object:', options);
          console.log('Files before conversion:', ffmpeg.FS('readdir', '/'));
          
          let commandSucceeded = false;
          
          try {
            await ffmpeg.run(...args);
            console.log('Main FFmpeg command completed');
            
            // Check immediately if file was created
            const postCommandFiles = ffmpeg.FS('readdir', '/');
            if (postCommandFiles.includes(outputFilename)) {
              console.log('Main command succeeded - output file created');
              commandSucceeded = true;
            } else {
              throw new Error('Main command did not create output file');
            }
          } catch (ffmpegRunError) {
            console.warn('Main FFmpeg command failed, trying fallback:', ffmpegRunError);
            
            // Try the simple fallback command
            console.log('Trying fallback command:', fallbackArgs.join(' '));
            try {
              await ffmpeg.run(...fallbackArgs);
              console.log('Fallback FFmpeg command completed');
              
              // Check if fallback created the file
              const postFallbackFiles = ffmpeg.FS('readdir', '/');
              if (postFallbackFiles.includes(outputFilename)) {
                console.log('Fallback command succeeded - output file created');
                commandSucceeded = true;
              } else {
                throw new Error('Fallback command also did not create output file');
              }
            } catch (fallbackError) {
              console.error('Fallback command also failed:', fallbackError);
              throw new Error('Both main and fallback FFmpeg commands failed');
            }
          }
          
          if (!commandSucceeded) {
            throw new Error('FFmpeg command completed but no output file was created');
          }
          
          // Check if output file was actually created
          const fileList = ffmpeg.FS('readdir', '/');
          console.log('Files in FFmpeg filesystem after conversion:', fileList);
          console.log('Expected output filename:', outputFilename);
          
          if (!fileList.includes(outputFilename)) {
            console.error('Output file not found. Expected:', outputFilename);
            console.error('Available files:', fileList);
            throw new Error(`Output file ${outputFilename} was not created. The conversion may have failed silently.`);
          }
        } catch (ffmpegError) {
          console.error('FFmpeg conversion failed:', ffmpegError);
          
          // Check what files are in the filesystem for debugging
          try {
            const fileList = ffmpeg.FS('readdir', '/');
            console.log('Files in filesystem during error:', fileList);
          } catch (e) {
            console.log('Could not read filesystem during error');
          }
          
          // Provide more specific error messages
          const errorMsg = ffmpegError instanceof Error ? ffmpegError.message : String(ffmpegError);
          if (errorMsg.includes('Expected number')) {
            throw new Error(`Invalid conversion settings: ${errorMsg}. Please check your audio and video settings.`);
          } else if (errorMsg.includes('codec') || errorMsg.includes('format')) {
            throw new Error(`Unsupported format or codec: ${errorMsg}. Try different output settings.`);
          } else if (errorMsg.includes('not created')) {
            throw new Error(`Conversion failed: ${errorMsg}. This usually means the FFmpeg command failed. Please try different settings.`);
          } else {
            throw new Error(`Video conversion failed: ${errorMsg}`);
          }
        }
        
        // Read the output file from the virtual file system
        checkAbort();
        setCurrentTask(`Finalizing file ${i + 1} of ${files.length}...`);
        
        // Check if output file exists before reading
        try {
          const data = ffmpeg.FS('readFile', outputFilename);
          
          // Create a Blob from the file data with multiple fallback strategies
          let blob: Blob;
          try {
            // Strategy 1: Try data.buffer.slice() for proper buffer handling
            if (data.buffer && data.buffer.byteLength > 0) {
              blob = new Blob([data.buffer.slice()], { type: `video/${options.outputFormat}` });
            } else if (data.length > 0) {
              // Strategy 2: Use the data directly if it has length
              blob = new Blob([data], { type: `video/${options.outputFormat}` });
            } else {
              throw new Error('Output file data is empty');
            }
            
            // Validate blob has content
            if (blob.size === 0) {
              throw new Error('Created blob is empty');
            }
          } catch (blobError) {
            // Strategy 3: Fallback with Uint8Array conversion
            console.warn('Blob creation strategy failed, trying fallback:', blobError);
            const uint8Array = new Uint8Array(data);
            blob = new Blob([uint8Array], { type: `video/${options.outputFormat}` });
            
            if (blob.size === 0) {
              throw new Error('All blob creation strategies failed - output file may be corrupted');
            }
          }
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
          
        } catch (fileError) {
          console.error(`Failed to read output file ${outputFilename}:`, fileError);
          throw new Error(`Failed to process converted file: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`);
        } finally {
          // Clean up files from the virtual file system
          try {
            ffmpeg.FS('unlink', inputFilename);
          } catch (e) {
            console.warn('Failed to cleanup input file:', e);
          }
          try {
            ffmpeg.FS('unlink', outputFilename);
          } catch (e) {
            console.warn('Failed to cleanup output file:', e);
          }
        }
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