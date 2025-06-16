import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import FileUploader from '../shared/FileUploader';
import VideoPreview from '../shared/VideoPreview';
import TimelineSlider from './TimelineSlider';
import ClipPreview from './ClipPreview';
import ProgressBar from '../shared/ProgressBar';
import { useFFmpeg } from '../../hooks/useFFmpeg';
import { useVideoProcessor } from '../../hooks/useVideoProcessor';

interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  name: string;
  processed?: boolean;
  url?: string;
  size?: number;
}

// Check if SharedArrayBuffer is supported
const isSharedArrayBufferSupported = typeof SharedArrayBuffer !== 'undefined';

// Privacy Badge Component
const PrivacyBadge: React.FC = () => (
  <div className="inline-flex items-center bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-xs text-green-800 dark:text-green-300 mt-2">
    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm0-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
    </svg>
    100% Client-side Processing - Your files never leave your device
  </div>
);

const VideoClipper: React.FC = () => {
  // State for the source video
  const [sourceVideo, setSourceVideo] = useState<File | null>(null);
  const [sourceVideoUrl, setSourceVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  // State for clips
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [currentClipId, setCurrentClipId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // FFmpeg state
  const { isFFmpegLoaded, isFFmpegLoading, loadFFmpeg, ffmpegLoadingProgress, error: ffmpegError } = useFFmpeg();
  const { processVideo, isProcessing, progress, currentTask, error } = useVideoProcessor();
  
  // Load FFmpeg when component mounts
  useEffect(() => {
    loadFFmpeg().catch(error => {
      setErrorMessage(`Failed to load video processing engine: ${error.message}`);
    });
  }, [loadFFmpeg]);
  
  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      if (sourceVideoUrl) {
        URL.revokeObjectURL(sourceVideoUrl);
      }
      
      clips.forEach(clip => {
        if (clip.url) {
          URL.revokeObjectURL(clip.url);
        }
      });
    };
  }, [sourceVideoUrl, clips]);
  
  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Revoke previous URL if exists
    if (sourceVideoUrl) {
      URL.revokeObjectURL(sourceVideoUrl);
    }
    
    // Create a new URL for the video
    const url = URL.createObjectURL(file);
    
    setSourceVideo(file);
    setSourceVideoUrl(url);
    setClips([]);
  };
  
  // Handle duration change
  const handleDurationChange = (duration: number) => {
    setVideoDuration(duration);
  };
  
  // Handle time update
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };
  
  // Add a new clip
  const addClip = () => {
    if (!sourceVideo) return;
    
    const newClip: VideoClip = {
      id: Date.now().toString(),
      startTime: Math.max(0, currentTime - 2),
      endTime: Math.min(videoDuration, currentTime + 2),
      duration: 4, // Default 4 seconds
      name: `Clip ${clips.length + 1}`,
    };
    
    setClips([...clips, newClip]);
    setCurrentClipId(newClip.id);
  };
  
  // Update clip
  const updateClip = (id: string, updates: Partial<VideoClip>) => {
    setClips(clips.map(clip => {
      if (clip.id === id) {
        const updatedClip = { ...clip, ...updates };
        
        // Recalculate duration
        if (updates.startTime !== undefined || updates.endTime !== undefined) {
          updatedClip.duration = updatedClip.endTime - updatedClip.startTime;
        }
        
        return updatedClip;
      }
      return clip;
    }));
  };
  
  // Remove clip
  const removeClip = (id: string) => {
    const clipToRemove = clips.find(clip => clip.id === id);
    
    setClips(clips.filter(clip => clip.id !== id));
    
    if (currentClipId === id) {
      setCurrentClipId(clips.length > 1 ? clips[0].id : null);
    }
    
    // Revoke URL if it exists
    if (clipToRemove?.url) {
      URL.revokeObjectURL(clipToRemove.url);
    }
  };
  
  // Process clip
  const processClip = async (clipId: string) => {
    if (!sourceVideo || !isFFmpegLoaded) return;
    
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;
    
    try {
      const result = await processVideo(sourceVideo, {
        command: [
          '-ss', clip.startTime.toString(),
          '-t', clip.duration.toString(),
          '-c', 'copy'
        ],
        outputExtension: sourceVideo.name.split('.').pop() || 'mp4',
        outputMimeType: sourceVideo.type || 'video/mp4',
      });
      
      // Update clip with processed data
      updateClip(clipId, {
        processed: true,
        url: result.url,
        size: result.size,
      });
      
    } catch (err) {
      console.error('Error processing clip:', err);
      setErrorMessage(`Clip processing error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  // Download clip
  const downloadClip = (clipId: string) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip || !clip.url) return;
    
    const a = document.createElement('a');
    a.href = clip.url;
    a.download = `${clip.name}.${sourceVideo?.name.split('.').pop() || 'mp4'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Get current clip
  const currentClip = currentClipId ? clips.find(clip => clip.id === currentClipId) : null;
  
  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-primary-light rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Clipper</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Trim and extract clips from your videos - all processing happens in your browser.
        </p>
        <PrivacyBadge />
      </div>

      {/* SharedArrayBuffer warning */}
      {!isSharedArrayBufferSupported && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Browser Compatibility Issue:</strong> Your browser doesn't support SharedArrayBuffer, 
                which is required for optimal video processing. The clipper will attempt to use a fallback method,
                but for best results, please use Chrome, Edge, or Firefox with HTTPS.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error messages */}
      {(errorMessage || ffmpegError || error) && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 m-4">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">
                {errorMessage || ffmpegError || error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File uploader */}
      <div className="p-6">
        <FileUploader
          onFileSelect={handleFileUpload}
          acceptedFormats="video/*"
          files={sourceVideo ? [sourceVideo] : []}
          description="Upload a video file to trim (MP4, WebM, AVI, MOV, etc.)"
          disabled={isProcessing}
        />
      </div>
      
      {sourceVideo && (
        <>
          {/* Video preview section */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Video Preview</h2>
            <VideoPreview
              src={sourceVideoUrl}
              title={sourceVideo.name}
              onDurationChange={handleDurationChange}
              onTimeUpdate={handleTimeUpdate}
              markers={currentClip ? { start: currentClip.startTime, end: currentClip.endTime } : undefined}
              disabled={isProcessing}
            />
            
            {/* Timeline slider */}
            <div className="mt-6">
              <TimelineSlider
                duration={videoDuration}
                currentTime={currentTime}
                clips={clips}
                currentClipId={currentClipId}
                onTimeChange={setCurrentTime}
                onClipChange={setCurrentClipId}
                onClipUpdate={updateClip}
                disabled={isProcessing}
              />
            </div>
          </div>
          
          {/* Clips section */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Clips</h2>
              <button
                onClick={addClip}
                disabled={!sourceVideo || isProcessing || !isFFmpegLoaded}
                className={`flex items-center px-3 py-1.5 rounded-md text-white
                  ${!sourceVideo || isProcessing || !isFFmpegLoaded
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors`}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Clip
              </button>
            </div>
            
            {clips.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No clips created yet. Add a clip to start trimming.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clips.map(clip => (
                  <ClipPreview
                    key={clip.id}
                    clip={clip}
                    isSelected={clip.id === currentClipId}
                    isProcessing={isProcessing && currentClipId === clip.id}
                    onSelect={() => setCurrentClipId(clip.id)}
                    onRemove={() => removeClip(clip.id)}
                    onProcess={() => processClip(clip.id)}
                    onDownload={() => downloadClip(clip.id)}
                    onNameChange={(name) => updateClip(clip.id, { name })}
                    onTimeChange={(startTime, endTime) => updateClip(clip.id, { startTime, endTime })}
                    disabled={isProcessing}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Processing status */}
          {isProcessing && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <ProgressBar
                progress={progress}
                currentTask={currentTask}
              />
            </div>
          )}
          
          {/* FFmpeg loading progress */}
          {isFFmpegLoading && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
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
        </>
      )}
      
      {/* FFmpeg loading status */}
      {!isFFmpegLoaded && !isFFmpegLoading && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
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

export default VideoClipper; 