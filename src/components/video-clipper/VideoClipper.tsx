import React, { useState, useEffect, useRef } from 'react';
import { Plus, AlertCircle, Download as DownloadIcon } from 'lucide-react';
import FileUploader from '../shared/FileUploader';
import VideoPreview from '../shared/VideoPreview';
import TimelineSlider from './TimelineSlider';
import ClipPreview from './ClipPreview';
import ProgressBar from '../shared/ProgressBar';
import { useFFmpeg } from '../../hooks/useFFmpeg';
import { useVideoProcessor } from '../../hooks/useVideoProcessor';
import { formatFileSize } from '../../utils/fileUtils';

interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  name: string;
  processed?: boolean;
  url?: string;
  size?: number;
  format?: string;
}

// Check if SharedArrayBuffer is supported
const isSharedArrayBufferSupported = typeof SharedArrayBuffer !== 'undefined';

// Check if browser is Chrome
const isChrome = navigator.userAgent.indexOf("Chrome") > -1;

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Format options
  const [clipFormat, setClipFormat] = useState<'copy' | 'mp4' | 'webm'>('copy');
  
  // FFmpeg state
  const { isFFmpegLoaded, isFFmpegLoading, loadFFmpeg, ffmpegLoadingProgress, error: ffmpegError } = useFFmpeg();
  const { processVideo, isProcessing, progress, currentTask, error } = useVideoProcessor();
  
  // Refs
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  
  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
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
    setErrorMessage(null);
    setSuccessMessage(`Video loaded: ${file.name} (${formatFileSize(file.size)})`);
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
      format: getVideoExtension(sourceVideo.name),
    };
    
    setClips([...clips, newClip]);
    setCurrentClipId(newClip.id);
    
    // Scroll to the clip section
    setTimeout(() => {
      document.getElementById('clips-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  // Get video extension from filename
  const getVideoExtension = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || 'mp4';
    return extension === 'mov' ? 'mp4' : extension; // Convert MOV to MP4 for compatibility
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
      setCurrentClipId(clips.length > 1 ? clips.filter(c => c.id !== id)[0]?.id : null);
    }
    
    // Revoke URL if it exists
    if (clipToRemove?.url) {
      URL.revokeObjectURL(clipToRemove.url);
    }
    
    setSuccessMessage(`Clip "${clipToRemove?.name || ''}" removed`);
  };
  
  // Process clip
  const processClip = async (clipId: string) => {
    if (!sourceVideo || !isFFmpegLoaded) return;
    
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;
    
    // Reset any previous error
    setErrorMessage(null);
    
    try {
      // Determine output format and commands
      let outputExtension = clip.format || 'mp4';
      let outputMimeType = sourceVideo.type || 'video/mp4';
      let command: string[] = [];
      
      if (clipFormat === 'copy') {
        // Use copy mode (fast but may have accuracy issues at cut points)
        command = [
          '-ss', clip.startTime.toString(),
          '-t', clip.duration.toString(),
          '-c', 'copy'
        ];
      } else if (clipFormat === 'mp4') {
        // Use mp4 with h.264 encoding (slower but more accurate)
        outputExtension = 'mp4';
        outputMimeType = 'video/mp4';
        command = [
          '-ss', clip.startTime.toString(),
          '-t', clip.duration.toString(),
          '-c:v', 'libx264', 
          '-preset', 'fast',
          '-c:a', 'aac'
        ];
      } else if (clipFormat === 'webm') {
        // Use webm with VP9 encoding
        outputExtension = 'webm';
        outputMimeType = 'video/webm';
        command = [
          '-ss', clip.startTime.toString(),
          '-t', clip.duration.toString(),
          '-c:v', 'vp9',
          '-b:v', '1M',
          '-c:a', 'libopus'
        ];
      }
      
      const result = await processVideo(sourceVideo, {
        command: command,
        outputExtension: outputExtension,
        outputMimeType: outputMimeType,
      });
      
      // Update clip with processed data
      updateClip(clipId, {
        processed: true,
        url: result.url,
        size: result.size,
        format: outputExtension,
      });
      
      setSuccessMessage(`Clip "${clip.name}" processed successfully! Click Download to save.`);
      
      // Auto-scroll to the processed clip
      setTimeout(() => {
        document.getElementById(`clip-${clipId}`)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
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
    a.download = `${clip.name}.${clip.format || 'mp4'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setSuccessMessage(`Downloading clip "${clip.name}"`);
  };

  // Download all clips as zip
  const downloadAllClips = () => {
    const processedClips = clips.filter(clip => clip.processed && clip.url);
    if (processedClips.length === 0) {
      setErrorMessage('No processed clips to download');
      return;
    }
    
    // For multiple clips, download them individually in sequence
    processedClips.forEach((clip, index) => {
      setTimeout(() => {
        if (clip.url) {
          const a = document.createElement('a');
          a.href = clip.url;
          a.download = `${clip.name}.${clip.format || 'mp4'}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }, index * 1000); // Delay each download by 1 second to avoid browser issues
    });
    
    setSuccessMessage(`Downloading ${processedClips.length} clips...`);
  };
  
  // Get current clip
  const currentClip = currentClipId ? clips.find(clip => clip.id === currentClipId) : null;
  
  // Count of processed clips
  const processedClipsCount = clips.filter(clip => clip.processed).length;
  
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
      {!isSharedArrayBufferSupported && !isChrome && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 m-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 dark:text-yellow-300 mr-2" />
            <div>
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                <strong>Browser Compatibility Issue:</strong> Your browser doesn't support SharedArrayBuffer, 
                which is required for optimal video processing. The clipper will attempt to use a fallback method,
                but for best results, please use Chrome, Edge, or Firefox with HTTPS.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-400">
                {successMessage}
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
          onFileUpload={handleFileUpload}
          accept="video/*"
          files={[sourceVideo].filter(Boolean) as File[]}
          description="Upload a video file to clip"
          disabled={isProcessing}
        />
      </div>
      
      {sourceVideo && (
        <>
          {/* Video preview section */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Video Preview</h2>
            <VideoPreview
              ref={videoPreviewRef}
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

            {/* Clip format selection */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Clip Format:
              </label>
              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="clipFormat"
                    value="copy"
                    checked={clipFormat === 'copy'}
                    onChange={() => setClipFormat('copy')}
                    disabled={isProcessing}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Original (Fast)
                  </span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="clipFormat"
                    value="mp4"
                    checked={clipFormat === 'mp4'}
                    onChange={() => setClipFormat('mp4')}
                    disabled={isProcessing}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    MP4 (H.264)
                  </span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="clipFormat"
                    value="webm"
                    checked={clipFormat === 'webm'}
                    onChange={() => setClipFormat('webm')}
                    disabled={isProcessing}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    WebM (VP9)
                  </span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Original is fastest but may have issues at cut points. MP4 and WebM are more accurate but slower.
              </p>
            </div>
          </div>
          
          {/* Clips section */}
          <div id="clips-section" className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Clips</h2>
                {clips.length > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {clips.length} clip{clips.length > 1 ? 's' : ''} created, {processedClipsCount} processed
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {processedClipsCount > 1 && (
                  <button
                    onClick={downloadAllClips}
                    disabled={isProcessing}
                    className={`flex items-center px-3 py-1.5 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors`}
                  >
                    <DownloadIcon className="w-4 h-4 mr-1" />
                    Download All
                  </button>
                )}
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
            </div>
            
            {clips.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <div className="mb-2">
                  <Plus className="w-8 h-8 mx-auto text-gray-400" />
                </div>
                <p>No clips created yet. Add a clip to start trimming.</p>
                <p className="text-sm mt-2">
                  Tip: Navigate to a point in the video, then click "Add Clip" to create a 4-second clip around that point.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {clips.map(clip => (
                  <div id={`clip-${clip.id}`} key={clip.id}>
                    <ClipPreview
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
                  </div>
                ))}
              </div>
            )}
            
            {clips.length > 0 && !clips.some(c => c.processed) && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm rounded border border-blue-200 dark:border-blue-800">
                <strong>How to download clips:</strong>
                <ol className="list-decimal list-inside mt-1 ml-2">
                  <li>Click the "Process Clip" button for each clip you want to download</li>
                  <li>Wait for processing to complete</li>
                  <li>Click the "Download" button that appears</li>
                </ol>
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