import { useState } from 'react';
import { getFFmpeg } from './useFFmpeg';
import { fetchFile } from '@ffmpeg/ffmpeg';
import { v4 as uuidv4 } from 'uuid';

interface ProcessingOptions {
  command: string[];
  outputExtension: string;
  outputMimeType: string;
  onProgress?: (progress: number) => void;
}

interface ProcessingResult {
  url: string;
  blob: Blob;
  filename: string;
  size: number;
}

export const useVideoProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [error, setError] = useState<string | null>(null);

  const processVideo = async (
    file: File,
    options: ProcessingOptions
  ): Promise<ProcessingResult> => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentTask('Initializing...');
    setError(null);

    try {
      const ffmpeg = getFFmpeg();
      const inputFileName = `input-${uuidv4()}${getFileExtension(file.name)}`;
      const outputFileName = `output-${uuidv4()}.${options.outputExtension}`;

      // Check if this is a concat operation (for video merging)
      const isConcat = options.command.includes('-f') && 
                       options.command.includes('concat') && 
                       options.command.includes('concat.txt');
      
      // Only write the input file if we're not using concat mode
      // (for concat, the files are already written in the VideoMerger component)
      if (!isConcat) {
        // Write file to memory
        setCurrentTask('Loading video...');
        ffmpeg.FS('writeFile', inputFileName, await fetchFile(file));
      }

      // Set up progress handler
      ffmpeg.setProgress(({ ratio }) => {
        if (ratio >= 0) {
          const percent = Math.round(ratio * 100);
          setProgress(percent);
          options.onProgress?.(percent);
        }
      });

      // Run FFmpeg command
      setCurrentTask('Processing video...');
      
      if (isConcat) {
        // For concat operations, we don't need the input file parameter
        await ffmpeg.run(...options.command, outputFileName);
      } else {
        // For normal operations, use the input file
        await ffmpeg.run('-i', inputFileName, ...options.command, outputFileName);
      }

      // Read the result
      setCurrentTask('Finalizing...');
      const data = ffmpeg.FS('readFile', outputFileName);

      // Create blob from the processed file
      const blob = new Blob([data.buffer], { type: options.outputMimeType });
      const url = URL.createObjectURL(blob);

      // Clean up files from memory
      if (!isConcat) {
        ffmpeg.FS('unlink', inputFileName);
      }
      ffmpeg.FS('unlink', outputFileName);

      setProgress(100);
      setCurrentTask('Processing complete');

      return {
        url,
        blob,
        filename: getOutputFilename(file.name, options.outputExtension),
        size: blob.size,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(`Video processing failed: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to get file extension
  const getFileExtension = (filename: string): string => {
    return filename.substring(filename.lastIndexOf('.'));
  };

  // Helper function to generate output filename
  const getOutputFilename = (originalName: string, newExtension: string): string => {
    const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
    return `${baseName}_processed.${newExtension}`;
  };

  return {
    processVideo,
    isProcessing,
    progress,
    currentTask,
    error,
  };
};

// Common FFmpeg commands
export const ffmpegCommands = {
  // Video clipper commands
  clip: (startTime: number, duration: number) => [
    '-ss', startTime.toString(),
    '-t', duration.toString(),
    '-c', 'copy'
  ],
  
  // Video compressor commands
  compress: {
    high: ['-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-c:a', 'aac', '-b:a', '128k'],
    medium: ['-c:v', 'libx264', '-crf', '23', '-preset', 'medium', '-c:a', 'aac', '-b:a', '128k'],
    low: ['-c:v', 'libx264', '-crf', '28', '-preset', 'fast', '-c:a', 'aac', '-b:a', '96k'],
  },
  
  // Video to GIF commands
  gif: (fps: number, scale: string) => [
    '-vf', `fps=${fps},scale=${scale}:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
    '-loop', '0'
  ],
  
  // Frame extractor commands
  extractFrame: (time: number) => [
    '-ss', time.toString(),
    '-vframes', '1'
  ],
  
  extractFrames: (interval: number) => [
    '-vf', `fps=1/${interval}`
  ],
  
  // Audio extractor commands
  extractAudio: {
    mp3: ['-vn', '-acodec', 'mp3', '-ab', '192k'],
    wav: ['-vn', '-acodec', 'pcm_s16le'],
    aac: ['-vn', '-acodec', 'aac', '-ab', '128k'],
    ogg: ['-vn', '-acodec', 'libvorbis', '-ab', '128k'],
  },
}; 