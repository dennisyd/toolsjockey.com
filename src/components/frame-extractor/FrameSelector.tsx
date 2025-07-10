import React from 'react';
import { formatDuration } from '../../utils/fileUtils';

interface ExtractionSettings {
  format: 'png' | 'jpg' | 'webp';
  quality: number; // 1-100
  mode: 'single' | 'interval';
  interval: number; // seconds between frames
  startTime: number;
  endTime: number | null; // null means until the end
}

interface FrameSelectorProps {
  settings: ExtractionSettings;
  onSettingsChange: (settings: Partial<ExtractionSettings>) => void;
  currentTime: number;
  videoDuration: number;
  disabled?: boolean;
}

const FrameSelector: React.FC<FrameSelectorProps> = ({
  settings,
  onSettingsChange,
  currentTime,
  videoDuration,
  disabled = false,
}) => {
  // Handle mode change
  const handleModeChange = (mode: 'single' | 'interval') => {
    onSettingsChange({ mode });
  };
  
  // Handle format change
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ format: e.target.value as 'png' | 'jpg' | 'webp' });
  };
  
  // Handle quality change
  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ quality: parseInt(e.target.value) });
  };
  
  // Handle interval change
  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ interval: parseFloat(e.target.value) });
  };
  
  // Handle time range changes
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = parseFloat(e.target.value);
    if (settings.endTime === null || newStartTime < settings.endTime) {
      onSettingsChange({ startTime: newStartTime });
    }
  };
  
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = parseFloat(e.target.value);
    if (newEndTime > settings.startTime) {
      onSettingsChange({ endTime: newEndTime });
    }
  };
  
  // Set current time as start or end
  const setCurrentAsStart = () => {
    if (settings.endTime === null || currentTime < settings.endTime) {
      onSettingsChange({ startTime: currentTime });
    }
  };
  
  const setCurrentAsEnd = () => {
    if (currentTime > settings.startTime) {
      onSettingsChange({ endTime: currentTime });
    }
  };
  
  // Toggle end time between specific value and null (end of video)
  const toggleEndTime = () => {
    if (settings.endTime === null) {
      onSettingsChange({ endTime: Math.min(settings.startTime + 10, videoDuration) });
    } else {
      onSettingsChange({ endTime: null });
    }
  };
  
  // Calculate estimated frame count for interval mode
  const calculateFrameCount = (): number => {
    if (settings.mode !== 'interval') return 1;
    
    const endTime = settings.endTime !== null ? settings.endTime : videoDuration;
    const duration = endTime - settings.startTime;
    return Math.floor(duration / settings.interval) + 1;
  };
  
  const estimatedFrameCount = calculateFrameCount();
  
  return (
    <div className="space-y-6">
      {/* Extraction mode */}
      <div>
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Extraction Mode</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleModeChange('single')}
            disabled={disabled}
            className={`px-4 py-2 rounded-md ${
              settings.mode === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            Single Frame
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('interval')}
            disabled={disabled}
            className={`px-4 py-2 rounded-md ${
              settings.mode === 'interval'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            Multiple Frames
          </button>
        </div>
      </div>
      
      {/* Format and quality */}
      <div>
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Output Format</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Format
            </label>
            <select
              value={settings.format}
              onChange={handleFormatChange}
              disabled={disabled}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <option value="jpg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quality: {settings.quality}%
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={settings.quality}
              onChange={handleQualityChange}
              disabled={disabled}
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
          </div>
        </div>
      </div>
      
      {/* Interval settings (for multiple frames) */}
      {settings.mode === 'interval' && (
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Interval Settings</h3>
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Multiple Frame Extraction</p>
                <p className="text-xs">Video playback is not required. The tool processes the video file directly to extract frames at the specified intervals within your time range.</p>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Interval between frames: {settings.interval} seconds
            </label>
            <input
              type="range"
              min="0.1"
              max="60"
              step="0.1"
              value={settings.interval}
              onChange={handleIntervalChange}
              disabled={disabled}
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0.1s (more frames)</span>
              <span>60s (fewer frames)</span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Time Range
              </label>
              <button
                onClick={toggleEndTime}
                disabled={disabled}
                className={`text-xs text-blue-600 dark:text-blue-400 hover:underline ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {settings.endTime === null ? 'Set End Time' : 'Use Full Duration'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex space-x-2">
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, videoDuration - 0.1)}
                    step="0.1"
                    value={settings.startTime}
                    onChange={handleStartTimeChange}
                    disabled={disabled}
                    className={`flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                  <button
                    onClick={setCurrentAsStart}
                    disabled={disabled}
                    className={`px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    Set Current
                  </button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Start: {formatDuration(settings.startTime)}
                </div>
              </div>
              
              {settings.endTime !== null && (
                <div>
                  <div className="flex space-x-2">
                    <input
                      type="range"
                      min="0"
                      max={videoDuration}
                      step="0.1"
                      value={settings.endTime}
                      onChange={handleEndTimeChange}
                      disabled={disabled}
                      className={`flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                    <button
                      onClick={setCurrentAsEnd}
                      disabled={disabled}
                      className={`px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      Set Current
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    End: {formatDuration(settings.endTime)}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Estimated Frames:
              </span>
              <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
                {estimatedFrameCount}
              </span>
            </div>
            {estimatedFrameCount > 50 && (
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Note: Extracting a large number of frames may take some time.
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Single frame settings */}
      {settings.mode === 'single' && (
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Current Frame</h3>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Current Position:
              </span>
              <span className="text-sm font-bold text-blue-800 dark:text-blue-300">
                {formatDuration(currentTime)}
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              Use the video player to navigate to the exact frame you want to extract.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrameSelector; 