import React from 'react';

interface QualitySettingsProps {
  quality: string;
  resolution: string;
  bitrate: string;
  framerate: string;
  onQualityChange: (quality: string) => void;
  onResolutionChange: (resolution: string) => void;
  onBitrateChange: (bitrate: string) => void;
  onFramerateChange: (framerate: string) => void;
  disabled: boolean;
}

const QualitySettings: React.FC<QualitySettingsProps> = ({
  quality,
  resolution,
  bitrate,
  framerate,
  onQualityChange,
  onResolutionChange,
  onBitrateChange,
  onFramerateChange,
  disabled,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Quality
        </label>
        <select
          value={quality}
          onChange={(e) => onQualityChange(e.target.value)}
          disabled={disabled}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="low">Low (480p)</option>
          <option value="medium">Medium (720p)</option>
          <option value="high">High (1080p)</option>
          <option value="custom">Custom Settings</option>
        </select>
      </div>

      {quality === 'custom' && (
        <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Resolution
            </label>
            <select
              value={resolution}
              onChange={(e) => onResolutionChange(e.target.value)}
              disabled={disabled}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="640x360">360p (640x360)</option>
              <option value="854x480">480p (854x480)</option>
              <option value="1280x720">720p (1280x720)</option>
              <option value="1920x1080">1080p (1920x1080)</option>
              <option value="2560x1440">1440p (2560x1440)</option>
              <option value="3840x2160">4K (3840x2160)</option>
              <option value="original">Original Resolution</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Bitrate
            </label>
            <select
              value={bitrate}
              onChange={(e) => onBitrateChange(e.target.value)}
              disabled={disabled}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="500k">500 Kbps (Low)</option>
              <option value="1000k">1 Mbps (Medium)</option>
              <option value="2000k">2 Mbps (High)</option>
              <option value="4000k">4 Mbps (Very High)</option>
              <option value="8000k">8 Mbps (Ultra)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Framerate
            </label>
            <select
              value={framerate}
              onChange={(e) => onFramerateChange(e.target.value)}
              disabled={disabled}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="24">24 fps</option>
              <option value="30">30 fps</option>
              <option value="60">60 fps</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualitySettings; 