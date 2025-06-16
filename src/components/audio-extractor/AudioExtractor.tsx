import React, { useState, useEffect } from 'react';
import { Volume2, AlertCircle } from 'lucide-react';
import FileUploader from '../shared/FileUploader';
import VideoPreview from '../shared/VideoPreview';
import ProgressBar from '../shared/ProgressBar';
import AudioSettings from './AudioSettings';
import AudioPreview from './AudioPreview';
import FFmpegStatus from '../shared/FFmpegStatus';
import { useFFmpeg } from '../../hooks/useFFmpeg';
import { useVideoProcessor } from '../../hooks/useVideoProcessor';
import { formatFileSize, formatDuration } from '../../utils/fileUtils';
import { audioFormats } from '../../utils/videoFormats';

interface AudioSettings {
  format: 'mp3' | 'wav' | 'aac' | 'ogg';
  bitrate: string;
  startTime: number;
  endTime: number | null; // null means until the end
  preserveMetadata: boolean;
}

interface AudioResult {
  url: string;
  size: number;
  duration: number;
  format: string;
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

const AudioExtractor: React.FC = () => {
  // Source video state
  const [sourceVideo, setSourceVideo] = useState<File | null>(null);
  const [sourceVideoUrl, setSourceVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  // Audio settings
  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    format: 'mp3',
    bitrate: '192k',
    startTime: 0,
    endTime: null,
    preserveMetadata: true,
  });
  
  // Extracted audio result
  const [audioResult, setAudioResult] = useState<AudioResult | null>(null);
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
      
