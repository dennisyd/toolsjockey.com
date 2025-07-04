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
import { useToolAnalytics } from '../../hooks/useAnalytics';
import JSZip from 'jszip';

interface ExtractedFrame {
  id: string;
  url: string;
  time: number;
  format: string;
  size: number;
  blob?: Blob; // Store the actual blob data for reliable access
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
  // Analytics tracking
  const analytics = useToolAnalytics('Frame Extractor');
  
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
  const { processVideo, isProcessing: ffmpegProcessing, progress: ffmpegProgress, currentTask: ffmpegTask, error } = useVideoProcessor();
  
  // Local processing state (for ZIP creation)
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentTask, setCurrentTask] = useState<string>('');
  
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
    
    // Track file upload
    analytics.trackFileUpload(file.type, file.size);
    analytics.trackToolStart({ file_type: file.type, file_size: file.size });
    
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
      
      // Get the blob from the URL
      const response = await fetch(result.url);
      const blob = await response.blob();
      
      const newFrame: ExtractedFrame = {
        id: Date.now().toString(),
        url: result.url,
        time,
        format,
        size: result.size,
        blob: blob, // Store the blob data
      };
      
      setFrames(prev => [newFrame, ...prev]);
      setSelectedFrameId(newFrame.id);
      
      // Track successful frame extraction
      analytics.trackToolFeatureUse('single_frame_extract', {
        format,
        quality,
        time: time,
      });
      
    } catch (err) {
      console.error('Error extracting frame:', err);
      const errorMessage = `Frame extraction error: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setErrorMessage(errorMessage);
      analytics.trackToolError(errorMessage);
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
        
        // Get the blob from the URL
        const response = await fetch(result.url);
        const blob = await response.blob();
        
        const newFrame: ExtractedFrame = {
          id: `frame-${i}-${Date.now()}`,
          url: result.url,
          time: frameTime,
          format,
          size: result.size,
          blob: blob, // Store the blob data
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
  const downloadFrame = async (frameId: string) => {
    const frame = frames.find(f => f.id === frameId);
    if (!frame) return;
    
    // Track download attempt
    analytics.trackDownload(frame.format, { frame_time: frame.time });
    analytics.trackCurrentPageButtonClick('download_frame', { format: frame.format });
    
    try {
      // Use the stored blob if available, otherwise fetch it
      let blob = frame.blob;
      
      if (!blob) {
        // Fallback to fetching from URL if blob is not available
        const response = await fetch(frame.url);
        blob = await response.blob();
      }
      
      // Create a direct download using the blob
      const blobUrl = URL.createObjectURL(blob);
      const filename = `frame_${formatDuration(frame.time).replace(/:/g, '-')}.${frame.format}`;
      
      // Create and trigger the download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl); // Important: revoke the blob URL to free memory
      }, 200);
    } catch (error) {
      console.error('Error downloading frame:', error);
      setErrorMessage('Failed to download frame. Please try again.');
    }
  };
  
  // Download all frames as a ZIP file
  const downloadAllFrames = async () => {
    if (frames.length === 0) return;
    
    analytics.trackToolFeatureUse('download_all_frames', {
      count: frames.length,
      format: frames[0].format,
    });
    
    setIsProcessing(true);
    setCurrentTask('Creating ZIP archive...');
    setProgress(0);
    setErrorMessage(null);
    
    try {
      // Create a new JSZip instance
      const zip = new JSZip();
      
      // Add each frame to the zip file
      let processedCount = 0;
      let failedFrames = 0;
      
      // Process frames in batches to avoid memory issues with very large frame sets
      const BATCH_SIZE = 10;
      const batches = Math.ceil(frames.length / BATCH_SIZE);
      
      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const start = batchIndex * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, frames.length);
        const batchFrames = frames.slice(start, end);
        
        setCurrentTask(`Processing batch ${batchIndex + 1}/${batches}...`);
        
        // Process frames in current batch
        const batchPromises = batchFrames.map(async (frame) => {
          try {
            // Use the stored blob if available, otherwise fetch it
            let blob = frame.blob;
            
            if (!blob) {
              // Fallback to fetching from URL if blob is not available
              const response = await fetch(frame.url);
              if (!response.ok) {
                throw new Error(`Failed to fetch frame: ${response.status} ${response.statusText}`);
              }
              blob = await response.blob();
            }
            
            // Format timestamp for filename
            const timeFormatted = formatDuration(frame.time).replace(/:/g, '-');
            const filename = `frame_${timeFormatted}.${frame.format}`;
            
            // Add the blob to the zip
            zip.file(filename, blob);
            
            // Update progress
            processedCount++;
            setProgress((processedCount / frames.length) * 50); // First 50% for adding files
            
            return { success: true };
          } catch (err) {
            console.error('Error adding frame to zip:', err);
            return { success: false, error: err };
          }
        });
        
        // Wait for all frames in the batch to be processed
        const results = await Promise.all(batchPromises);
        
        // Count failures
        const batchFailures = results.filter(r => !r.success).length;
        failedFrames += batchFailures;
        
        // If too many frames fail, abort the process
        if (failedFrames > Math.min(5, frames.length / 4)) {
          throw new Error('Too many frames failed to process. Please try again.');
        }
      }
      
      // Update task
      setCurrentTask('Generating ZIP file...');
      
      // Generate the zip file with progress tracking
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      }, (metadata) => {
        setProgress(50 + (metadata.percent / 2)); // Last 50% for generating zip
      });
      
      // Create a direct download using the blob
      const blobUrl = URL.createObjectURL(zipBlob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `frames_${timestamp}.zip`;
      
      // Create and trigger the download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl); // Important: revoke the blob URL to free memory
        setIsProcessing(false);
        setCurrentTask('');
        setProgress(0);
      }, 500); // Increased timeout to ensure download starts properly
      
      // Track successful download
      analytics.trackDownload('zip', { frame_count: frames.length });
    } catch (error) {
      console.error('Error creating zip file:', error);
      setErrorMessage(`Failed to create ZIP file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      analytics.trackToolError(`ZIP download error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
      setCurrentTask('');
      setProgress(0);
    }
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
                    disabled={!sourceVideo || !isFFmpegLoaded || ffmpegProcessing || isProcessing}
                    className={`w-full px-5 py-3 rounded-lg font-medium text-white flex items-center justify-center
                      ${!sourceVideo || !isFFmpegLoaded || ffmpegProcessing || isProcessing
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                      } transition-colors`}
                  >
                    {isFFmpegLoading ? (
                      'Loading Video Engine...'
                    ) : ffmpegProcessing || isProcessing ? (
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
                    disabled={frames.length === 0 || ffmpegProcessing || isProcessing}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {isProcessing ? 'Creating ZIP...' : 'Download All'}
                  </button>
                  <button
                    onClick={deleteAllFrames}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700"
                    disabled={frames.length === 0 || ffmpegProcessing || isProcessing}
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
          {(ffmpegProcessing || isProcessing) && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <ProgressBar
                progress={ffmpegProcessing ? ffmpegProgress : progress}
                currentTask={ffmpegProcessing ? ffmpegTask : currentTask}
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