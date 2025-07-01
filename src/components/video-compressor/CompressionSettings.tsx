import React from 'react';

type QualityPreset = 'low' | 'medium' | 'high' | 'custom';

interface CustomSettings {
  resolution: string;
  videoBitrate: string;
  audioBitrate: string;
  crf: number;
  preset: string;
}

interface CompressionSettingsProps {
  selectedPreset: QualityPreset;
  customSettings: CustomSettings;
  onPresetChange: (preset: QualityPreset) => void;
  onCustomSettingsChange: (settings: CustomSettings) => void;
  disabled?: boolean;
}

const CompressionSettings: React.FC<CompressionSettingsProps> = ({
  selectedPreset,
  customSettings,
  onPresetChange,
  onCustomSettingsChange,
  disabled = false,
}) => {
  // Resolution options
  const resolutionOptions = [
    { value: '640x360', label: '360p' },
    { value: '854x480', label: '480p' },
    { value: '1280x720', label: '720p (HD)' },
    { value: '1920x1080', label: '1080p (Full HD)' },
    { value: '2560x1440', label: '1440p (2K)' },
    { value: '3840x2160', label: '2160p (4K)' },
  ];
  
  // Preset options
  const presetOptions = [
    { value: 'ultrafast', label: 'Ultrafast (Lowest Quality)' },
    { value: 'superfast', label: 'Superfast' },
    { value: 'veryfast', label: 'Very Fast' },
    { value: 'faster', label: 'Faster' },
    { value: 'fast', label: 'Fast' },
    { value: 'medium', label: 'Medium (Balanced)' },
    { value: 'slow', label: 'Slow' },
    { value: 'slower', label: 'Slower' },
    { value: 'veryslow', label: 'Very Slow (Best Quality)' },
  ];
  
  // Handle custom settings change
  const handleSettingChange = (setting: keyof CustomSettings, value: string | number) => {
    onCustomSettingsChange({
      ...customSettings,
      [setting]: value,
    });
  };
  
  return (
    <div>
      {/* Quality presets */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Compression Preset
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onPresetChange('low')}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg border text-center transition-colors
              ${selectedPreset === 'low'
                ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            Low Quality<br />
            <span className="text-xs text-gray-500 dark:text-gray-400">Smallest Size</span>
          </button>
          
          <button
            onClick={() => onPresetChange('medium')}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg border text-center transition-colors
              ${selectedPreset === 'medium'
                ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            Medium Quality<br />
            <span className="text-xs text-gray-500 dark:text-gray-400">Balanced</span>
          </button>
          
          <button
            onClick={() => onPresetChange('high')}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg border text-center transition-colors
              ${selectedPreset === 'high'
                ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            High Quality<br />
            <span className="text-xs text-gray-500 dark:text-gray-400">Larger Size</span>
          </button>
          
          <button
            onClick={() => onPresetChange('custom')}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg border text-center transition-colors
              ${selectedPreset === 'custom'
                ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:border-blue-600 dark:text-blue-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            Custom<br />
            <span className="text-xs text-gray-500 dark:text-gray-400">Advanced</span>
          </button>
        </div>
      </div>
      
      {/* Preset descriptions */}
      <div className="mb-6">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {selectedPreset === 'low' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Low Quality Preset</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Maximum compression with 480p resolution and higher compression. 
                Best for sharing on social media or when file size is critical.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Resolution:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">480p</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">CRF:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">28</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Preset:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Fast</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Audio:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">96kbps</span>
                </div>
              </div>
            </div>
          )}
          
          {selectedPreset === 'medium' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medium Quality Preset</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Balanced compression with 720p resolution. Good for most videos where you want 
                a balance between quality and file size.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Resolution:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">720p</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">CRF:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Preset:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Medium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Audio:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">128kbps</span>
                </div>
              </div>
            </div>
          )}
          
          {selectedPreset === 'high' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">High Quality Preset</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Minimal compression with up to 1080p resolution. Best when quality is more 
                important than file size.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Resolution:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">1080p</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">CRF:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">18</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Preset:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Slow</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Audio:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">192kbps</span>
                </div>
              </div>
            </div>
          )}
          
          {selectedPreset === 'custom' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Settings</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Customize all compression parameters for complete control over the output.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom settings */}
      {selectedPreset === 'custom' && (
        <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          {/* Resolution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resolution
            </label>
            <select
              value={customSettings.resolution}
              onChange={(e) => handleSettingChange('resolution', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {resolutionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.value})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Lower resolution = smaller file size
            </p>
          </div>
          
          {/* CRF (Constant Rate Factor) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quality (CRF): {customSettings.crf}
            </label>
            <input
              type="range"
              min="0"
              max="51"
              step="1"
              value={customSettings.crf}
              onChange={(e) => handleSettingChange('crf', parseInt(e.target.value))}
              disabled={disabled}
              className={`w-full ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Higher Quality (0)</span>
              <span>Lower Quality (51)</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Recommended: 18-28. Lower values = better quality but larger files.
            </p>
          </div>
          
          {/* Encoder Preset */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Encoder Preset
            </label>
            <select
              value={customSettings.preset}
              onChange={(e) => handleSettingChange('preset', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {presetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Slower presets = better compression but longer processing time
            </p>
          </div>
          
          {/* Audio Bitrate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Audio Bitrate
            </label>
            <select
              value={customSettings.audioBitrate}
              onChange={(e) => handleSettingChange('audioBitrate', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <option value="64k">64 kbps (Low)</option>
              <option value="96k">96 kbps (Medium-Low)</option>
              <option value="128k">128 kbps (Medium)</option>
              <option value="192k">192 kbps (Medium-High)</option>
              <option value="256k">256 kbps (High)</option>
              <option value="320k">320 kbps (Very High)</option>
            </select>
          </div>
          
          <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
            <strong>Tip:</strong> If your compressed file ends up larger than the original, try:
            <ul className="list-disc list-inside mt-1 ml-2">
              <li>Increasing the CRF value (lower quality)</li>
              <li>Selecting a lower resolution</li>
              <li>Using a faster preset</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompressionSettings; 