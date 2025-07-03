import React, { useState, useEffect } from 'react';
import { Download, Camera, AlertCircle } from 'lucide-react';
import FileUploader from '../shared/FileUploader';
import VideoPreview from '../shared/VideoPreview';
import FrameSelector from './FrameSelector';
import FrameGallery from './FrameGallery';
import ProgressBar from '../shared/ProgressBar';
import { useFFmpeg } from '../../hooks/useFFmpeg';
import { useVideoProcessor } from '../../hooks/useVideoProcessor';
import { formatDuration } from '../../utils/fileUtils';
import { imageFormats } from '../../utils/videoFormats';

interface ExtractedFrame {
  id: string;
  url: string;
  time: number;
  format: string;
  size: number;
}

interface ExtractionSettings {
  format: 'png' | 'jpg' | 'webp';
  quality: number; // 1-100
  mode: 'single' | 'interval';
  interval: number; // seconds between frames
  startTime: number;
  endTime: number | null; // null means until the end
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

const FrameExtractor: React.FC = () => {
  // Source video state
  const [sourceVideo, setSourceVideo] = useState<File | null>(null);
  const [sourceVideoUrl, setSourceVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  // Extraction settings
  const [settings, setSettings] = useState<ExtractionSettings>({
    format: 'jpg',
    quality: 90,
    mode: 'single',
    interval: 1,
    startTime: 0,
    endTime: null,
  });
  
  // Extracted frames
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
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
      
      frames.forEach(frame => {
        URL.revokeObjectURL(frame.url);
      });
    };
  }, [sourceVideoUrl, frames]);
  
  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Revoke previous URLs
    if (sourceVideoUrl) {
      URL.revokeObjectURL(sourceVideoUrl);
    }
    
    // Clean up previous frames
    frames.forEach(frame => {
      URL.revokeObjectURL(frame.url);
    });
    setFrames([]);
    setSelectedFrameId(null);
    
    // Create a new URL for the video
    const url = URL.createObjectURL(file);
    
    setSourceVideo(file);
    setSourceVideoUrl(url);
    
    // Reset settings
    setSettings(prev => ({
      ...prev,
      startTime: 0,
      endTime: null,
    }));
  };
  
  // Handle duration change
  const handleDurationChange = (duration: number) => {
    setVideoDuration(duration);
  };
  
  // Handle time update
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };
  
  // Handle settings change
  const handleSettingsChange = (newSettings: Partial<ExtractionSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  };
  
  // Extract single frame
  const extractSingleFrame = async () => {
    if (!sourceVideo || !isFFmpegLoaded) return;
    
    try {
      const time = currentTime;
      const format = settings.format;
      const quality = settings.quality;
      
      // Quality parameter based on format
      let qualityParam: string[] = [];
      if (format === 'jpg') {
        qualityParam = ['-q:v', Math.floor(31 - (quality / 100) * 30).toString()]; // 1-31 (lower is better)
      } else if (format === 'webp') {
        qualityParam = ['-quality', quality.toString()];
      } else if (format === 'png') {
        qualityParam = ['-compression_level', Math.floor(9 - (quality / 100) * 9).toString()]; // 0-9 (lower is better)
      }
      
      const result = await processVideo(sourceVideo, {
        command: [
          '-ss', time.toString(),
          '-vframes', '1',
          ...qualityParam,
        ],
        outputExtension: format,
        outputMimeType: imageFormats[format].mimeType,
      });
      
      const newFrame: ExtractedFrame = {
        id: Date.now().toString(),
        url: result.url,
        time,
        format,
        size: result.size,
      };
      
      setFrames(prev => [newFrame, ...prev]);
      setSelectedFrameId(newFrame.id);
      
    } catch (err) {
      console.error('Error extracting frame:', err);
      setErrorMessage(`Frame extraction error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  // Extract multiple frames
  const extractMultipleFrames = async () => {
    if (!sourceVideo || !isFFmpegLoaded) return;
    
    try {
      const startTime = settings.startTime;
      const endTime = settings.endTime !== null ? settings.endTime : videoDuration;
      const interval = settings.interval;
      const format = settings.format;
      const quality = settings.quality;
      
      // Calculate number of frames
      const duration = endTime - startTime;
      const frameCount = Math.floor(duration / interval) + 1;
      
      if (frameCount > 100) {
        if (!window.confirm(`This will extract ${frameCount} frames. Are you sure you want to continue?`)) {
          return;
        }
      }
      
      // Quality parameter based on format
      let qualityParam: string[] = [];
      if (format === 'jpg') {
        qualityParam = ['-q:v', Math.floor(31 - (quality / 100) * 30).toString()];
      } else if (format === 'webp') {
        qualityParam = ['-quality', quality.toString()];
      } else if (format === 'png') {
        qualityParam = ['-compression_level', Math.floor(9 - (quality / 100) * 9).toString()];
      }
      
      const newFrames: ExtractedFrame[] = [];
      
      // Extract each frame individually for better progress tracking
      for (let i = 0; i < frameCount; i++) {
        const frameTime = startTime + i * interval;
        if (frameTime > endTime) break;
        
        const result = await processVideo(sourceVideo, {
          command: [
            '-ss', frameTime.toString(),
            '-vframes', '1',
            ...qualityParam,
          ],
          outputExtension: format,
          outputMimeType: imageFormats[format].mimeType,
          onProgress: () => {
            // Progress is handled by the useVideoProcessor hook
          },
        });
        
        const newFrame: ExtractedFrame = {
          id: `frame-${i}-${Date.now()}`,
          url: result.url,
          time: frameTime,
          format,
          size: result.size,
        };
        
        newFrames.push(newFrame);
      }
      
      setFrames(prev => [...newFrames, ...prev]);
      if (newFrames.length > 0) {
        setSelectedFrameId(newFrames[0].id);
      }
      
    } catch (err) {
      console.error('Error extracting frames:', err);
      setErrorMessage(`Frame extraction error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };
  
  // Extract frames based on mode
  const extractFrames = async () => {
    if (settings.mode === 'single') {
      extractSingleFrame();
    } else {
      extractMultipleFrames();
    }
  };
  
  // Download frame
  const downloadFrame = (frameId: string) => {
    const frame = frames.find(f => f.id === frameId);
    if (!frame) return;
    
    const a = document.createElement('a');
    a.href = frame.url;
    a.download = `frame_${formatDuration(frame.time).replace(':', '-')}.${frame.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Download all frames as zip
  const downloadAllFrames = () => {
    // This would typically use JSZip to create a zip file
    // For simplicity, we'll just download each frame individually
    frames.forEach((frame, index) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = frame.url;
        a.download = `frame_${formatDuration(frame.time).replace(':', '-')}.${frame.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 100); // Stagger downloads by 100ms each
    });
  };
  
  // Delete frame
  const deleteFrame = (frameId: string) => {
    const frameToDelete = frames.find(f => f.id === frameId);
    if (frameToDelete) {
      URL.revokeObjectURL(frameToDelete.url);
    }
    
    setFrames(prev => prev.filter(f => f.id !== frameId));
    
    if (selectedFrameId === frameId) {
      setSelectedFrameId(frames.length > 1 ? frames[0].id : null);
    }
  };
  
  // Delete all frames
  const deleteAllFrames = () => {
    frames.forEach(frame => {
      URL.revokeObjectURL(frame.url);
    });
    
    setFrames([]);
    setSelectedFrameId(null);
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-primary-light rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Frame Extractor</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Extract individual frames or frame sequences from videos - processed entirely in your browser.
        </p>
        <PrivacyBadge />
      </div>

      {/* SharedArrayBuffer warning - only show for non-Chrome browsers that don't support it */}
      {!isSharedArrayBufferSupported && !isChrome && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Browser Compatibility Issue:</strong> Your browser doesn't support SharedArrayBuffer, 
                which is required for optimal video processing. The extractor will attempt to use a fallback method,
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
          onFileUpload={handleFileUpload}
          accept="video/*"
          files={[sourceVideo].filter(Boolean) as File[]}
          description="Upload a video file to extract frames"
          disabled={isProcessing}
        />
      </div>
      
      {sourceVideo && (
        <>
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
                />
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Current Time: {formatDuration(currentTime)} / {formatDuration(videoDuration)}
                </div>
              </div>
              
              {/* Frame extraction settings */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Frame Extraction</h2>
                <FrameSelector
                  settings={settings}
                  onSettingsChange={handleSettingsChange}
                  currentTime={currentTime}
                  videoDuration={videoDuration}
                  disabled={isProcessing}
                />
                
                <div className="mt-6">
                  <button
                    onClick={extractFrames}
                    disabled={!sourceVideo || !isFFmpegLoaded || isProcessing}
                    className={`w-full px-5 py-3 rounded-lg font-medium text-white flex items-center justify-center
                      ${!sourceVideo || !isFFmpegLoaded || isProcessing
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                      } transition-colors`}
                  >
                    {isFFmpegLoading ? (
                      'Loading Video Engine...'
                    ) : isProcessing ? (
                      'Extracting...'
                    ) : (
                      <>
                        <Camera className="w-5 h-5 mr-2" />
                        {settings.mode === 'single' ? 'Extract Current Frame' : 'Extract Multiple Frames'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Extracted frames gallery */}
          {frames.length > 0 && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Extracted Frames ({frames.length})</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={downloadAllFrames}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                    disabled={frames.length === 0}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download All
                  </button>
                  <button
                    onClick={deleteAllFrames}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
                    disabled={frames.length === 0}
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              <FrameGallery
                frames={frames}
                selectedFrameId={selectedFrameId}
                onFrameSelect={setSelectedFrameId}
                onFrameDownload={downloadFrame}
                onFrameDelete={deleteFrame}
              />
            </div>
          )}
          
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

export default FrameExtractor; 