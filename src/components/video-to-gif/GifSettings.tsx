import React from 'react';
import { formatDuration } from '../../utils/fileUtils';

interface GifSettings {
  startTime: number;
  endTime: number | null; // null means until the end
  frameRate: number;
  quality: number;
  width: number | null; // null means original width
  height: number | null; // null means maintain aspect ratio
  loop: number; // 0 means infinite
}

interface GifSettingsProps {
  settings: GifSettings;
  onSettingsChange: (settings: Partial<GifSettings>) => void;
  currentTime: number;
  videoDuration: number;
  videoWidth: number;
  videoHeight: number;
  disabled?: boolean;
}

const GifSettingsComponent: React.FC<GifSettingsProps> = ({
  settings,
  onSettingsChange,
  currentTime,
  videoDuration,
  videoWidth,
  videoHeight,
  disabled = false,
}) => {
  // Calculate if this is a large video that might cause memory issues
  const isLargeVideo = videoWidth * videoHeight > 1000000 || videoDuration > 300;
  
  // Calculate estimated memory usage (very rough estimate)
  const estimatedMemoryMB = Math.round(
    (videoWidth * videoHeight * settings.frameRate * 
    (settings.endTime ? settings.endTime - settings.startTime : videoDuration - settings.startTime) * 4) / 
    (1024 * 1024)
  );
  
  // Calculate estimated GIF size (rough estimate)
  const estimatedSizeMB = Math.round(
    (videoWidth * videoHeight * settings.frameRate * 
    (settings.endTime ? settings.endTime - settings.startTime : videoDuration - settings.startTime)) / 
    (1024 * 1024 * 8)
  );

  // Handle time range changes
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = parseFloat(e.target.value);
    if (isNaN(newStartTime)) return;
    
    // Ensure start time is within bounds
    const startTime = Math.max(0, Math.min(newStartTime, videoDuration));
    
    // Ensure start time is less than end time
    if (settings.endTime !== null && startTime < settings.endTime) {
      onSettingsChange({ startTime });
    } else {
      onSettingsChange({ 
        startTime, 
        endTime: Math.min(startTime + 1, videoDuration) 
      });
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = parseFloat(e.target.value);
    
    // null means until the end
    if (isNaN(newEndTime) || newEndTime >= videoDuration) {
      onSettingsChange({ endTime: null });
      return;
    }
    
    // Ensure end time is within bounds and greater than start time
    const endTime = Math.max(settings.startTime + 0.1, Math.min(newEndTime, videoDuration));
    onSettingsChange({ endTime });
  };

  // Set start time to current time
  const setStartTimeToCurrent = () => {
    // Ensure start time is less than end time
    if (settings.endTime !== null && currentTime < settings.endTime) {
      onSettingsChange({ startTime: currentTime });
    } else {
      onSettingsChange({ 
        startTime: currentTime, 
        endTime: Math.min(currentTime + 1, videoDuration) 
      });
    }
  };

  // Set end time to current time
  const setEndTimeToCurrent = () => {
    // Ensure end time is greater than start time
    if (currentTime > settings.startTime) {
      onSettingsChange({ endTime: currentTime });
    } else {
      onSettingsChange({ endTime: settings.startTime + 1 });
    }
  };

  // Reset time range
  const resetTimeRange = () => {
    onSettingsChange({ startTime: 0, endTime: null });
  };

  // Handle width change
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value);
    
    if (isNaN(width) || width <= 0) {
      onSettingsChange({ width: null });
      return;
    }
    
    // Calculate height based on aspect ratio
    const aspectRatio = videoHeight / videoWidth;
    const height = Math.round(width * aspectRatio);
    
    onSettingsChange({ width, height });
  };

  // Handle frame rate change
  const handleFrameRateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const frameRate = parseInt(e.target.value);
    onSettingsChange({ frameRate });
  };

  // Handle loop count change
  const handleLoopCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loop = parseInt(e.target.value);
    onSettingsChange({ loop });
  };

  // Calculate GIF duration
  const gifDuration = settings.endTime !== null 
    ? settings.endTime - settings.startTime 
    : videoDuration - settings.startTime;

  return (
    <div className="space-y-6">
      {/* Memory usage warning for large videos */}
      {isLargeVideo && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 text-sm">
          <p className="text-yellow-700 dark:text-yellow-200">
            <strong>Large Video Warning:</strong> This video is quite large. Creating a GIF may use significant memory 
            (est. {estimatedMemoryMB}MB) and result in a large file (est. {estimatedSizeMB}MB).
          </p>
          <p className="text-yellow-700 dark:text-yellow-200 mt-1">
            Consider reducing duration, dimensions, or frame rate to avoid memory issues.
          </p>
        </div>
      )}

      {/* Time range */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range</h3>
          <button
            onClick={resetTimeRange}
            disabled={disabled}
            className={`text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            Reset to Full Length
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start time */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Time
              </label>
              <button
                onClick={setStartTimeToCurrent}
                disabled={disabled}
                className={`text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                Set to Current
              </button>
            </div>
            <div className="flex items-center">
              <input
                type="range"
                min={0}
                max={videoDuration}
                step={0.1}
                value={settings.startTime}
                onChange={handleStartTimeChange}
                disabled={disabled}
                className={`flex-1 mr-2 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 w-20 text-right">
                {formatDuration(settings.startTime)}
              </span>
            </div>
          </div>

          {/* End time */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Time
              </label>
              <button
                onClick={setEndTimeToCurrent}
                disabled={disabled}
                className={`text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                Set to Current
              </button>
            </div>
            <div className="flex items-center">
              <input
                type="range"
                min={settings.startTime + 0.1}
                max={videoDuration}
                step={0.1}
                value={settings.endTime === null ? videoDuration : settings.endTime}
                onChange={handleEndTimeChange}
                disabled={disabled}
                className={`flex-1 mr-2 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 w-20 text-right">
                {settings.endTime === null ? formatDuration(videoDuration) : formatDuration(settings.endTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          GIF Duration: {formatDuration(gifDuration)}
        </div>
      </div>

      {/* Frame rate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Frame Rate
        </label>
        <select
          value={settings.frameRate}
          onChange={handleFrameRateChange}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <option value={10}>10 fps (Smaller file size)</option>
          <option value={15}>15 fps (Balanced)</option>
          <option value={20}>20 fps (Smoother)</option>
          <option value={25}>25 fps (Very smooth)</option>
          <option value={30}>30 fps (Full motion)</option>
        </select>
      </div>

      {/* Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Width (height will adjust automatically)
        </label>
        <input
          type="number"
          min={1}
          placeholder="Original width"
          value={settings.width || ''}
          onChange={handleWidthChange}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Original: {videoWidth}x{videoHeight}
        </p>
      </div>

      {/* Loop count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Loop Count
        </label>
        <select
          value={settings.loop}
          onChange={handleLoopCountChange}
          disabled={disabled}
          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <option value={0}>Infinite</option>
          <option value={1}>1 time (play once)</option>
          <option value={2}>2 times</option>
          <option value={3}>3 times</option>
          <option value={5}>5 times</option>
          <option value={10}>10 times</option>
        </select>
      </div>
    </div>
  );
};

export default GifSettingsComponent; 