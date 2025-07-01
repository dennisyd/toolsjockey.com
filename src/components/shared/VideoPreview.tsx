import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

interface VideoPreviewProps {
  src: string;
  poster?: string;
  title?: string;
  onDurationChange?: (duration: number) => void;
  onTimeUpdate?: (time: number) => void;
  markers?: {
    start: number;
    end: number;
  };
  className?: string;
  disabled?: boolean;
}

const VideoPreview = forwardRef<HTMLVideoElement, VideoPreviewProps>((
  { src, poster, onTimeUpdate, onDurationChange, markers, className = '', disabled = false },
  ref
) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  
  // Use forwarded ref or internal ref
  const videoRef = (ref as React.RefObject<HTMLVideoElement>) || internalVideoRef;

  // Update video time when markers change
  useEffect(() => {
    if (markers && videoRef.current) {
      videoRef.current.currentTime = markers.start;
    }
  }, [markers]);

  // Handle play/pause
  const togglePlay = () => {
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

  // Handle mute/unmute
  const toggleMute = () => {
    if (disabled) return;
    
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }
    }
  };

  // Handle duration change
  const handleDurationChange = () => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      
      if (onDurationChange) {
        onDurationChange(videoDuration);
      }
    }
  };

  // Handle seeking backward
  const seekBackward = () => {
    if (disabled) return;
    
    if (videoRef.current) {
      const newTime = Math.max(0, videoRef.current.currentTime - 5);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle seeking forward
  const seekForward = () => {
    if (disabled) return;
    
    if (videoRef.current) {
      const newTime = Math.min(duration, videoRef.current.currentTime + 5);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Format time as MM:SS
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    // Event listeners
    const handleDurationChange = () => {
      if (onDurationChange && videoElement.duration) {
        onDurationChange(videoElement.duration);
      }
    };
    
    const handleTimeUpdate = () => {
      if (onTimeUpdate) {
        onTimeUpdate(videoElement.currentTime);
      }
    };
    
    // Add event listeners
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    
    // Initial duration (if already loaded)
    if (videoElement.duration && onDurationChange) {
      onDurationChange(videoElement.duration);
    }
    
    return () => {
      videoElement.removeEventListener('durationchange', handleDurationChange);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef, onDurationChange, onTimeUpdate]);
  
  // Skip to marker position
  const skipToPosition = (time: number) => {
    if (videoRef.current && !disabled) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  return (
    <div className={`video-player ${className}`}>
      <div className="relative">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className="w-full rounded-lg"
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        <div className="mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
          {/* Progress bar */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            disabled={disabled}
            className={`w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full appearance-none cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              background: duration
                ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #d1d5db ${(currentTime / duration) * 100}%, #d1d5db 100%)`
                : undefined,
            }}
          />
          
          {/* Controls */}
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={seekBackward}
                disabled={disabled}
                className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Back 5 seconds"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              
              <button
                onClick={togglePlay}
                disabled={disabled}
                className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              
              <button
                onClick={seekForward}
                disabled={disabled}
                className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Forward 5 seconds"
              >
                <SkipForward className="w-4 h-4" />
              </button>
              
              <button
                onClick={toggleMute}
                disabled={disabled}
                className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
        
        {markers && (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => skipToPosition(markers.start || 0)}
              disabled={disabled}
              className={`px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Skip to Start Marker
            </button>
            <button
              onClick={() => skipToPosition((markers.end || 0) - 2)}
              disabled={disabled}
              className={`px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Skip to End Marker
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

VideoPreview.displayName = 'VideoPreview';

export default VideoPreview; 