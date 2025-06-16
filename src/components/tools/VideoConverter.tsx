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
import { AlertCircle } from 'lucide-react';

// Check if SharedArrayBuffer is supported
const isSharedArrayBufferSupported = typeof SharedArrayBuffer !== 'undefined';

const VideoConverter: React.FC = () => {
  // State variables
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp4');
  const [quality, setQuality] = useState<string>('medium'); // low, medium, high, custom
  const [resolution, setResolution] = useState<string>('');
  const [bitrate, setBitrate] = useState<string>('');
  const [framerate, setFramerate] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [videoCodec, setVideoCodec] = useState<string>('');
  const [audioCodec, setAudioCodec] = useState<string>('');
  const [audioChannels, setAudioChannels] = useState<string>('2');
  const [audioSampleRate, setAudioSampleRate] = useState<string>('44100');
  const [compressionLevel, setCompressionLevel] = useState<string>('medium');

  // Custom hooks
  const { 
    isFFmpegLoaded, 
    isFFmpegLoading,
    ffmpegLoadingProgress,
    loadFFmpeg,
    error: ffmpegError,
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

    try {
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
      {(errorMessage || ffmpegError) && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 m-4">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">
                {errorMessage || ffmpegError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* File uploader */}
      <FileUploader
        onFileUpload={handleFileUpload}
        onFileDrop={handleFileDrop}
        onFileRemove={removeFile}
        files={videoFiles}
        disabled={isConverting}
      />

      {/* Settings Panel */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormatSelector 
            selectedFormat={outputFormat} 
            onChange={setOutputFormat}
            disabled={isConverting}
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
            disabled={isConverting}
          />
        </div>
        
        <div className="mt-4">
          <button
            type="button"
            onClick={toggleAdvancedOptions}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center"
            disabled={isConverting}
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
            disabled={isConverting}
          />
        )}
      </div>
      
      {/* Preview Section */}
      {videoFiles.length > 0 && (
        <VideoPreview 
          file={videoFiles[0]} 
          convertedFile={convertedFiles[0] || null}
        />
      )}
      
      {/* Progress & Status */}
      {isConverting && (
        <ConversionProgress
          progress={conversionProgress}
          currentTask={currentTask}
          estimatedTimeRemaining={estimatedTimeRemaining}
        />
      )}

      {/* Start Conversion Button */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          <button
            type="button"
            onClick={handleStartConversion}
            disabled={isConverting || videoFiles.length === 0 || !isFFmpegLoaded}
            className={`px-5 py-3 rounded-lg font-medium text-white 
              ${isConverting || videoFiles.length === 0 || !isFFmpegLoaded
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors w-full md:w-auto`}
          >
            {isFFmpegLoading 
              ? 'Loading Video Engine...' 
              : isConverting 
                ? 'Converting...' 
                : 'Start Conversion'}
          </button>
          
          {isConverting && (
            <button
              type="button"
              onClick={abort}
              className="px-5 py-3 rounded-lg font-medium text-red-600 border border-red-600 hover:bg-red-50 transition-colors w-full md:w-auto"
            >
              Cancel Conversion
            </button>
          )}
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

      {/* Download Section */}
      {convertedFiles.length > 0 && !isConverting && (
        <DownloadSection
          convertedFiles={convertedFiles}
          originalFiles={videoFiles}
        />
      )}
    </div>
  );
};

export default VideoConverter; 