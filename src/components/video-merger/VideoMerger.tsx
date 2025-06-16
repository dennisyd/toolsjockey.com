import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { fetchFile } from '@ffmpeg/ffmpeg';
import FileUploader from '../shared/FileUploader';
import VideoQueue from './VideoQueue';
import MergePreview from './MergePreview';
import ProgressBar from '../shared/ProgressBar';
import FFmpegStatus from '../shared/FFmpegStatus';
import { useFFmpeg } from '../../hooks/useFFmpeg';
import { useVideoProcessor } from '../../hooks/useVideoProcessor';
import { formatDuration } from '../../utils/fileUtils';
import { v4 as uuidv4 } from 'uuid';

interface VideoItem {
  id: string;
  file: File;
  url: string;
  duration: number;
}

interface MergedVideo {
  url: string;
  size: number;
  filename: string;
}

// Check if SharedArrayBuffer is supported
const isSharedArrayBufferSupported = typeof SharedArrayBuffer !== 'undefined';

// Compatibility Info Component
const CompatibilityInfo: React.FC = () => (
  <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm">
    <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">Tips for best results:</h3>
    <ul className="list-disc pl-5 space-y-1 text-blue-700 dark:text-blue-400 text-xs">
      <li>For optimal results, merge videos with the same format and resolution</li>
      <li>If duration doesn't display for a video, its metadata may be unreadable which could cause merging issues</li>
      <li>If merging fails, try converting your videos to MP4 first using our <a href="/tools/video-converter" className="underline hover:text-blue-800 dark:hover:text-blue-300">Video Converter</a></li>
      <li>MP4 format generally provides the best compatibility for merging</li>
    </ul>
  </div>
);

