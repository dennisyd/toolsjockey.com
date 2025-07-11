import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Download, Upload, Settings, BarChart3 } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

const VolumeNormalizerPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [targetDb, setTargetDb] = useState<number>(-14);
  const [currentDb, setCurrentDb] = useState<number>(0);
  const [peakDb, setPeakDb] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const dbOptions = [
    { value: -20, label: '-20 dB (Very Quiet)' },
    { value: -18, label: '-18 dB (Quiet)' },
    { value: -16, label: '-16 dB (Low)' },
    { value: -14, label: '-14 dB (Standard)' },
    { value: -12, label: '-12 dB (Loud)' },
    { value: -10, label: '-10 dB (Very Loud)' },
    { value: -8, label: '-8 dB (Maximum)' }
  ];

  useEffect(() => {
    document.title = 'Volume Normalizer – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Normalize audio volume levels to achieve consistent loudness across different audio files.');
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  };

  const handleFile = async (f: File) => {
    if (!f.type.startsWith('audio/')) {
      setError('Please upload a supported audio file.');
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setError('File too large. Max 100MB.');
      return;
    }

    setFile(f);
    setError(null);
    setProgress(0);
    setOutputUrl(null);
    setIsProcessing(true);

    try {
      // Create AudioContext
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);

      // Load audio file
      const arrayBuffer = await f.arrayBuffer();
      const buffer = await context.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      setDuration(buffer.duration);

      // Analyze audio levels
      const { currentDb: current, peakDb: peak } = analyzeAudioLevels(buffer);
      setCurrentDb(current);
      setPeakDb(peak);

      setProgress(100);
      trackButtonClick('audio_file_loaded', 'VolumeNormalizer');
    } catch (e: any) {
      setError('Failed to load audio file: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeAudioLevels = (buffer: AudioBuffer): { currentDb: number; peakDb: number } => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    
    let sum = 0;
    let peak = 0;
    let sampleCount = 0;
    
    // Analyze all channels
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const sample = Math.abs(channelData[i]);
        sum += sample * sample; // RMS calculation
        peak = Math.max(peak, sample);
        sampleCount++;
      }
    }
    
    // Calculate RMS and convert to dB
    const rms = Math.sqrt(sum / sampleCount);
    const currentDb = 20 * Math.log10(rms);
    const peakDb = 20 * Math.log10(peak);
    
    return { currentDb, peakDb };
  };

  const normalizeAudio = async () => {
    if (!audioBuffer || !audioContext) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setOutputUrl(null);

    try {
      // Calculate gain needed to reach target dB
      const gainDb = targetDb - currentDb;
      const gainLinear = Math.pow(10, gainDb / 20);
      
      // Limit gain to prevent clipping
      const maxGain = Math.pow(10, (peakDb - targetDb) / 20);
      const finalGain = Math.min(gainLinear, maxGain);

      // Create offline context for processing
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      // Create buffer source
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Create gain node for normalization
      const gainNode = offlineContext.createGain();
      gainNode.gain.value = finalGain;
      
      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(offlineContext.destination);
      source.start();

      setProgress(30);

      // Render audio
      const renderedBuffer = await offlineContext.startRendering();
      setProgress(60);

      // Convert to WAV format
      const audioData = await convertToWav(renderedBuffer);
      setProgress(90);

      // Create blob and download URL
      const blob = new Blob([audioData], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setProgress(100);

      trackButtonClick('audio_normalized', 'VolumeNormalizer');
    } catch (e: any) {
      setError('Failed to normalize audio: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToWav = async (buffer: AudioBuffer): Promise<ArrayBuffer> => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    
    // Convert to 16-bit PCM WAV format
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
    if (!outputUrl || !file) return;
    
    const link = document.createElement('a');
    link.href = outputUrl;
    const baseName = file.name.split('.')[0] || 'normalized';
    link.download = `${baseName}_normalized.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    trackButtonClick('audio_downloaded', 'VolumeNormalizer');
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

  const getVolumeColor = (db: number): string => {
    if (db > -6) return 'text-red-600';
    if (db > -12) return 'text-yellow-600';
    if (db > -18) return 'text-green-600';
    return 'text-blue-600';
  };

  const getVolumeBarWidth = (db: number): number => {
    // Convert dB to percentage (0 to 100)
    // -60 dB = 0%, 0 dB = 100%
    const normalized = Math.max(0, (db + 60) / 60 * 100);
    return Math.min(100, normalized);
  };

  return (
    <div className="container-app mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Volume Normalizer</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Normalize audio volume levels to achieve consistent loudness
        </p>
      </div>

      {/* File Upload */}
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Audio File
        </h2>
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Drag & drop your audio file here, or click to select
          </p>
          <input
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={e => e.target.files && handleFile(e.target.files[0])}
          />
          <button
            onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
            className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Choose File
          </button>
        </div>
        
        {file && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(file.size)} • {formatTime(duration)}
                </p>
              </div>
              <audio
                ref={audioRef}
                controls
                src={URL.createObjectURL(file)}
                className="w-64"
                onPlay={() => {}}
                onPause={() => {}}
              />
            </div>
          </div>
        )}
      </div>

      {/* Audio Analysis */}
      {file && audioBuffer && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Audio Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Current Levels</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>RMS Level:</span>
                    <span className={getVolumeColor(currentDb)}>{currentDb.toFixed(1)} dB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getVolumeColor(currentDb).replace('text-', 'bg-')}`}
                      style={{ width: `${getVolumeBarWidth(currentDb)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Peak Level:</span>
                    <span className={getVolumeColor(peakDb)}>{peakDb.toFixed(1)} dB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getVolumeColor(peakDb).replace('text-', 'bg-')}`}
                      style={{ width: `${getVolumeBarWidth(peakDb)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3">Volume Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${currentDb > -12 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm">
                    {currentDb > -12 ? 'Good volume level' : 'Low volume level'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${peakDb < -1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">
                    {peakDb < -1 ? 'No clipping detected' : 'Clipping detected'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${Math.abs(currentDb - targetDb) < 3 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <span className="text-sm">
                    {Math.abs(currentDb - targetDb) < 3 ? 'Already normalized' : 'Needs normalization'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Normalization Settings */}
      {file && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Normalization Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Target Level</label>
              <select
                value={targetDb}
                onChange={e => setTargetDb(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-accent"
              >
                {dbOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Recommended: -14 dB for most content
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Normalization Preview</label>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm">
                  <strong>Current:</strong> {currentDb.toFixed(1)} dB
                </p>
                <p className="text-sm">
                  <strong>Target:</strong> {targetDb} dB
                </p>
                <p className="text-sm">
                  <strong>Change:</strong> {(targetDb - currentDb).toFixed(1)} dB
                </p>
                <p className="text-sm">
                  <strong>Gain:</strong> {Math.pow(10, (targetDb - currentDb) / 20).toFixed(2)}x
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Normalize Button */}
      {file && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <button
            onClick={normalizeAudio}
            disabled={isProcessing}
            className="w-full bg-accent hover:bg-accent/80 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Normalizing...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                Normalize to {targetDb} dB
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
      )}

      {/* Download Section */}
      {outputUrl && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Normalized Audio
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Normalization Complete!</p>
              <p className="text-sm text-gray-500">
                Target: {targetDb} dB • Duration: {formatTime(duration)}
              </p>
            </div>
            <button
              onClick={downloadAudio}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">Audio Analysis</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Analyze current volume levels and detect clipping
          </p>
        </div>
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Smart Normalization</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Automatically adjust gain while preventing clipping
          </p>
        </div>
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Volume2 className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">Consistent Levels</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Achieve uniform volume across multiple audio files
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolumeNormalizerPage; 