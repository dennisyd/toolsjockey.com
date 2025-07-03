import React, { useState, useEffect } from 'react';
import FileUploader from './video-converter/FileUploader';
import FormatSelector from './video-converter/FormatSelector';
import QualitySettings from './video-converter/QualitySettings';
import VideoPreview from './video-converter/VideoPreview';
import ConversionProgress from './video-converter/ConversionProgress';
import DownloadSection from './video-converter/DownloadSection';
import PrivacyBadge from './video-converter/PrivacyBadge';
import AdvancedOptions from './video-converter/AdvancedOptions';
import { useFFmpeg } from '../../hooks/useFFmpeg';
import { useVideoConverter } from '../../hooks/useVideoConverter';
import { useFileHandler } from '../../hooks/useFileHandler';
import type { VideoFile, ConversionOptions, OutputFormat } from '../../types/video';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

// Check if SharedArrayBuffer is supported
const isSharedArrayBufferSupported = typeof SharedArrayBuffer !== 'undefined';

// Check if browser is Chrome
const isChrome = navigator.userAgent.indexOf("Chrome") > -1;

// Detect browser
const detectBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('chrome') > -1) return 'Chrome';
  if (userAgent.indexOf('firefox') > -1) return 'Firefox';
  if (userAgent.indexOf('edg') > -1) return 'Edge';
  if (userAgent.indexOf('safari') > -1) return 'Safari';
  return 'Unknown';
};

