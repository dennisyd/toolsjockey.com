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

    // Generate unique IDs for input and output files
    const uniqueId = uuidv4();
    const inputFileName = `input-${uniqueId}${getFileExtension(file.name)}`;
    const outputFileName = `output-${uniqueId}.${options.outputExtension}`;

    console.log(`Processing video: Input=${inputFileName}, Output=${outputFileName}`);

    try {
      const ffmpeg = getFFmpeg();

      // Check if this is a concat operation (for video merging)
      const isConcat = options.command.includes('-f') && 
                       options.command.includes('concat') && 
                       options.command.includes('concat.txt');
      
      // Only write the input file if we're not using concat mode
      // (for concat, the files are already written in the VideoMerger component)
      if (!isConcat) {
        // Write file to memory
        setCurrentTask('Loading video...');
        console.log(`Writing input file: ${inputFileName}`);
        ffmpeg.FS('writeFile', inputFileName, await fetchFile(file));
        
        // Verify the file was written
        try {
          const fileList = ffmpeg.FS('readdir', '/');
          if (!fileList.includes(inputFileName)) {
            throw new Error(`Failed to write input file ${inputFileName}`);
          }
          console.log(`Input file written successfully: ${inputFileName}`);
        } catch (readErr) {
          console.error('Error verifying input file:', readErr);
          throw new Error(`Failed to verify input file: ${readErr instanceof Error ? readErr.message : 'Unknown error'}`);
        }
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
      
      // Prepare the command with proper input file reference
      const finalCommand: string[] = [];
      
      // Process the command array to replace any 'input' placeholders with the actual input filename
      for (let i = 0; i < options.command.length; i++) {
        if (options.command[i] === '-i' && i + 1 < options.command.length && options.command[i + 1] === 'input') {
          finalCommand.push('-i', inputFileName);
          i++; // Skip the 'input' placeholder
        } else {
          finalCommand.push(options.command[i]);
        }
      }
      
      // Log the final command for debugging
      console.log('Running FFmpeg command:', isConcat ? 
        [...finalCommand, outputFileName].join(' ') : 
        (!finalCommand.includes('-i') ? 
          ['-i', inputFileName, ...finalCommand, outputFileName].join(' ') : 
          [...finalCommand, outputFileName].join(' ')
        )
      );
      
      if (isConcat) {
        // For concat operations, we don't need the input file parameter
        await ffmpeg.run(...finalCommand, outputFileName);
      } else if (!finalCommand.includes('-i')) {
        // If no input parameter was provided in the command, add it
        await ffmpeg.run('-i', inputFileName, ...finalCommand, outputFileName);
      } else {
        // Input is already in the command
        await ffmpeg.run(...finalCommand, outputFileName);
      }

      // Read the result
      setCurrentTask('Finalizing...');
      
      // Check if the output file exists before trying to read it
      const fileList = ffmpeg.FS('readdir', '/');
      console.log('Files in FFmpeg filesystem after processing:', fileList);
      
      if (!fileList.includes(outputFileName)) {
        throw new Error(`Output file ${outputFileName} was not created. This could be due to an FFmpeg error.`);
      }
      
      console.log(`Reading output file: ${outputFileName}`);
      const data = ffmpeg.FS('readFile', outputFileName);
      console.log(`Output file read successfully, size: ${data.length} bytes`);

      // Create blob from the processed file - ensure we use the correct buffer
      let blob: Blob;
      if (data.buffer && data.buffer.byteLength > 0) {
        // If data has a buffer property, use it
        blob = new Blob([data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)], { 
          type: options.outputMimeType 
        });
      } else if (data instanceof Uint8Array) {
        // If data is a Uint8Array, create blob directly
        blob = new Blob([data], { type: options.outputMimeType });
      } else {
        // Fallback: convert to Uint8Array first
        const uint8Array = new Uint8Array(data);
        blob = new Blob([uint8Array], { type: options.outputMimeType });
      }
      
      console.log(`Blob created successfully, size: ${blob.size} bytes`);
      
      // Verify blob has content
      if (blob.size === 0) {
        console.error('Created blob has 0 size, this indicates an issue with file processing');
        throw new Error('Processed file is empty. This might indicate an FFmpeg processing error.');
      }
      
      const url = URL.createObjectURL(blob);

      // Clean up files from memory
      try {
        if (!isConcat && fileList.includes(inputFileName)) {
          console.log(`Removing input file: ${inputFileName}`);
          ffmpeg.FS('unlink', inputFileName);
        }
        
        if (fileList.includes(outputFileName)) {
          console.log(`Removing output file: ${outputFileName}`);
          ffmpeg.FS('unlink', outputFileName);
        }
      } catch (cleanupErr) {
        console.warn('Error cleaning up FFmpeg files:', cleanupErr);
        // Continue despite cleanup errors
      }

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
      console.error('Video processing error:', err);
      setError(errorMessage);
      
      // Try to clean up any files that might have been created
      try {
        const ffmpeg = getFFmpeg();
        const fileList = ffmpeg.FS('readdir', '/');
        console.log('Files in FFmpeg filesystem during error cleanup:', fileList);
        
        if (fileList.includes(inputFileName)) {
          console.log(`Cleaning up input file: ${inputFileName}`);
          ffmpeg.FS('unlink', inputFileName);
        }
        
        if (fileList.includes(outputFileName)) {
          console.log(`Cleaning up output file: ${outputFileName}`);
          ffmpeg.FS('unlink', outputFileName);
        }
      } catch (cleanupErr) {
        console.warn('Error during error cleanup:', cleanupErr);
      }
      
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