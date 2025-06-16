import React, { useState, useRef, useEffect } from 'react';
import type { VideoFile, ConvertedFile } from '../../../types/video';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface VideoPreviewProps {
  file: VideoFile;
  convertedFile: ConvertedFile | null;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ file, convertedFile }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<'original' | 'converted'>(
    convertedFile ? 'converted' : 'original'
  );
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update active tab when converted file becomes available
  useEffect(() => {
    if (convertedFile && activeTab === 'original') {
      setActiveTab('converted');
    }
  }, [convertedFile, activeTab]);

  // Handle video events
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Format time (seconds) to MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Get current video source based on active tab
  const getCurrentVideoSource = () => {
    if (activeTab === 'converted' && convertedFile) {
      return convertedFile.url;
    }
    return file.url;
  };

  // Get file metadata
  const getFileMetadata = () => {
    const currentFile = activeTab === 'converted' && convertedFile ? convertedFile : file;
    
    return (
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 grid grid-cols-2 gap-x-4 gap-y-2">
        <div>File name:</div>
        <div className="font-medium">{currentFile.name}</div>
        
        <div>Size:</div>
        <div className="font-medium">{(currentFile.size / (1024 * 1024)).toFixed(2)} MB</div>
        
        <div>Format:</div>
        <div className="font-medium">
          {activeTab === 'converted' && convertedFile
            ? convertedFile.format.toUpperCase()
            : file.type.split('/')[1].toUpperCase()}
        </div>
        
        {currentFile.metadata?.width && currentFile.metadata?.height && (
          <>
            <div>Resolution:</div>
            <div className="font-medium">
              {currentFile.metadata.width} x {currentFile.metadata.height}
            </div>
          </>
        )}
        
        {currentFile.metadata?.duration && (
          <>
            <div>Duration:</div>
            <div className="font-medium">{formatTime(currentFile.metadata.duration)}</div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Video Preview</h2>
      
      {/* Tabs for original/converted */}
      {convertedFile && (
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'original'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('original')}
          >
            Original
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'converted'
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('converted')}
          >
            Converted
          </button>
        </div>
      )}
      
      {/* Video player */}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={getCurrentVideoSource()}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          muted={isMuted}
          poster={file.thumbnail}
        />
        
        {/* Video controls overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress bar */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-400 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                (currentTime / (duration || 1)) * 100
              }%, #9ca3af ${(currentTime / (duration || 1)) * 100}%, #9ca3af 100%)`,
            }}
          />
          
          {/* Time display and controls */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration || 0)}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handlePlayPause}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </button>
              
              <button
                onClick={handleMuteToggle}
                className="text-white hover:text-blue-400 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-6 w-6" />
                ) : (
                  <Volume2 className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* File metadata */}
      {getFileMetadata()}
    </div>
  );
};

export default VideoPreview; 