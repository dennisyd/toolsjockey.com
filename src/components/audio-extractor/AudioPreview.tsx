import React, { useState, useRef, useEffect } from 'react';
import { Download, Play, Pause, Volume2 } from 'lucide-react';
import { formatFileSize, formatDuration } from '../../utils/fileUtils';

interface AudioPreviewProps {
  src: string;
  format: string;
  size: number;
  duration: number;
  onDownload: () => void;
}

const AudioPreview: React.FC<AudioPreviewProps> = ({
  src,
  format,
  size,
  duration,
  onDownload,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Toggle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
  };

  // Update playing state when audio plays or pauses
  useEffect(() => {
    const audio = audioRef.current;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    
    if (audio) {
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('ended', handleEnded);
    }
    
    return () => {
      if (audio) {
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Hidden audio element */}
      <audio 
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        className="hidden"
      />
      
      {/* Waveform visualization (simplified) */}
      <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
        <div className="flex items-center justify-center h-full w-full relative">
          {/* Simple audio visualization */}
          <div className="flex items-center justify-center space-x-1 w-full px-8">
            {Array.from({ length: 40 }).map((_, i) => {
              // Create a simple visualization pattern
              const height = 20 + Math.sin((i / 3) + (currentTime * 2)) * 15 + Math.random() * 10;
              const isActive = i / 40 < currentTime / duration;
              
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full ${
                    isActive ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>
          
          {/* Play button overlay */}
          <button
            onClick={togglePlay}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>
      </div>
      
      {/* Playback controls */}
      <div className="space-y-2">
        {/* Time slider */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
            {formatDuration(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
            {formatDuration(duration)}
          </span>
        </div>
        
        {/* Volume control */}
        <div className="flex items-center space-x-2">
          <Volume2 size={16} className="text-gray-600 dark:text-gray-400" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
      
      {/* Audio info */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 border-t pt-3 mt-3 border-gray-200 dark:border-gray-700">
        <div>
          <p><strong>Format:</strong> {format.toUpperCase()}</p>
          <p><strong>Size:</strong> {formatFileSize(size)}</p>
          <p><strong>Duration:</strong> {formatDuration(duration)}</p>
        </div>
        
        {/* Download button */}
        <button
          onClick={onDownload}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </button>
      </div>
    </div>
  );
};

export default AudioPreview; 