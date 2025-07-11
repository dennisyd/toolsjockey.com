import React, { useState, useEffect } from 'react';
import { Volume2, Download, Settings, Play } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

interface AudioFormat {
  value: string;
  label: string;
  mimeType: string;
  extension: string;
}

const SilentAudioGeneratorPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [duration, setDuration] = useState<number>(5);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sampleRate, setSampleRate] = useState<number>(44100);
  const [channels, setChannels] = useState<number>(2);
  const [format, setFormat] = useState<string>('wav');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const formats: AudioFormat[] = [
    { value: 'wav', label: 'WAV', mimeType: 'audio/wav', extension: 'wav' },
    { value: 'mp3', label: 'MP3', mimeType: 'audio/mpeg', extension: 'mp3' },
    { value: 'ogg', label: 'OGG', mimeType: 'audio/ogg', extension: 'ogg' }
  ];

  useEffect(() => {
    document.title = 'Silent Audio Generator – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Generate silent audio files of specified duration for testing, calibration, or placeholder purposes.');
  }, []);

  const generateSilentAudio = async () => {
    if (duration <= 0 || duration > 600) {
      setError('Duration must be between 1 and 600 seconds.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setOutputUrl(null);
    setPreviewUrl(null);

    try {
      // Create offline audio context
      const offlineContext = new OfflineAudioContext(
        channels,
        duration * sampleRate,
        sampleRate
      );

      setProgress(30);

      // Create silent buffer (all samples are 0)
      const buffer = offlineContext.createBuffer(channels, duration * sampleRate, sampleRate);
      
      // Fill with silence (already 0 by default, but let's be explicit)
      for (let channel = 0; channel < channels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          channelData[i] = 0;
        }
      }

      setProgress(60);

      // Create buffer source and connect
      const source = offlineContext.createBufferSource();
      source.buffer = buffer;
      source.connect(offlineContext.destination);
      source.start();

      // Render audio
      const renderedBuffer = await offlineContext.startRendering();
      setProgress(80);

      // Convert to desired format
      const audioData = await convertToFormat(renderedBuffer);
      setProgress(90);

      // Create blob and download URL
      const selectedFormat = formats.find(f => f.value === format);
      const blob = new Blob([audioData], { type: selectedFormat?.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setPreviewUrl(url);
      setProgress(100);

      trackButtonClick('silent_audio_generated', 'SilentAudioGenerator');
    } catch (e: any) {
      setError('Failed to generate silent audio: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToFormat = async (buffer: AudioBuffer): Promise<ArrayBuffer> => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    
    // Convert to 16-bit PCM WAV format (most compatible)
    const pcmData = new Int16Array(length * numberOfChannels);
    
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        pcmData[i * numberOfChannels + channel] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }
    }

    // Create WAV header
    const wavHeader = createWavHeader(length * numberOfChannels * 2, numberOfChannels, sampleRate, 16);
    
    // Combine header and data
    const wavData = new Uint8Array(wavHeader.length + pcmData.byteLength);
    wavData.set(wavHeader, 0);
    wavData.set(new Uint8Array(pcmData.buffer), wavHeader.length);
    
    return wavData.buffer;
  };

  const createWavHeader = (dataLength: number, channels: number, sampleRate: number, bitsPerSample: number): Uint8Array => {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true);
    view.setUint16(32, channels * bitsPerSample / 8, true);
    view.setUint16(34, bitsPerSample, true);
    
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    
    return new Uint8Array(header);
  };

  const downloadAudio = () => {
    if (!outputUrl) return;
    
    const link = document.createElement('a');
    link.href = outputUrl;
    const selectedFormat = formats.find(f => f.value === format);
    const extension = selectedFormat?.extension || 'wav';
    link.download = `silent_${duration}s.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    trackButtonClick('silent_audio_downloaded', 'SilentAudioGenerator');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateFileSize = (): number => {
    // Rough calculation: sampleRate * channels * bitsPerSample / 8 * duration
    const bitsPerSample = 16;
    return Math.ceil((sampleRate * channels * bitsPerSample / 8) * duration);
  };

  return (
    <div className="container-app mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Silent Audio Generator</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Generate silent audio files for testing, calibration, or placeholder purposes
        </p>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Audio Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
            <input
              type="number"
              value={duration}
              min={1}
              max={600}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-accent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Duration: {formatTime(duration)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sample Rate</label>
            <select
              value={sampleRate}
              onChange={e => setSampleRate(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-accent"
            >
              <option value={8000}>8,000 Hz</option>
              <option value={16000}>16,000 Hz</option>
              <option value={22050}>22,050 Hz</option>
              <option value={44100}>44,100 Hz</option>
              <option value={48000}>48,000 Hz</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Channels</label>
            <select
              value={channels}
              onChange={e => setChannels(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-accent"
            >
              <option value={1}>Mono (1 channel)</option>
              <option value={2}>Stereo (2 channels)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Output Format</label>
            <select
              value={format}
              onChange={e => setFormat(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-accent"
            >
              {formats.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Estimated file size:</strong> {formatFileSize(calculateFileSize())}
          </p>
        </div>
      </div>

      {/* Generate Button */}
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
        <button
          onClick={generateSilentAudio}
          disabled={isProcessing}
          className="w-full bg-accent hover:bg-accent/80 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Generating...
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              Generate Silent Audio
            </>
          )}
        </button>
        
        {isProcessing && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">{progress.toFixed(0)}% Complete</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Preview and Download */}
      {outputUrl && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5" />
            Preview & Download
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Audio Preview</h3>
              <audio
                controls
                src={previewUrl || ''}
                className="w-full"
                onPlay={() => {}}
                onPause={() => {}}
              />
              <p className="text-sm text-gray-500 mt-2">
                Duration: {formatTime(duration)} • 
                Sample Rate: {sampleRate} Hz • 
                Channels: {channels}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Download</h3>
              <button
                onClick={downloadAudio}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Silent Audio
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Format: {formats.find(f => f.value === format)?.label} • 
                Size: {formatFileSize(calculateFileSize())}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Volume2 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">Silent Audio</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Generate completely silent audio files for testing
          </p>
        </div>
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Customizable</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Set duration, sample rate, channels, and format
          </p>
        </div>
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Download className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">Multiple Formats</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Export as WAV, MP3, or OGG formats
          </p>
        </div>
      </div>

      {/* Use Cases */}
      <div className="mt-8 bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Common Use Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Audio Testing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Test audio equipment, software, or systems with known silent input
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Calibration</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Calibrate audio levels and equipment with silent reference
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Placeholder Audio</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Create placeholder audio files for video editing or presentations
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">Audio Processing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Test audio processing algorithms with silent input
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SilentAudioGeneratorPage; 