      if (audioResult?.url) {
        URL.revokeObjectURL(audioResult.url);
      }
    };
  }, [sourceVideoUrl, audioResult]);
  
  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Revoke previous URLs
    if (sourceVideoUrl) {
      URL.revokeObjectURL(sourceVideoUrl);
    }
    
    if (audioResult?.url) {
      URL.revokeObjectURL(audioResult.url);
      setAudioResult(null);
    }
    
    // Create a new URL for the video
    const url = URL.createObjectURL(file);
    
    setSourceVideo(file);
    setSourceVideoUrl(url);
    
    // Reset audio settings
    setAudioSettings(prev => ({
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
  const handleSettingsChange = (settings: Partial<AudioSettings>) => {
    setAudioSettings(prev => ({
      ...prev,
      ...settings,
    }));
  };
  
  // Extract audio
  const extractAudio = async () => {
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
      // Clean up previous audio result
      if (audioResult?.url) {
        URL.revokeObjectURL(audioResult.url);
      }
      
      // Build FFmpeg command
      const commands: string[] = [];
      
      // Time range parameters
      if (audioSettings.startTime > 0) {
        commands.push('-ss', audioSettings.startTime.toString());
      }
      
      if (audioSettings.endTime !== null) {
        const duration = audioSettings.endTime - audioSettings.startTime;
        commands.push('-t', duration.toString());
      }
      
      // Audio codec parameters
      commands.push('-vn'); // No video
      
      // Format-specific parameters
      switch (audioSettings.format) {
        case 'mp3':
          commands.push('-acodec', 'libmp3lame', '-ab', audioSettings.bitrate);
          break;
        case 'wav':
          commands.push('-acodec', 'pcm_s16le');
          break;
        case 'aac':
          commands.push('-acodec', 'aac', '-ab', audioSettings.bitrate);
          break;
        case 'ogg':
          commands.push('-acodec', 'libvorbis', '-ab', audioSettings.bitrate);
          break;
      }
      
      // Preserve metadata if requested
      if (audioSettings.preserveMetadata) {
        commands.push('-map_metadata', '0');
      }
      
      // Process the video
      const result = await processVideo(sourceVideo, {
        command: commands,
        outputExtension: audioSettings.format,
        outputMimeType: audioFormats[audioSettings.format].mimeType,
      });
      
      // Calculate audio duration
      const audioDuration = audioSettings.endTime !== null 
        ? audioSettings.endTime - audioSettings.startTime 
        : videoDuration - audioSettings.startTime;
      
      // Set the audio result
      setAudioResult({
        url: result.url,
        size: result.size,
        duration: audioDuration,
        format: audioSettings.format,
        filename: result.filename,
      });
      
      // Clear any error messages
      setErrorMessage(null);
      
    } catch (err) {
      console.error('Error extracting audio:', err);
      
      // Provide a more helpful error message
      if (err instanceof Error) {
        if (err.message.includes('memory') || err.message.includes('allocation')) {
          setErrorMessage('Not enough memory to process this video. Try with a smaller video or a shorter section.');
        } else if (err.message.includes('format') || err.message.includes('codec')) {
          setErrorMessage('This video format may not be supported. Try converting it to MP4 first.');
        } else {
          setErrorMessage(`Failed to extract audio: ${err.message}`);
        }
      } else {
        setErrorMessage('Failed to extract audio due to an unknown error.');
      }
    }
  };
  
  // Download audio
  const downloadAudio = () => {
    if (!audioResult) return;
    
    const a = document.createElement('a');
    a.href = audioResult.url;
    
    // Create filename based on source video
    const baseName = sourceVideo?.name.substring(0, sourceVideo.name.lastIndexOf('.')) || 'audio';
    a.download = `${baseName}_audio.${audioResult.format}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Get estimated file size
  const getEstimatedSize = (): number | null => {
    if (!sourceVideo) return null;
    
    const duration = audioSettings.endTime !== null 
      ? audioSettings.endTime - audioSettings.startTime 
      : videoDuration - audioSettings.startTime;
    
    // Estimate based on format and bitrate
    let bitrateFactor = 0;
    
    switch (audioSettings.format) {
      case 'mp3':
        bitrateFactor = parseInt(audioSettings.bitrate.replace('k', '')) * 1000 / 8; // Convert to bytes per second
        break;
      case 'wav':
        bitrateFactor = 176400; // 16-bit stereo at 44.1kHz
        break;
      case 'aac':
        bitrateFactor = parseInt(audioSettings.bitrate.replace('k', '')) * 1000 / 8;
        break;
      case 'ogg':
        bitrateFactor = parseInt(audioSettings.bitrate.replace('k', '')) * 1000 / 8;
        break;
    }
    
    return Math.round(duration * bitrateFactor);
  };
  
  return (
    <div className="w-full max-w-5xl mx-auto bg-white dark:bg-primary-light rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audio Extractor</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Extract audio tracks from videos in multiple formats - all processed in your browser.
        </p>
        <PrivacyBadge />
      </div>

      {/* SharedArrayBuffer warning */}
      {!isSharedArrayBufferSupported && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 m-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 dark:text-yellow-300 mr-2" />
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              Your browser may have limited support for audio extraction. For best results, use Chrome or Edge with HTTPS.
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
          description="Upload a video file to extract audio (MP4, WebM, AVI, MOV, etc.)"
          disabled={isProcessing}
        />
      </div>
      
      {sourceVideo && (
        <>
          {/* Video and audio preview section */}
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
                    start: audioSettings.startTime,
                    end: audioSettings.endTime || undefined,
                  }}
                />
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Current Time: {formatDuration(currentTime)} / {formatDuration(videoDuration)}
                </div>
              </div>
              
              {/* Audio preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Audio Preview</h2>
                {audioResult ? (
                  <AudioPreview
                    src={audioResult.url}
                    format={audioResult.format}
                    size={audioResult.size}
                    duration={audioResult.duration}
                    onDownload={downloadAudio}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Volume2 className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {isProcessing 
                        ? 'Extracting audio...' 
                        : 'Extracted audio will appear here'}
                    </p>
                    {!isProcessing && getEstimatedSize() !== null && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Estimated size: {formatFileSize(getEstimatedSize() || 0)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Audio settings */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Audio Settings</h2>
            <AudioSettings
              settings={audioSettings}
              onSettingsChange={handleSettingsChange}
              currentTime={currentTime}
              videoDuration={videoDuration}
              disabled={isProcessing}
            />
          </div>
          
          {/* Extract button */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <button
                onClick={extractAudio}
                disabled={!sourceVideo || !isFFmpegLoaded || isProcessing}
                className={`px-5 py-3 rounded-lg font-medium text-white flex items-center justify-center
                  ${!sourceVideo || !isFFmpegLoaded || isProcessing
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors w-full md:w-auto`}
              >
                <Volume2 className="w-5 h-5 mr-2" />
                {isFFmpegLoading 
                  ? 'Loading Audio Engine...' 
                  : isProcessing 
                    ? 'Extracting...' 
                    : 'Extract Audio'}
              </button>
            </div>
            
            {/* FFmpeg loading progress */}
            {isFFmpegLoading && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading audio processing engine: {ffmpegLoadingProgress}%
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
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Loading Audio Processing Engine</h2>
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

export default AudioExtractor; 