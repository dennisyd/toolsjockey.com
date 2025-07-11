import React, { useState, useEffect } from 'react';
import { Download, Upload, Volume2 } from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

const AudioMergerPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    document.title = 'Audio Merger – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Merge (concatenate) multiple audio files into one.');
  }, []);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/'));
    if (droppedFiles.length === 0) {
      setError('Please upload audio files.');
      return;
    }
    handleFiles(droppedFiles);
  };

  const handleFiles = async (selected: File[]) => {
    if (selected.some(f => f.size > 100 * 1024 * 1024)) {
      setError('One or more files are too large. Max 100MB each.');
      return;
    }
    setFiles(selected);
    setError(null);
    setProgress(0);
    setOutputUrl(null);
    setIsProcessing(false);
    setDuration(0);
  };

  const mergeAudio = async () => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setOutputUrl(null);
    try {
      // Decode all files
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      let totalLength = 0;
      let sampleRate = 44100;
      let numberOfChannels = 2;
      const buffers: AudioBuffer[] = [];
      for (let i = 0; i < files.length; i++) {
        setProgress((i / files.length) * 30);
        const arrayBuffer = await files[i].arrayBuffer();
        const buffer = await context.decodeAudioData(arrayBuffer);
        if (i === 0) {
          sampleRate = buffer.sampleRate;
          numberOfChannels = buffer.numberOfChannels;
        }
        totalLength += buffer.length;
        buffers.push(buffer);
      }
      setProgress(40);
      // Create merged buffer
      const mergedBuffer = context.createBuffer(numberOfChannels, totalLength, sampleRate);
      let offset = 0;
      for (const buffer of buffers) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          mergedBuffer.getChannelData(channel).set(buffer.getChannelData(channel), offset);
        }
        offset += buffer.length;
      }
      setProgress(70);
      setDuration(mergedBuffer.duration);
      // Convert to WAV
      const audioData = await convertToWav(mergedBuffer);
      setProgress(90);
      const blob = new Blob([audioData], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setProgress(100);
      trackButtonClick('audio_merged', 'AudioMerger');
    } catch (e: any) {
      setError('Failed to merge audio: ' + e.message);
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
    if (!outputUrl || files.length === 0) return;
    const link = document.createElement('a');
    link.href = outputUrl;
    link.download = `merged_audio.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    trackButtonClick('audio_downloaded', 'AudioMerger');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container-app mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Audio Merger</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Merge (concatenate) multiple audio files into one
        </p>
      </div>
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Audio Files
        </h2>
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <Volume2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Drag & drop your audio files here, or click to select
          </p>
          <input
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={e => e.target.files && handleFiles(Array.from(e.target.files))}
          />
          <button
            onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
            className="bg-accent hover:bg-accent/80 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Choose Files
          </button>
        </div>
        {files.length > 0 && <div className="text-sm text-gray-500 mt-2">{files.map(f => f.name).join(', ')}</div>}
      </div>
      {files.length > 0 && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <button
            onClick={mergeAudio}
            disabled={isProcessing}
            className="w-full bg-accent hover:bg-accent/80 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Merging...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Merge Audio
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
            Download Merged Audio
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Merge Complete!</p>
              <p className="text-sm text-gray-500">
                Files: {files.length} • Duration: {formatTime(duration)}
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

export default AudioMergerPage; 