import React from 'react';
import { formatDuration } from '../../utils/fileUtils';
import { audioFormats } from '../../utils/videoFormats';

interface AudioSettingsProps {
  settings: {
    format: 'mp3' | 'wav' | 'aac' | 'ogg';
    bitrate: string;
    startTime: number;
    endTime: number | null;
    preserveMetadata: boolean;
  };
  onSettingsChange: (settings: Partial<{
    format: 'mp3' | 'wav' | 'aac' | 'ogg';
    bitrate: string;
    startTime: number;
    endTime: number | null;
    preserveMetadata: boolean;
  }>) => void;
  currentTime: number;
  videoDuration: number;
  disabled?: boolean;
}

const AudioSettings: React.FC<AudioSettingsProps> = ({
  settings,
  onSettingsChange,
  currentTime,
  videoDuration,
  disabled = false,
}) => {
  // Available bitrates based on format
  const getBitrateOptions = () => {
    switch (settings.format) {
      case 'mp3':
        return ['128k', '192k', '256k', '320k'];
      case 'aac':
        return ['96k', '128k', '192k', '256k'];
      case 'ogg':
        return ['96k', '128k', '192k', '256k'];
      default:
        return [];
    }
  };

  // Handle format change
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const format = e.target.value as 'mp3' | 'wav' | 'aac' | 'ogg';
    
    // Update bitrate to a default value for the selected format
    let bitrate = settings.bitrate;
    
    if (format === 'wav') {
      bitrate = '';
    } else if (format === 'mp3') {
      bitrate = '192k';
    } else if (format === 'aac' || format === 'ogg') {
      bitrate = '128k';
    }
    
    onSettingsChange({ format, bitrate });
  };

  // Handle bitrate change
  const handleBitrateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ bitrate: e.target.value });
  };

  // Handle start time change
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (isNaN(value)) return;
    
    // Ensure start time is within bounds
    const startTime = Math.max(0, Math.min(value, videoDuration));
    
    // Ensure start time is less than end time
    if (settings.endTime !== null && startTime >= settings.endTime) {
      onSettingsChange({ startTime, endTime: Math.min(startTime + 1, videoDuration) });
    } else {
      onSettingsChange({ startTime });
    }
  };

  // Handle end time change
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    
    // null means until the end
    if (isNaN(value) || value >= videoDuration) {
      onSettingsChange({ endTime: null });
      return;
    }
    
    // Ensure end time is within bounds and greater than start time
    const endTime = Math.max(settings.startTime + 0.1, Math.min(value, videoDuration));
    onSettingsChange({ endTime });
  };

  // Handle preserve metadata change
  const handlePreserveMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ preserveMetadata: e.target.checked });
  };

  // Set start time to current time
  const setStartTimeToCurrent = () => {
    // Ensure start time is less than end time
    if (settings.endTime !== null && currentTime >= settings.endTime) {
      onSettingsChange({ startTime: currentTime, endTime: Math.min(currentTime + 1, videoDuration) });
    } else {
      onSettingsChange({ startTime: currentTime });
    }
  };

  // Set end time to current time
  const setEndTimeToCurrent = () => {
    // Ensure end time is greater than start time
    if (currentTime <= settings.startTime) {
      onSettingsChange({ endTime: Math.min(settings.startTime + 1, videoDuration) });
    } else {
      onSettingsChange({ endTime: currentTime });
    }
  };

  // Reset time range
  const resetTimeRange = () => {
    onSettingsChange({ startTime: 0, endTime: null });
  };

  return (
    <div className="space-y-6">
      {/* Format selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Audio Format
          </label>
          <select
            value={settings.format}
            onChange={handleFormatChange}
            disabled={disabled}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {Object.entries(audioFormats).map(([format, { name }]) => (
              <option key={format} value={format}>
                {name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {audioFormats[settings.format].description}
          </p>
        </div>

        {/* Bitrate selection (not applicable for WAV) */}
        {settings.format !== 'wav' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bitrate
            </label>
            <select
              value={settings.bitrate}
              onChange={handleBitrateChange}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {getBitrateOptions().map((bitrate) => (
                <option key={bitrate} value={bitrate}>
                  {bitrate}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Higher bitrate = better quality but larger file size
            </p>
          </div>
        )}
      </div>

      {/* Time range selection */}
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
      </div>

      {/* Preserve metadata */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="preserveMetadata"
          checked={settings.preserveMetadata}
          onChange={handlePreserveMetadataChange}
          disabled={disabled}
          className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        />
        <label htmlFor="preserveMetadata" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Preserve video metadata (title, artist, etc.)
        </label>
      </div>
    </div>
  );
};

export default AudioSettings; 