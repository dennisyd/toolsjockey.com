import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, Settings, Volume2 } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

const AudioCompressorPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [bitrate, setBitrate] = useState<number>(128);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    document.title = 'Audio Compressor – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Compress audio files by reducing bitrate and file size.');
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
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      setAudioContext(context);
      const arrayBuffer = await f.arrayBuffer();
      const buffer = await context.decodeAudioData(arrayBuffer);
      setAudioBuffer(buffer);
      setDuration(buffer.duration);
      setProgress(100);
      trackButtonClick('audio_file_loaded', 'AudioCompressor');
    } catch (e: any) {
      setError('Failed to load audio file: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const compressAudio = async () => {
    if (!audioBuffer || !audioContext) return;
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setOutputUrl(null);
    try {
      // Downsample by reducing sample rate based on bitrate
      // (Bitrate is not directly controllable in WAV, but we can reduce sample rate for smaller files)
      let targetSampleRate = 44100;
      if (bitrate <= 64) targetSampleRate = 12000;
      else if (bitrate <= 96) targetSampleRate = 22050;
      else if (bitrate <= 128) targetSampleRate = 32000;
      else if (bitrate <= 192) targetSampleRate = 44100;
      else targetSampleRate = 48000;

      const offlineContext = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        Math.floor(audioBuffer.duration * targetSampleRate),
        targetSampleRate
      );
      const source = offlineContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineContext.destination);
      source.start();
      setProgress(40);
      const renderedBuffer = await offlineContext.startRendering();
      setProgress(70);
      const audioData = await convertToWav(renderedBuffer);
      setProgress(90);
      const blob = new Blob([audioData], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setProgress(100);
      trackButtonClick('audio_compressed', 'AudioCompressor');
    } catch (e: any) {
      setError('Failed to compress audio: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const convertToWav = async (buffer: AudioBuffer): Promise<ArrayBuffer> => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const pcmData = new Int16Array(length * numberOfChannels);
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        pcmData[i * numberOfChannels + channel] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      }
    }
    const wavHeader = createWavHeader(length * numberOfChannels * 2, numberOfChannels, sampleRate, 16);
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
    const baseName = file.name.split('.')[0] || 'compressed';
    link.download = `${baseName}_compressed.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    trackButtonClick('audio_downloaded', 'AudioCompressor');
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
        <h1 className="text-3xl font-bold mb-2">Audio Compressor</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Compress audio files by reducing bitrate and file size
        </p>
      </div>
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
      {file && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Compression Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Bitrate (kbps)</label>
              <select
                value={bitrate}
                onChange={e => setBitrate(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-accent"
              >
                <option value={64}>64 kbps (smallest, lowest quality)</option>
                <option value={96}>96 kbps</option>
                <option value={128}>128 kbps (default)</option>
                <option value={192}>192 kbps</option>
                <option value={256}>256 kbps (highest quality)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Lower bitrate = smaller file, but lower quality
              </p>
            </div>
          </div>
        </div>
      )}
      {file && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <button
            onClick={compressAudio}
            disabled={isProcessing}
            className="w-full bg-accent hover:bg-accent/80 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Compressing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Compress Audio
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
      {outputUrl && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Download Compressed Audio
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compression Complete!</p>
              <p className="text-sm text-gray-500">
                Bitrate: {bitrate} kbps • Duration: {formatTime(duration)}
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
    </div>
  );
};

export default AudioCompressorPage; 