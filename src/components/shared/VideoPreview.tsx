import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

interface VideoPreviewProps {
  src: string;
  poster?: string;
  title?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onDurationChange?: (duration: number) => void;
  markers?: { start?: number; end?: number };
  className?: string;
  disabled?: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  src,
  poster,
  title,
  onTimeUpdate,
  onDurationChange,
  markers,
  className = '',
  disabled = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update video time when markers change
  useEffect(() => {
    if (videoRef.current && markers?.start !== undefined) {
      videoRef.current.currentTime = markers.start;
      setCurrentTime(markers.start);
    }
  }, [markers?.start]);

  // Handle video events
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }
      
      // If end marker is set and we've reached it, pause the video
      if (markers?.end !== undefined && time >= markers.end) {
        videoRef.current.pause();
        setIsPlaying(false);
        
        // Optionally loop back to start marker
        if (markers?.start !== undefined) {
          videoRef.current.currentTime = markers.start;
          setCurrentTime(markers.start);
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      
      if (onDurationChange) {
        onDurationChange(videoDuration);
      }
      
      // Set initial time to start marker if provided
      if (markers?.start !== undefined) {
        videoRef.current.currentTime = markers.start;
        setCurrentTime(markers.start);
      }
    }
  };

  const handlePlayPause = () => {
    if (disabled) return;
    
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
    if (disabled) return;
    
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleSkipForward = () => {
    if (disabled) return;
    
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.currentTime + 5, duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSkipBack = () => {
    if (disabled) return;
    
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - 5, 0);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Format time (seconds) to MM:SS
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={`relative ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      )}
      
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
          muted={isMuted}
          playsInline
        />
        
        {/* Video controls overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 ${disabled ? 'opacity-70' : ''}`}>
          {/* Progress bar with markers */}
          <div className="relative">
            {/* Markers */}
            {markers?.start !== undefined && (
              <div 
                className="absolute top-1/2 w-1 h-4 bg-blue-500 -translate-y-1/2 pointer-events-none z-10"
                style={{ left: `${(markers.start / duration) * 100}%` }}
              />
            )}
            {markers?.end !== undefined && (
              <div 
                className="absolute top-1/2 w-1 h-4 bg-red-500 -translate-y-1/2 pointer-events-none z-10"
                style={{ left: `${(markers.end / duration) * 100}%` }}
              />
            )}
            
            {/* Progress range input */}
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              disabled={disabled}
              className={`w-full h-1.5 bg-gray-400 rounded-lg appearance-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                  (currentTime / (duration || 1)) * 100
                }%, #9ca3af ${(currentTime / (duration || 1)) * 100}%, #9ca3af 100%)`,
              }}
            />
          </div>
          
          {/* Time display and controls */}
          <div className="flex items-center justify-between mt-2">
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration || 0)}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSkipBack}
                disabled={disabled}
                className={`text-white hover:text-blue-400 transition-colors ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                aria-label="Skip back 5 seconds"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button
                onClick={handlePlayPause}
                disabled={disabled}
                className={`text-white hover:text-blue-400 transition-colors ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </button>
              
              <button
                onClick={handleSkipForward}
                disabled={disabled}
                className={`text-white hover:text-blue-400 transition-colors ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                aria-label="Skip forward 5 seconds"
              >
                <SkipForward className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleMuteToggle}
                disabled={disabled}
                className={`text-white hover:text-blue-400 transition-colors ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview; 