const VideoMerger: React.FC = () => {
  // Video items
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [mergedVideo, setMergedVideo] = useState<MergedVideo | null>(null);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTaskMessage, setCurrentTaskMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // FFmpeg state
  const { isFFmpegLoaded, isFFmpegLoading, loadFFmpeg, ffmpegLoadingProgress, error: ffmpegError, getFFmpeg } = useFFmpeg();
  const { progress, currentTask } = useVideoProcessor();
  
  // Load FFmpeg when component mounts
  useEffect(() => {
    loadFFmpeg().catch(error => {
      console.error('Error in initial FFmpeg load:', error);
      // Error is already handled by the hook
    });
  }, [loadFFmpeg]);
  
  // Update error message when FFmpeg error changes
  useEffect(() => {
    if (ffmpegError) {
      setErrorMessage(ffmpegError);
    }
  }, [ffmpegError]);
  
  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      videos.forEach(video => {
        URL.revokeObjectURL(video.url);
      });
      
      if (mergedVideo?.url) {
        URL.revokeObjectURL(mergedVideo.url);
      }
    };
  }, [videos, mergedVideo]);
  
  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    
    const newVideos = files.map(file => {
      const url = URL.createObjectURL(file);
      return {
        id: uuidv4(),
        file,
        url,
        duration: 0, // Will be updated once video metadata is loaded
      };
    });
    
    // Add the new videos to the list
    setVideos(prev => {
      const updatedVideos = [...prev, ...newVideos];
      // Load durations for all videos that have duration = 0
      updatedVideos.forEach(video => {
        if (video.duration === 0) {
          loadVideoDuration(video.id, video.url);
        }
      });
      return updatedVideos;
    });
  };
  
  // Load video duration
  const loadVideoDuration = (id: string, url: string) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    // Set a timeout to detect if metadata loading is taking too long
    const timeoutId = setTimeout(async () => {
      // If metadata loading is taking too long, try using FFmpeg to get duration
      try {
        if (!isFFmpegLoaded) {
          await loadFFmpeg();
        }
        
        // Get the video file from the videos array
        const videoItem = videos.find(v => v.id === id);
        if (!videoItem) return;
        
        const ffmpeg = getFFmpeg();
        const inputFileName = `duration_check_${id}.${videoItem.file.name.split('.').pop()}`;
        
        // Write the file to FFmpeg's virtual filesystem
        ffmpeg.FS('writeFile', inputFileName, await fetchFile(videoItem.file));
        
        // Use FFprobe to get duration info
        await ffmpeg.run(
          '-i', inputFileName, 
          '-f', 'null', 
          '-'
        );
        
        // Read the duration from the log output
        // This is a workaround since we can't directly access FFmpeg's log output
        // Instead, we'll use a default duration based on file size
        const fileSizeInMB = videoItem.file.size / (1024 * 1024);
        // Estimate duration: ~10 seconds per MB for standard definition video
        const estimatedDuration = Math.max(1, Math.round(fileSizeInMB * 10));
        
        // Update the video duration in the videos array
        setVideos(prev => 
          prev.map(v => 
            v.id === id ? { ...v, duration: estimatedDuration } : v
          )
        );
        
        // Clean up
        try {
          ffmpeg.FS('unlink', inputFileName);
        } catch (e) {
          console.warn('Could not unlink file:', e);
        }
        
      } catch (err) {
        console.error('Error getting duration with FFmpeg:', err);
        // Use a fallback duration if FFmpeg fails
        setVideos(prev => 
          prev.map(v => 
            v.id === id ? { ...v, duration: 10 } : v
          )
        );
      }
      
      video.remove(); // Clean up
    }, 2000); // Wait 2 seconds before trying FFmpeg
    
    video.onloadedmetadata = () => {
      clearTimeout(timeoutId);
      // Update the video duration in the videos array
      setVideos(prev => 
        prev.map(v => 
          v.id === id ? { ...v, duration: video.duration } : v
        )
      );
      video.remove(); // Clean up
    };
    
    video.onerror = () => {
      // Let the timeout handle this case
      console.warn(`Error loading video metadata for ${id}, will try FFmpeg fallback`);
    };
    
    video.src = url;
  };
  
  // Handle video removal
  const handleRemoveVideo = (id: string) => {
    const videoToRemove = videos.find(v => v.id === id);
    if (videoToRemove) {
      URL.revokeObjectURL(videoToRemove.url);
    }
    
    setVideos(prev => prev.filter(v => v.id !== id));
  };
  
  // Handle video reordering
  const handleReorderVideos = (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    
    setVideos(prev => {
      const result = [...prev];
      const [removed] = result.splice(sourceIndex, 1);
      result.splice(destinationIndex, 0, removed);
      return result;
    });
  };
  
  // Download merged video
  const handleDownloadMergedVideo = () => {
    if (!mergedVideo) return;
    
    const a = document.createElement('a');
    a.href = mergedVideo.url;
    a.download = mergedVideo.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Merge videos
  const mergeVideos = async () => {
    if (!videos.length) {
      setErrorMessage('Please add at least one video to merge');
      return;
    }
    
    if (videos.length < 2) {
      setErrorMessage('Please add at least two videos to merge');
      return;
    }
    
    if (!isFFmpegLoaded) {
      try {
        setCurrentTaskMessage('Loading video processing engine...');
        await loadFFmpeg();
      } catch (err) {
        // Error is handled by the hook, we just need to return
        return;
      }
    }
    
    try {
      setIsProcessing(true);
      setCurrentTaskMessage('Preparing videos for merging');
      setErrorMessage(null);
      
      // Create a concatenation file
      const fileContent = videos.map((video, index) => {
        return `file '${index}.${video.file.name.split('.').pop()}'`;
      }).join('\n');
      
      // Get the FFmpeg instance directly
      const { getFFmpeg } = await import('../../hooks/useFFmpeg');
      const ffmpeg = getFFmpeg();
      
      // Manually write each video file to FFmpeg's virtual filesystem
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const ext = video.file.name.split('.').pop();
        const inputFileName = `${i}.${ext}`;
        
        setCurrentTaskMessage(`Preparing video ${i + 1} of ${videos.length}`);
        
        // Use fetchFile for better compatibility
        ffmpeg.FS('writeFile', inputFileName, await fetchFile(video.file));
      }
      
      // Write the concat file
      ffmpeg.FS('writeFile', 'concat.txt', new TextEncoder().encode(fileContent));
      
      setCurrentTaskMessage('Merging videos...');
      
      // For video merging, we'll run FFmpeg directly instead of using processVideo
      // This ensures all videos are included in the merge
      try {
        // First try with simple concat and copy (fastest)
        await ffmpeg.run(
          '-f', 'concat',
          '-safe', '0',
          '-i', 'concat.txt',
          '-c', 'copy',
          'output.mp4'
        );
      } catch (err) {
        console.warn('Simple concat failed, trying with transcoding:', err);
        setCurrentTaskMessage('Simple merge failed. Trying with transcoding (slower but more compatible)...');
        
        // If simple concat fails, try transcoding all videos
        // This is slower but more compatible with different formats
        for (let i = 0; i < videos.length; i++) {
          const video = videos[i];
          const ext = video.file.name.split('.').pop();
          const inputFileName = `${i}.${ext}`;
          const transcodedFileName = `transcoded_${i}.mp4`;
          
          setCurrentTaskMessage(`Transcoding video ${i + 1} of ${videos.length} for compatibility...`);
          
          // Transcode each video to a compatible format
          await ffmpeg.run(
            '-i', inputFileName,
            '-c:v', 'libx264',
            '-c:a', 'aac',
            '-strict', 'experimental',
            transcodedFileName
          );
          
          // Update the concat file to use the transcoded videos
          if (i === 0) {
            ffmpeg.FS('writeFile', 'concat_transcoded.txt', new TextEncoder().encode(''));
          }
          
          const concatLine = `file '${transcodedFileName}'\n`;
          const currentContent = new TextDecoder().decode(ffmpeg.FS('readFile', 'concat_transcoded.txt'));
          ffmpeg.FS('writeFile', 'concat_transcoded.txt', new TextEncoder().encode(currentContent + concatLine));
        }
        
        setCurrentTaskMessage('Merging transcoded videos...');
        
        // Now merge the transcoded videos
        await ffmpeg.run(
          '-f', 'concat',
          '-safe', '0',
          '-i', 'concat_transcoded.txt',
          '-c', 'copy',
          'output.mp4'
        );
        
        // Clean up transcoded files
        for (let i = 0; i < videos.length; i++) {
          try {
            ffmpeg.FS('unlink', `transcoded_${i}.mp4`);
          } catch (e) {
            console.warn(`Could not unlink transcoded file ${i}:`, e);
          }
        }
        try {
          ffmpeg.FS('unlink', 'concat_transcoded.txt');
        } catch (e) {
          console.warn('Could not unlink transcoded concat file:', e);
        }
      }
      
      // Read the output file
      const data = ffmpeg.FS('readFile', 'output.mp4');
      
      // Create a blob URL
      const blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      // Clean up files
      ffmpeg.FS('unlink', 'concat.txt');
      ffmpeg.FS('unlink', 'output.mp4');
      
      // Clean up input files
      for (let i = 0; i < videos.length; i++) {
        const ext = videos[i].file.name.split('.').pop();
        try {
          ffmpeg.FS('unlink', `${i}.${ext}`);
        } catch (e) {
          console.warn(`Could not unlink file ${i}.${ext}:`, e);
        }
      }
      
      // Set the merged video
      setMergedVideo({
        url,
        size: blob.size,
        filename: `merged_video_${Date.now()}.mp4`,
      });
      
      setIsProcessing(false);
      setCurrentTaskMessage('');
      
    } catch (err) {
      console.error('Error merging videos:', err);
      setIsProcessing(false);
      setCurrentTaskMessage('');
      
      // Provide a more helpful error message
      if (err instanceof Error) {
        if (err.message.includes('lengthBytesUTF8') || err.message.includes('Core')) {
          setErrorMessage('Video processing engine initialization error. Please refresh the page and try again.');
        } else if (err.message.includes('memory') || err.message.includes('allocation')) {
          setErrorMessage('Not enough memory to process these videos. Try with smaller videos or fewer files.');
        } else if (err.message.includes('format') || err.message.includes('codec')) {
          setErrorMessage('One or more videos use an unsupported format. Try converting them to MP4 first.');
        } else {
          setErrorMessage(`Failed to merge videos: ${err.message}`);
        }
      } else {
        setErrorMessage('Failed to merge videos due to an unknown error.');
      }
    }
  };
  
  // Calculate total duration
  const totalDuration = videos.reduce((acc, video) => acc + video.duration, 0);
  
  // Check if there are mixed video formats
  const hasMixedFormats = (): boolean => {
    if (videos.length < 2) return false;
    
    const formats = new Set<string>();
    videos.forEach(video => {
      const ext = video.file.name.split('.').pop()?.toLowerCase() || '';
      formats.add(ext);
    });
    
    return formats.size > 1;
  };
  
  // Check if any videos have missing durations
  const hasMissingDurations = (): boolean => {
    return videos.some(video => video.duration === 0);
  };
  
  return (
    <div>
      {/* SharedArrayBuffer warning */}
      {!isSharedArrayBufferSupported && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 dark:text-yellow-300 mr-2" />
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              Your browser may have limited support for video processing. For best results, use Chrome or Edge with HTTPS.
            </p>
          </div>
        </div>
      )}

      {/* FFmpeg Status */}
      <FFmpegStatus />

      {/* Error message (non-FFmpeg errors) */}
      {errorMessage && !ffmpegError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300 mr-2" />
            <div>
              <p className="text-sm text-red-700 dark:text-red-200">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Compatibility Info */}
      <CompatibilityInfo />

      {/* File uploader */}
      <div className="mt-6">
        <FileUploader
          onFileSelect={handleFileUpload}
          acceptedFormats="video/*"
          files={[]}
          multiple={true}
          description="Upload video files to merge (MP4, WebM, etc.)"
          disabled={isProcessing}
        />
      </div>
      
      {/* Video queue */}
      {videos.length > 0 && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Video Queue ({videos.length})</h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Duration: {formatDuration(totalDuration)}
            </div>
          </div>
          
          {/* Format compatibility warnings */}
          {hasMixedFormats() && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 dark:text-yellow-300 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    <strong>Different video formats detected.</strong> This may cause compatibility issues when merging.
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                    Consider converting all videos to the same format using our <a href="/tools/video-converter" className="underline hover:text-yellow-800">Video Converter</a> first.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {hasMissingDurations() && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 dark:text-yellow-300 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    <strong>Some videos have missing duration metadata.</strong> This may affect the merging process.
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                    For best results, use videos with complete metadata or convert them to MP4 format.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <VideoQueue
            videos={videos}
            selectedVideoId={null}
            onVideoSelect={() => {}}
            onVideoRemove={handleRemoveVideo}
            onVideoReorder={handleReorderVideos}
          />
          
          <div className="mt-6">
            <button
              onClick={mergeVideos}
              disabled={videos.length < 2 || !isFFmpegLoaded || isProcessing}
              className={`w-full px-5 py-3 rounded-lg font-medium text-white flex items-center justify-center
                ${videos.length < 2 || !isFFmpegLoaded || isProcessing
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
            >
              <Plus className="w-5 h-5 mr-2" />
              {isFFmpegLoading 
                ? 'Loading Video Engine...' 
                : isProcessing 
                  ? 'Merging Videos...' 
                  : 'Merge Videos'}
            </button>
          </div>
        </div>
      )}
      
      {/* Merged video preview */}
      {mergedVideo && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Merged Video</h2>
          <MergePreview
            src={mergedVideo.url}
            size={mergedVideo.size}
            onDownload={handleDownloadMergedVideo}
            format="mp4"
          />
        </div>
      )}
      
      {/* Processing status */}
      {isProcessing && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <ProgressBar
            progress={progress}
            currentTask={currentTask || currentTaskMessage}
          />
        </div>
      )}
      
      {/* FFmpeg loading progress */}
      {isFFmpegLoading && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading video processing engine: {ffmpegLoadingProgress}%
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${ffmpegLoadingProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* FFmpeg loading status */}
      {!isFFmpegLoaded && !isFFmpegLoading && (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Loading Video Processing Engine</h2>
          <ProgressBar
            progress={ffmpegLoadingProgress}
            isIndeterminate={true}
            currentTask="Waiting for FFmpeg to initialize..."
          />
        </div>
      )}
    </div>
  );
};

export default VideoMerger;