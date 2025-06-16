import React, { useState, useEffect } from 'react';
import { Download, Image, AlertCircle } from 'lucide-react';
import FileUploader from '../shared/FileUploader';
import VideoPreview from '../shared/VideoPreview';
import GifSettings from './GifSettings';
import GifPreview from './GifPreview';
import ProgressBar from '../shared/ProgressBar';
import { useFFmpeg } from '../../hooks/useFFmpeg';
import { useVideoProcessor } from '../../hooks/useVideoProcessor';
import { formatFileSize, formatDuration } from '../../utils/fileUtils';

interface GifSettings {
  startTime: number;
  endTime: number | null; // null means until the end
  frameRate: number; // Rename from fps
  quality: number;
  width: number | null;
  height: number | null;
  loop: number; // Rename from loopCount
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

const VideoToGif: React.FC = () => {
  // Source video state
  const [sourceVideo, setSourceVideo] = useState<File | null>(null);
  const [sourceVideoUrl, setSourceVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoWidth, setVideoWidth] = useState<number | null>(null);
  const [videoHeight, setVideoHeight] = useState<number | null>(null);
  
  // GIF settings
  const [gifSettings, setGifSettings] = useState<GifSettings>({
    startTime: 0,
    endTime: null,
    frameRate: 15, // Renamed from fps
    quality: 75,
    width: null,
    height: null,
    loop: 0, // Renamed from loopCount
  });
  
  // GIF result
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifSize, setGifSize] = useState<number | null>(null);
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
      
      if (gifUrl) {
        URL.revokeObjectURL(gifUrl);
      }
    };
  }, [sourceVideoUrl, gifUrl]);
  
  // Fix the videoWidth/Height state initialization
  useEffect(() => {
    if (sourceVideo && sourceVideoUrl) {
      // Create a video element to get dimensions
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        setVideoWidth(video.videoWidth);
        setVideoHeight(video.videoHeight);
      };
      video.src = sourceVideoUrl;
    }
  }, [sourceVideo, sourceVideoUrl]);
  
  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Revoke previous URLs
    if (sourceVideoUrl) {
      URL.revokeObjectURL(sourceVideoUrl);
    }
    
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
      setGifUrl(null);
      setGifSize(null);
    }
    
    // Create a new URL for the video
    const url = URL.createObjectURL(file);
    
    setSourceVideo(file);
    setSourceVideoUrl(url);
    
    // Reset GIF settings
    setGifSettings(prev => ({
      ...prev,
      startTime: 0,
      endTime: Math.min(5, videoDuration || 5),
    }));
  };
  
  // Handle duration change
  const handleDurationChange = (duration: number) => {
    setVideoDuration(duration);
    
    // Update endTime if it's null or exceeds the new duration
    setGifSettings(prev => {
      if (prev.endTime === null || prev.endTime > duration) {
        return { ...prev, endTime: duration };
      }
      return prev;
    });
  };
  
  // Handle time update
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };
  
  // Handle settings change
  const handleSettingsChange = (settings: Partial<GifSettings>) => {
    setGifSettings(prev => ({
      ...prev,
      ...settings,
    }));
  };
  
  // Generate GIF
  const generateGif = async () => {
    if (!sourceVideo || !isFFmpegLoaded) return;
    
    try {
      // Calculate height if null (maintain aspect ratio)
      let scaleFilter = `scale=${gifSettings.width}:`;
      if (gifSettings.height) {
        scaleFilter += gifSettings.height;
      } else {
        scaleFilter += '-1';
      }
      
      // Build the filter complex command
      const filterComplex = `fps=${gifSettings.frameRate},${scaleFilter}:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=${Math.min(256, Math.max(2, Math.floor(gifSettings.quality * 2.56)))}[p];[s1][p]paletteuse`;
      
      // Calculate the duration - handle null endTime
      const endTime = gifSettings.endTime === null ? videoDuration : gifSettings.endTime;
      const duration = endTime - gifSettings.startTime;
      
      const result = await processVideo(sourceVideo, {
        command: [
          '-ss', gifSettings.startTime.toString(),
          '-t', duration.toString(),
          '-vf', filterComplex,
          '-loop', gifSettings.loop.toString(),
        ],
        outputExtension: 'gif',
        outputMimeType: 'image/gif',
      });
      
      setGifUrl(result.url);
      setGifSize(result.size);
      
    } catch (err) {
      console.error('Error generating GIF:', err);
      setErrorMessage(`Conversion error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  // Download GIF
  const downloadGif = () => {
    if (!gifUrl || !sourceVideo) return;
    
    const a = document.createElement('a');
    a.href = gifUrl;
    
    // Create a filename based on the source video
    const baseName = sourceVideo.name.substring(0, sourceVideo.name.lastIndexOf('.'));
    a.download = `${baseName}_${gifSettings.width}x${gifSettings.height || 'auto'}_${gifSettings.frameRate}fps.gif`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-primary-light rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video to GIF Converter</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Convert videos to GIF animations with custom settings - processed entirely in your browser.
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
                which is required for optimal video processing. The converter will attempt to use a fallback method,
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
          description="Upload a video file to convert to GIF (MP4, WebM, AVI, MOV, etc.)"
          disabled={isProcessing}
        />
      </div>
      
      {sourceVideo && (
        <>
          {/* Video and GIF preview section */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Video Preview</h2>
                <VideoPreview
                  src={sourceVideoUrl}
                  title={sourceVideo.name}
                  onDurationChange={handleDurationChange}
                  onTimeUpdate={handleTimeUpdate}
                  markers={{
                    start: gifSettings.startTime,
                    end: gifSettings.endTime || undefined,
                  }}
                />
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Selected Range: {formatDuration(gifSettings.startTime)} - {formatDuration(gifSettings.endTime || videoDuration)}
                  ({formatDuration((gifSettings.endTime || videoDuration) - gifSettings.startTime)})
                </div>
              </div>
              
              {/* GIF preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">GIF Preview</h2>
                {gifUrl ? (
                  <>
                    <GifPreview 
                      src={gifUrl} 
                      width={gifSettings.width || 320}
                      height={gifSettings.height || undefined}
                    />
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Size: {gifSize ? formatFileSize(gifSize) : 'Unknown'}
                      </span>
                      <button
                        onClick={downloadGif}
                        className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download GIF
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Image className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {isProcessing 
                        ? 'Generating GIF...' 
                        : 'Generated GIF will appear here'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* GIF settings */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">GIF Settings</h2>
            <GifSettings
              settings={gifSettings}
              onSettingsChange={handleSettingsChange}
              currentTime={currentTime}
              videoDuration={videoDuration}
              videoWidth={videoWidth || 640} // Provide default values
              videoHeight={videoHeight || 480} // Provide default values
              disabled={isProcessing}
            />
          </div>
          
          {/* Generate button */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <button
                onClick={generateGif}
                disabled={!sourceVideo || !isFFmpegLoaded || isProcessing}
                className={`px-5 py-3 rounded-lg font-medium text-white 
                  ${!sourceVideo || !isFFmpegLoaded || isProcessing
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors w-full md:w-auto`}
              >
                {isFFmpegLoading 
                  ? 'Loading Video Engine...' 
                  : isProcessing 
                    ? 'Generating...' 
                    : 'Generate GIF'}
              </button>
            </div>
            
            {/* FFmpeg loading progress */}
            {isFFmpegLoading && (
              <div className="mt-4">
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

export default VideoToGif; 