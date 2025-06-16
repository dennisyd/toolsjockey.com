import React, { useState, useRef, useEffect } from 'react';
import { formatDuration } from '../../utils/fileUtils';

interface VideoClip {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  name: string;
  processed?: boolean;
  url?: string;
  size?: number;
}

interface TimelineSliderProps {
  duration: number;
  currentTime: number;
  clips: VideoClip[];
  currentClipId: string | null;
  onTimeChange: (time: number) => void;
  onClipChange: (clipId: string) => void;
  onClipUpdate: (clipId: string, updates: Partial<VideoClip>) => void;
  disabled?: boolean;
}

const TimelineSlider: React.FC<TimelineSliderProps> = ({
  duration,
  currentTime,
  clips,
  currentClipId,
  onTimeChange,
  onClipChange,
  onClipUpdate,
  disabled = false,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<'playhead' | 'start' | 'end' | null>(null);
  
  // Generate time markers
  const generateTimeMarkers = () => {
    if (duration <= 0) return [];
    
    const markers = [];
    const interval = duration > 600 ? 60 : duration > 60 ? 10 : 5; // Different intervals based on duration
    const count = Math.min(10, Math.floor(duration / interval) + 1);
    
    for (let i = 0; i < count; i++) {
      const time = i * (duration / (count - 1));
      markers.push({
        time,
        label: formatDuration(time),
        position: (time / duration) * 100,
      });
    }
    
    return markers;
  };
  
  const timeMarkers = generateTimeMarkers();
  
  // Handle mouse down on timeline
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;
    
    onTimeChange(newTime);
    setIsDragging(true);
    setDragTarget('playhead');
  };
  
  // Handle mouse move
  const handleMouseMove = (e: MouseEvent) => {
    if (disabled || !isDragging || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;
    
    if (dragTarget === 'playhead') {
      onTimeChange(newTime);
    } else if (dragTarget === 'start' && currentClipId) {
      const clip = clips.find(c => c.id === currentClipId);
      if (clip) {
        const newStart = Math.min(clip.endTime - 0.1, newTime);
        onClipUpdate(currentClipId, { startTime: newStart });
      }
    } else if (dragTarget === 'end' && currentClipId) {
      const clip = clips.find(c => c.id === currentClipId);
      if (clip) {
        const newEnd = Math.max(clip.startTime + 0.1, newTime);
        onClipUpdate(currentClipId, { endTime: newEnd });
      }
    }
  };
  
  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
    setDragTarget(null);
  };
  
  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragTarget, currentClipId, clips, duration]);
  
  // Handle start handle drag
  const handleStartHandleDrag = (e: React.MouseEvent, clipId: string) => {
    if (disabled) return;
    
    e.stopPropagation();
    setIsDragging(true);
    setDragTarget('start');
    onClipChange(clipId);
  };
  
  // Handle end handle drag
  const handleEndHandleDrag = (e: React.MouseEvent, clipId: string) => {
    if (disabled) return;
    
    e.stopPropagation();
    setIsDragging(true);
    setDragTarget('end');
    onClipChange(clipId);
  };
  
  // Handle clip click
  const handleClipClick = (e: React.MouseEvent, clipId: string) => {
    if (disabled) return;
    
    e.stopPropagation();
    onClipChange(clipId);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Current: {formatDuration(currentTime)}</span>
        <span>Duration: {formatDuration(duration)}</span>
      </div>
      
      {/* Timeline */}
      <div 
        ref={sliderRef}
        className={`relative h-10 bg-gray-200 dark:bg-gray-700 rounded-md ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        onMouseDown={handleTimelineMouseDown}
      >
        {/* Time markers */}
        {timeMarkers.map((marker, index) => (
          <div 
            key={index}
            className="absolute top-0 bottom-0 w-px bg-gray-400 dark:bg-gray-500"
            style={{ left: `${marker.position}%` }}
          >
            <div className="absolute -bottom-5 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400">
              {marker.label}
            </div>
          </div>
        ))}
        
        {/* Clips */}
        {clips.map(clip => {
          const startPercent = (clip.startTime / duration) * 100;
          const widthPercent = ((clip.endTime - clip.startTime) / duration) * 100;
          const isSelected = clip.id === currentClipId;
          
          return (
            <div 
              key={clip.id}
              className={`absolute top-0 bottom-0 ${
                isSelected 
                  ? 'bg-blue-500/50 dark:bg-blue-600/50 border-2 border-blue-600' 
                  : 'bg-blue-300/30 dark:bg-blue-500/30 hover:bg-blue-400/40 dark:hover:bg-blue-500/40'
              } rounded-md ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'} transition-colors`}
              style={{ left: `${startPercent}%`, width: `${widthPercent}%` }}
              onClick={(e) => handleClipClick(e, clip.id)}
            >
              {isSelected && !disabled && (
                <>
                  {/* Start handle */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600 cursor-ew-resize"
                    onMouseDown={(e) => handleStartHandleDrag(e, clip.id)}
                  />
                  
                  {/* End handle */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 w-2 bg-blue-600 cursor-ew-resize"
                    onMouseDown={(e) => handleEndHandleDrag(e, clip.id)}
                  />
                </>
              )}
            </div>
          );
        })}
        
        {/* Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default TimelineSlider; 