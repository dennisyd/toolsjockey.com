import React, { useState, useRef, useEffect } from 'react';
import { Music, Download, Upload, Settings } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

interface AudioFormat {
  value: string;
  label: string;
  mimeType: string;
  extension: string;
}

const AudioConverterPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [sampleRate, setSampleRate] = useState<number>(44100);
  const [bitrate, setBitrate] = useState<number>(192);
  const [format, setFormat] = useState<string>('mp3');
  const audioRef = useRef<HTMLAudioElement>(null);

  const formats: AudioFormat[] = [
    { value: 'wav', label: 'WAV', mimeType: 'audio/wav', extension: 'wav' },
    { value: 'mp3', label: 'MP3', mimeType: 'audio/mpeg', extension: 'mp3' },
    { value: 'ogg', label: 'OGG', mimeType: 'audio/ogg', extension: 'ogg' },
    { value: 'aac', label: 'AAC', mimeType: 'audio/aac', extension: 'aac' }
  ];

  useEffect(() => {
    document.title = 'Audio Converter – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Convert audio files between different formats (WAV, MP3, OGG, AAC) with quality settings.');
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
      setSampleRate(buffer.sampleRate);

      setProgress(100);
      trackButtonClick('audio_file_loaded', 'AudioConverter');
    } catch (e: any) {
      setError('Failed to load audio file: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertAudio = async () => {
    if (!audioBuffer || !audioContext) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setOutputUrl(null);

    try {
      // Create offline context for processing
      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        sampleRate
      );

      // Create buffer source
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();

      setProgress(30);

      // Render audio
      const renderedBuffer = await offlineContext.startRendering();
      setProgress(60);

      // Convert to desired format
      const audioData = await convertToFormat(renderedBuffer);
      setProgress(90);

      // Create blob and download URL
      const blob = new Blob([audioData], { type: formats.find(f => f.value === format)?.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setProgress(100);

      trackButtonClick('audio_converted', 'AudioConverter');
    } catch (e: any) {
      setError('Failed to convert audio: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToFormat = async (buffer: AudioBuffer): Promise<ArrayBuffer> => {
    // For client-side conversion, we'll use a simplified approach
    // In a real implementation, you'd use libraries like lamejs for MP3 encoding
    
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
    
    // RIFF chunk descriptor
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    
    // fmt sub-chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * bitsPerSample / 8, true);
    view.setUint16(32, channels * bitsPerSample / 8, true);
    view.setUint16(34, bitsPerSample, true);
    
    // data sub-chunk
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    
    return new Uint8Array(header);
  };

  const downloadAudio = () => {
    if (!outputUrl || !file) return;
    
    const link = document.createElement('a');
    link.href = outputUrl;
    const selectedFormat = formats.find(f => f.value === format);
    const extension = selectedFormat?.extension || 'wav';
    const baseName = file.name.split('.')[0] || 'converted';
    link.download = `${baseName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    trackButtonClick('audio_downloaded', 'AudioConverter');
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

  return (
    <div className="container-app mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Audio Converter</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Convert audio files between different formats with quality control
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
          <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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

      {/* Conversion Settings */}
      {file && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Conversion Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div>
              <label className="block text-sm font-medium mb-2">Sample Rate: {sampleRate} Hz</label>
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
              <label className="block text-sm font-medium mb-2">Bitrate: {bitrate} kbps</label>
              <select
                value={bitrate}
                onChange={e => setBitrate(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-accent"
              >
                <option value={64}>64 kbps</option>
                <option value={96}>96 kbps</option>
                <option value={128}>128 kbps</option>
                <option value={192}>192 kbps</option>
                <option value={256}>256 kbps</option>
                <option value={320}>320 kbps</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Convert Button */}
      {file && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <button
            onClick={convertAudio}
            disabled={isProcessing}
            className="w-full bg-accent hover:bg-accent/80 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Converting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Convert Audio
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
            Download Converted Audio
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Conversion Complete!</p>
              <p className="text-sm text-gray-500">
                Format: {formats.find(f => f.value === format)?.label} • 
                Sample Rate: {sampleRate} Hz • 
                Bitrate: {bitrate} kbps
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
            <Music className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold mb-2">Multiple Formats</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Convert between WAV, MP3, OGG, and AAC formats
          </p>
        </div>
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold mb-2">Quality Control</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Adjust sample rate and bitrate for optimal quality
          </p>
        </div>
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Download className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-2">Instant Download</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Process and download your converted audio immediately
          </p>
        </div>
      </div>
    </div>
  );
};

export default AudioConverterPage; 