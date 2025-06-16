import React from 'react';
import type { OutputFormat } from '../../../types/video';
import { VIDEO_FORMATS } from '../../../types/video';

interface AdvancedOptionsProps {
  options: {
    videoCodec: string;
    audioCodec: string;
    audioChannels: string;
    audioSampleRate: string;
    compressionLevel: string;
  };
  onChange: (options: {
    videoCodec: string;
    audioCodec: string;
    audioChannels: string;
    audioSampleRate: string;
    compressionLevel: string;
  }) => void;
  outputFormat: OutputFormat;
  disabled: boolean;
}

const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  options,
  onChange,
  outputFormat,
  disabled,
}) => {
  // Update an option
  const handleOptionChange = (
    key: keyof typeof options,
    value: string
  ) => {
    onChange({
      ...options,
      [key]: value,
    });
  };

  // Get available codecs based on selected format
  const availableVideoCodecs = VIDEO_FORMATS[outputFormat].videoCodecs;
  const availableAudioCodecs = VIDEO_FORMATS[outputFormat].audioCodecs;

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
        Advanced Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Video Codec */}
        <div>
          <label htmlFor="video-codec" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Video Codec
          </label>
          <select
            id="video-codec"
            value={options.videoCodec}
            onChange={(e) => handleOptionChange('videoCodec', e.target.value)}
            className="w-full p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            disabled={disabled}
          >
            {availableVideoCodecs.map((codec) => (
              <option key={codec} value={codec}>
                {codec === 'libx264'
                  ? 'H.264 (libx264)'
                  : codec === 'libx265'
                  ? 'H.265/HEVC (libx265)'
                  : codec === 'libvpx-vp9'
                  ? 'VP9 (libvpx-vp9)'
                  : codec === 'libaom-av1'
                  ? 'AV1 (libaom-av1)'
                  : codec}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-400">
            {options.videoCodec === 'libx264'
              ? 'Good balance of quality and compatibility'
              : options.videoCodec === 'libx265'
              ? 'Better compression but less compatible'
              : options.videoCodec === 'libvpx-vp9'
              ? 'Royalty-free, good for web'
              : options.videoCodec === 'libaom-av1'
              ? 'Next-gen codec, best compression'
              : ''}
          </p>
        </div>

        {/* Audio Codec */}
        <div>
          <label htmlFor="audio-codec" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Audio Codec
          </label>
          <select
            id="audio-codec"
            value={options.audioCodec}
            onChange={(e) => handleOptionChange('audioCodec', e.target.value)}
            className="w-full p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            disabled={disabled}
          >
            {availableAudioCodecs.map((codec) => (
              <option key={codec} value={codec}>
                {codec === 'aac'
                  ? 'AAC (Advanced Audio Coding)'
                  : codec === 'mp3'
                  ? 'MP3'
                  : codec === 'opus'
                  ? 'Opus (High Quality)'
                  : codec === 'vorbis'
                  ? 'Vorbis'
                  : codec}
              </option>
            ))}
          </select>
        </div>

        {/* Audio Channels */}
        <div>
          <label htmlFor="audio-channels" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Audio Channels
          </label>
          <select
            id="audio-channels"
            value={options.audioChannels}
            onChange={(e) => handleOptionChange('audioChannels', e.target.value)}
            className="w-full p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            disabled={disabled}
          >
            <option value="1">Mono (1)</option>
            <option value="2">Stereo (2)</option>
            <option value="6">Surround (5.1)</option>
          </select>
        </div>

        {/* Audio Sample Rate */}
        <div>
          <label htmlFor="audio-sample-rate" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Audio Sample Rate
          </label>
          <select
            id="audio-sample-rate"
            value={options.audioSampleRate}
            onChange={(e) =>
              handleOptionChange('audioSampleRate', e.target.value)
            }
            className="w-full p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            disabled={disabled}
          >
            <option value="22050">22.05 kHz (Low)</option>
            <option value="44100">44.1 kHz (Standard)</option>
            <option value="48000">48 kHz (Professional)</option>
          </select>
        </div>

        {/* Compression Level */}
        <div>
          <label htmlFor="compression-level" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Compression Level
          </label>
          <select
            id="compression-level"
            value={options.compressionLevel}
            onChange={(e) =>
              handleOptionChange('compressionLevel', e.target.value)
            }
            className="w-full p-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            disabled={disabled}
          >
            <option value="low">Low (Fast, Larger Files)</option>
            <option value="medium">Medium (Balanced)</option>
            <option value="high">High (Slow, Smaller Files)</option>
          </select>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>
          These settings let you fine-tune the conversion process. If you're not sure what to choose, leave the default values for the best balance of quality and file size.
        </p>
      </div>
    </div>
  );
};

export default AdvancedOptions; 