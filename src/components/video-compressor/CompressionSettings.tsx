import React from 'react';
import { resolutions } from '../../utils/videoFormats';

type QualityPreset = 'low' | 'medium' | 'high' | 'custom';

interface CompressionSettingsProps {
  selectedPreset: QualityPreset;
  customSettings: {
    resolution: string;
    videoBitrate: string;
    audioBitrate: string;
    crf: number;
    preset: string;
  };
  onPresetChange: (preset: QualityPreset) => void;
  onCustomSettingsChange: (settings: {
    resolution: string;
    videoBitrate: string;
    audioBitrate: string;
    crf: number;
    preset: string;
  }) => void;
  disabled?: boolean;
}

const CompressionSettings: React.FC<CompressionSettingsProps> = ({
  selectedPreset,
  customSettings,
  onPresetChange,
  onCustomSettingsChange,
  disabled = false,
}) => {
  // Handle preset button click
  const handlePresetClick = (preset: QualityPreset) => {
    onPresetChange(preset);
  };
  
  // Handle custom settings change
  const handleCustomSettingChange = (
    key: keyof typeof customSettings,
    value: string | number
  ) => {
    onCustomSettingsChange({
      ...customSettings,
      [key]: value,
    });
  };
  
  return (
    <div>
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => handlePresetClick('low')}
          disabled={disabled}
          className={`px-4 py-2 rounded-md ${
            selectedPreset === 'low'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          Low Quality (480p)
        </button>
        <button
          type="button"
          onClick={() => handlePresetClick('medium')}
          disabled={disabled}
          className={`px-4 py-2 rounded-md ${
            selectedPreset === 'medium'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          Medium Quality (720p)
        </button>
        <button
          type="button"
          onClick={() => handlePresetClick('high')}
          disabled={disabled}
          className={`px-4 py-2 rounded-md ${
            selectedPreset === 'high'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          High Quality (1080p)
        </button>
        <button
          type="button"
          onClick={() => handlePresetClick('custom')}
          disabled={disabled}
          className={`px-4 py-2 rounded-md ${
            selectedPreset === 'custom'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          Custom Settings
        </button>
      </div>
      
      {/* Custom settings */}
      {selectedPreset === 'custom' && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">Custom Compression Settings</h3>
          
          {/* Resolution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resolution
            </label>
            <select
              value={customSettings.resolution}
              onChange={(e) => handleCustomSettingChange('resolution', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {resolutions.map((res) => (
                <option key={res.value} value={res.value}>
                  {res.label} ({res.value})
                </option>
              ))}
            </select>
          </div>
          
          {/* CRF (Quality) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quality (CRF: {customSettings.crf})
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                Lower is better quality (18-28 recommended)
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="51"
              value={customSettings.crf}
              onChange={(e) => handleCustomSettingChange('crf', parseInt(e.target.value))}
              disabled={disabled}
              className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Higher Quality (0)</span>
              <span>Lower Quality (51)</span>
            </div>
          </div>
          
          {/* Encoding Speed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Encoding Speed
            </label>
            <select
              value={customSettings.preset}
              onChange={(e) => handleCustomSettingChange('preset', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <option value="ultrafast">Ultrafast (Lowest Quality)</option>
              <option value="superfast">Superfast</option>
              <option value="veryfast">Very Fast</option>
              <option value="faster">Faster</option>
              <option value="fast">Fast</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="slow">Slow (Better Quality)</option>
              <option value="slower">Slower</option>
              <option value="veryslow">Very Slow (Best Quality)</option>
            </select>
          </div>
          
          {/* Audio Bitrate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Audio Bitrate
            </label>
            <select
              value={customSettings.audioBitrate}
              onChange={(e) => handleCustomSettingChange('audioBitrate', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <option value="64k">64 kbps (Low)</option>
              <option value="96k">96 kbps</option>
              <option value="128k">128 kbps (Standard)</option>
              <option value="192k">192 kbps (High)</option>
              <option value="256k">256 kbps (Very High)</option>
              <option value="320k">320 kbps (Extreme)</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Preset descriptions */}
      {selectedPreset !== 'custom' && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {selectedPreset === 'low' && (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Low Quality (480p)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Resolution: 854x480</li>
                <li>Video Quality: CRF 28</li>
                <li>Audio Bitrate: 96 kbps</li>
                <li>Encoding Speed: Fast</li>
                <li>Ideal for: Saving storage space, sharing on messaging apps</li>
                <li>Expected reduction: ~70% smaller file size</li>
              </ul>
            </div>
          )}
          
          {selectedPreset === 'medium' && (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Medium Quality (720p)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Resolution: 1280x720</li>
                <li>Video Quality: CRF 23</li>
                <li>Audio Bitrate: 128 kbps</li>
                <li>Encoding Speed: Medium</li>
                <li>Ideal for: Balanced quality and file size, social media uploads</li>
                <li>Expected reduction: ~50% smaller file size</li>
              </ul>
            </div>
          )}
          
          {selectedPreset === 'high' && (
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">High Quality (1080p)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Resolution: 1920x1080</li>
                <li>Video Quality: CRF 18</li>
                <li>Audio Bitrate: 192 kbps</li>
                <li>Encoding Speed: Slow</li>
                <li>Ideal for: Preserving quality, professional use</li>
                <li>Expected reduction: ~30% smaller file size</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompressionSettings; 