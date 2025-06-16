import React, { useState, useEffect } from 'react';
import { Download, BarChart, AlertCircle } from 'lucide-react';
import FileUploader from '../shared/FileUploader';
import VideoPreview from '../shared/VideoPreview';
import CompressionSettings from './CompressionSettings';
import SizeComparison from './SizeComparison';
import ProgressBar from '../shared/ProgressBar';
import FFmpegStatus from '../shared/FFmpegStatus';
import { useFFmpeg } from '../../hooks/useFFmpeg';
import { useVideoProcessor } from '../../hooks/useVideoProcessor';
import { formatFileSize } from '../../utils/fileUtils';
import { qualityPresets } from '../../utils/videoFormats';

type QualityPreset = 'low' | 'medium' | 'high' | 'custom';

interface CompressionResult {
  url: string;
  size: number;
  filename: string;
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

const VideoCompressor: React.FC = () => {
  // Source video state
  const [sourceVideo, setSourceVideo] = useState<File | null>(null);
  const [sourceVideoUrl, setSourceVideoUrl] = useState<string>('');
  
  // Compression settings
  const [selectedPreset, setSelectedPreset] = useState<QualityPreset>('medium');
  const [customSettings, setCustomSettings] = useState({
    resolution: '1280x720',
    videoBitrate: '1500k',
    audioBitrate: '128k',
    crf: 23,
    preset: 'medium',
  });
  
  // Compression result
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // FFmpeg state
  const { isFFmpegLoaded, isFFmpegLoading, loadFFmpeg, ffmpegLoadingProgress, error: ffmpegError } = useFFmpeg();
  const { processVideo, isProcessing, progress, currentTask } = useVideoProcessor();
  
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
      if (sourceVideoUrl) {
        URL.revokeObjectURL(sourceVideoUrl);
      }
      
      if (compressionResult?.url) {
        URL.revokeObjectURL(compressionResult.url);
      }
    };
  }, [sourceVideoUrl, compressionResult]);
  
  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Revoke previous URLs
    if (sourceVideoUrl) {
      URL.revokeObjectURL(sourceVideoUrl);
    }
    
    if (compressionResult?.url) {
      URL.revokeObjectURL(compressionResult.url);
      setCompressionResult(null);
    }
    
    // Create a new URL for the video
    const url = URL.createObjectURL(file);
    
    setSourceVideo(file);
    setSourceVideoUrl(url);
    
    // Estimate compressed size based on selected preset
    estimateCompressedSize(file);
  };
  
  // Estimate compressed size
  const estimateCompressedSize = (file: File) => {
    const originalSize = file.size;
    let estimatedRatio = 0;
    
    switch (selectedPreset) {
      case 'low':
        estimatedRatio = 0.3; // 70% reduction
        break;
      case 'medium':
        estimatedRatio = 0.5; // 50% reduction
        break;
      case 'high':
        estimatedRatio = 0.7; // 30% reduction
        break;
      case 'custom':
        // For custom, use a formula based on settings
        const crfFactor = Math.max(0.1, 1 - (customSettings.crf - 18) / 30);
        const resolutionFactor = getResolutionFactor(customSettings.resolution);
        estimatedRatio = crfFactor * resolutionFactor;
        break;
    }
    
    setEstimatedSize(Math.floor(originalSize * estimatedRatio));
    setCompressionRatio(null); // Reset actual compression ratio
  };
  
  // Get resolution factor for size estimation
  const getResolutionFactor = (resolution: string): number => {
    const [width] = resolution.split('x').map(Number);
    
    if (width <= 640) return 0.3;
    if (width <= 1280) return 0.5;
    if (width <= 1920) return 0.7;
    return 0.9;
  };
  
  // Handle preset change
  const handlePresetChange = (preset: QualityPreset) => {
    setSelectedPreset(preset);
    
    if (sourceVideo) {
      setTimeout(() => estimateCompressedSize(sourceVideo), 0);
    }
  };
  
  // Handle custom settings change
  const handleCustomSettingsChange = (settings: typeof customSettings) => {
    setCustomSettings(settings);
    
    if (sourceVideo && selectedPreset === 'custom') {
      setTimeout(() => estimateCompressedSize(sourceVideo), 0);
    }
  };
  
  // Compress video
  const compressVideo = async () => {
    if (!sourceVideo) {
      setErrorMessage('Please upload a video first');
      return;
    }
    
    if (!isFFmpegLoaded) {
      try {
        setErrorMessage(null);
        await loadFFmpeg();
      } catch (err) {
        // Error is handled by the hook, we just need to return
        return;
      }
    }
    
    try {
      let command: string[];
      
      if (selectedPreset === 'custom') {
        command = [
          '-vf', `scale=${customSettings.resolution}`,
          '-c:v', 'libx264',
          '-crf', customSettings.crf.toString(),
          '-preset', customSettings.preset,
          '-c:a', 'aac',
          '-b:a', customSettings.audioBitrate,
        ];
      } else {
        const preset = selectedPreset;
        const quality = qualityPresets[preset];
        
        command = [
          '-vf', `scale=${quality.resolution}`,
          '-c:v', 'libx264',
          '-crf', quality.crf.toString(),
          '-preset', quality.preset,
          '-c:a', 'aac',
          '-b:a', quality.audioBitrate,
        ];
      }
      
      const result = await processVideo(sourceVideo, {
        command,
        outputExtension: 'mp4',
        outputMimeType: 'video/mp4',
      });
      
      setCompressionResult({
        url: result.url,
        size: result.size,
        filename: result.filename,
      });
      
      // Calculate actual compression ratio
      const originalSize = sourceVideo.size;
      const compressedSize = result.size;
      const ratio = compressedSize / originalSize;
      setCompressionRatio(ratio);
      
      // Clear any error messages
      setErrorMessage(null);
      
    } catch (err) {
      console.error('Error compressing video:', err);
      
      // Provide a more helpful error message
      if (err instanceof Error) {
        if (err.message.includes('memory') || err.message.includes('allocation')) {
          setErrorMessage('Not enough memory to compress this video. Try with a smaller video or lower quality settings.');
        } else if (err.message.includes('format') || err.message.includes('codec')) {
          setErrorMessage('This video format may not be supported. Try converting it to MP4 first.');
        } else {
          setErrorMessage(`Failed to compress video: ${err.message}`);
        }
      } else {
        setErrorMessage('Failed to compress video due to an unknown error.');
      }
    }
  };
  
  // Download compressed video
  const downloadCompressedVideo = () => {
    if (!compressionResult) return;
    
    const a = document.createElement('a');
    a.href = compressionResult.url;
    a.download = compressionResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-primary-light rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Compressor</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Reduce video file size while maintaining quality - all processing happens in your browser.
        </p>
        <PrivacyBadge />
      </div>

      {/* SharedArrayBuffer warning */}
      {!isSharedArrayBufferSupported && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 m-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 dark:text-yellow-300 mr-2" />
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              Your browser may have limited support for video compression. For best results, use Chrome or Edge with HTTPS.
            </p>
          </div>
        </div>
      )}

      {/* FFmpeg Status */}
      <FFmpegStatus />

      {/* Error message (non-FFmpeg errors) */}
      {errorMessage && !ffmpegError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-600 m-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300 mr-2" />
            <div>
              <p className="text-sm text-red-700 dark:text-red-200">{errorMessage}</p>
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
          description="Upload a video file to compress (MP4, WebM, AVI, MOV, etc.)"
          disabled={isProcessing}
        />
      </div>
      
      {sourceVideo && (
        <>
          {/* Video preview section */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Source video */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Original Video</h2>
                <VideoPreview
                  src={sourceVideoUrl}
                  title={sourceVideo.name}
                />
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Size: {formatFileSize(sourceVideo.size)}
                </div>
              </div>
              
              {/* Compressed video */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Compressed Video</h2>
                {compressionResult ? (
                  <>
                    <VideoPreview
                      src={compressionResult.url}
                      title="Compressed Video"
                    />
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Size: {formatFileSize(compressionResult.size)}
                        {compressionRatio !== null && (
                          <span className="ml-2 text-green-600 dark:text-green-400">
                            ({Math.round((1 - compressionRatio) * 100)}% smaller)
                          </span>
                        )}
                      </span>
                      <button
                        onClick={downloadCompressedVideo}
                        className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <BarChart className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {isProcessing 
                        ? 'Processing video...' 
                        : 'Compressed video will appear here'}
                    </p>
                    {estimatedSize !== null && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Estimated size: {formatFileSize(estimatedSize)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Compression settings */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Compression Settings</h2>
            <CompressionSettings
              selectedPreset={selectedPreset}
              customSettings={customSettings}
              onPresetChange={handlePresetChange}
              onCustomSettingsChange={handleCustomSettingsChange}
              disabled={isProcessing}
            />
          </div>
          
          {/* Size comparison */}
          {sourceVideo && (compressionResult || estimatedSize !== null) && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Size Comparison</h2>
              <SizeComparison
                originalSize={sourceVideo.size}
                compressedSize={compressionResult?.size || estimatedSize || 0}
                isEstimate={!compressionResult}
              />
            </div>
          )}
          
          {/* Compress button */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <button
                onClick={compressVideo}
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
                    ? 'Compressing...' 
                    : 'Start Compression'}
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

export default VideoCompressor; 