const VideoConverter: React.FC = () => {
  // State variables
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp4');
  const [quality, setQuality] = useState<string>('medium'); // low, medium, high, custom
  const [resolution, setResolution] = useState<string>('original');
  const [bitrate, setBitrate] = useState<string>('auto');
  const [framerate, setFramerate] = useState<string>('original');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoCodec, setVideoCodec] = useState<string>('auto');
  const [audioCodec, setAudioCodec] = useState<string>('auto');
  const [audioChannels, setAudioChannels] = useState<string>('original');
  const [audioSampleRate, setAudioSampleRate] = useState<string>('original');
  const [compressionLevel, setCompressionLevel] = useState<string>('medium');
  const [showCompatWarning, setShowCompatWarning] = useState(!isSharedArrayBufferSupported && !isChrome);

  // Custom hooks
  const { 
    isFFmpegLoaded, 
    isFFmpegLoading,
    error: ffmpegError,
    loadFFmpeg,
    retryLoadFFmpeg,
  } = useFFmpeg();
  
  const {
    isConverting,
    conversionProgress,
    currentTask,
    estimatedTimeRemaining,
    convertedFiles,
    convert,
    abort,
  } = useVideoConverter();
  
  const {
    handleFileUpload,
    handleFileDrop,
    removeFile,
  } = useFileHandler({
    setVideoFiles,
    setErrorMessage,
  });

  // Auto-load FFmpeg when component mounts
  useEffect(() => {
    loadFFmpeg().catch(error => {
      setErrorMessage(`Failed to load video processing engine: ${error.message}`);
    });
  }, [loadFFmpeg]);

  // Clear error message when FFmpeg loads successfully
  useEffect(() => {
    if (isFFmpegLoaded && errorMessage && errorMessage.includes('video processing engine')) {
      setErrorMessage(null);
    }
  }, [isFFmpegLoaded, errorMessage]);

  // Toggle advanced options
  const toggleAdvancedOptions = () => {
    setShowAdvanced(!showAdvanced);
  };

  // Handle starting the conversion process
  const handleStartConversion = async () => {
    if (videoFiles.length === 0) {
      setErrorMessage('Please upload at least one video file');
      return;
    }

    // Ensure FFmpeg is loaded before attempting conversion
    if (!isFFmpegLoaded) {
      setErrorMessage('Video processing engine is not loaded yet. Please wait or try refreshing the page.');
      return;
    }

    try {
      // Clear any previous errors
      setErrorMessage(null);
      
      // Collect all options
      const options: ConversionOptions = {
        outputFormat,
        quality,
        resolution: quality === 'custom' ? resolution : undefined,
        bitrate: quality === 'custom' ? bitrate : undefined,
        framerate: quality === 'custom' ? framerate : undefined,
        videoCodec: videoCodec || undefined,
        audioCodec: audioCodec || undefined,
        audioChannels: audioChannels || undefined,
        audioSampleRate: audioSampleRate || undefined,
        compressionLevel: compressionLevel || undefined,
      };

      await convert(videoFiles, options);
    } catch (error) {
      setErrorMessage(`Conversion error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Dismiss compatibility warning
  const dismissCompatWarning = () => {
    setShowCompatWarning(false);
  };

  // Get current browser
  const currentBrowser = detectBrowser();

  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-primary-light rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Video Converter</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Convert videos between different formats without uploading to servers.
        </p>
        <PrivacyBadge />
      </div>

      {/* SharedArrayBuffer warning */}
      {!isSharedArrayBufferSupported && !isChrome && showCompatWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4 relative">
          <button 
            onClick={dismissCompatWarning}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            aria-label="Dismiss warning"
          >
            <X size={18} />
          </button>
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Browser Compatibility Notice:</strong> {currentBrowser === 'Chrome' || currentBrowser === 'Edge' || currentBrowser === 'Firefox' ? (
                  <>
                    Your browser ({currentBrowser}) supports video processing, but the site may not be running in a secure context. 
                    The converter will use a fallback method which may be slower.
                  </>
                ) : (
                  <>
                    Your browser ({currentBrowser}) doesn't fully support SharedArrayBuffer, 
                    which is required for optimal video processing. For best results, please use Chrome, Edge, or Firefox.
                  </>
                )}
              </p>
              <div className="mt-2">
                <button
                  onClick={dismissCompatWarning}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Continue Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error messages */}
      {(errorMessage || ffmpegError) && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 m-4">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div className="ml-3 flex-grow">
              <p className="text-sm text-red-700 dark:text-red-400">
                {errorMessage || ffmpegError}
              </p>
              {(errorMessage?.includes('video processing engine') || ffmpegError) && (
                <button 
                  onClick={retryLoadFFmpeg}
                  className="mt-2 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <RefreshCw size={16} className="mr-1" /> Retry Loading Video Engine
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isFFmpegLoading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 m-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent mr-3"></div>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Loading video processing engine... This may take a moment.
            </p>
          </div>
        </div>
      )}

      {/* File uploader */}
      <FileUploader
        onFileUpload={handleFileUpload}
        onFileDrop={handleFileDrop}
        onFileRemove={removeFile}
        files={videoFiles}
        disabled={isConverting || isFFmpegLoading}
      />

      {/* Settings Panel */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormatSelector 
            selectedFormat={outputFormat} 
            onChange={setOutputFormat}
            disabled={isConverting || isFFmpegLoading}
          />
          <QualitySettings 
            quality={quality}
            resolution={resolution}
            bitrate={bitrate}
            framerate={framerate}
            onQualityChange={setQuality}
            onResolutionChange={setResolution}
            onBitrateChange={setBitrate}
            onFramerateChange={setFramerate}
            disabled={isConverting || isFFmpegLoading}
          />
        </div>
        
        <div className="mt-4">
          <button
            type="button"
            onClick={toggleAdvancedOptions}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center"
            disabled={isConverting || isFFmpegLoading}
          >
            {showAdvanced ? '↑ Hide advanced options' : '↓ Show advanced options'}
          </button>
        </div>
        
        {showAdvanced && (
          <AdvancedOptions
            options={{
              videoCodec,
              audioCodec,
              audioChannels,
              audioSampleRate,
              compressionLevel,
            }}
            onChange={(options) => {
              setVideoCodec(options.videoCodec);
              setAudioCodec(options.audioCodec);
              setAudioChannels(options.audioChannels);
              setAudioSampleRate(options.audioSampleRate);
              setCompressionLevel(options.compressionLevel);
            }}
            outputFormat={outputFormat}
            disabled={isConverting || isFFmpegLoading}
          />
        )}
      </div>
      
      {/* Preview Section */}
      {videoFiles.length > 0 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VideoPreview file={videoFiles[0]} />
            <div>
              <h3 className="font-medium mb-2">Video Information</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                <p><span className="font-medium">File:</span> {videoFiles[0].file.name}</p>
                <p><span className="font-medium">Size:</span> {(videoFiles[0].file.size / (1024 * 1024)).toFixed(2)} MB</p>
                <p><span className="font-medium">Type:</span> {videoFiles[0].file.type || 'Unknown'}</p>
                {videoFiles[0].metadata?.duration && (
                  <p><span className="font-medium">Duration:</span> {formatDuration(videoFiles[0].metadata.duration)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Conversion Controls */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        {isConverting ? (
          <div className="space-y-4">
            <ConversionProgress 
              progress={conversionProgress} 
              currentTask={currentTask}
              estimatedTimeRemaining={estimatedTimeRemaining}
            />
            <button
              onClick={abort}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              Cancel Conversion
            </button>
          </div>
        ) : (
          <button
            onClick={handleStartConversion}
            disabled={videoFiles.length === 0 || isFFmpegLoading || !isFFmpegLoaded}
            className={`w-full font-medium py-3 px-4 rounded-md transition-colors ${
              videoFiles.length === 0 || isFFmpegLoading || !isFFmpegLoaded
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isFFmpegLoading 
              ? 'Loading Video Engine...' 
              : videoFiles.length === 0 
                ? 'Upload Video to Convert' 
                : `Convert to ${outputFormat.toUpperCase()}`}
          </button>
        )}
      </div>
      
      {/* Download Section */}
      {convertedFiles.length > 0 && !isConverting && (
        <DownloadSection files={convertedFiles} />
      )}
    </div>
  );
};

// Helper function to format duration in seconds to MM:SS format
const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default VideoConverter; 