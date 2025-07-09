import React, { useState } from 'react';

const AudioMergerPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<'mp3' | 'wav' | 'ogg'>('mp3');

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/'));
    if (droppedFiles.length === 0) {
      setError('Please upload audio files.');
      return;
    }
    handleFiles(droppedFiles);
  };

  const handleFiles = (selected: File[]) => {
    if (selected.some(f => f.size > 100 * 1024 * 1024)) {
      setError('One or more files are too large. Max 100MB each.');
      return;
    }
    setFiles(selected);
    setError(null);
    setProgress(0);
    setOutputUrl(null);
    // TODO: Implement audio merging using Web Audio API/Tone.js
    // Simulate progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setOutputUrl('#'); // Placeholder
      }
    }, 200);
  };

  return (
    <div className="container-app mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Audio Merger</h1>
      <div
        className="border-2 border-dashed border-accent rounded-lg p-8 text-center mb-4 cursor-pointer bg-white dark:bg-primary-light"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <p className="mb-2">Drag & drop your audio files here, or <label className="underline cursor-pointer"><input type="file" accept="audio/*" multiple className="hidden" onChange={e => e.target.files && handleFiles(Array.from(e.target.files))} />browse</label></p>
        {files.length > 0 && <div className="text-sm text-gray-500">{files.map(f => f.name).join(', ')}</div>}
      </div>
      <div className="mb-4 flex gap-4 items-center">
        <label className="block text-sm font-medium">Format:
          <select value={format} onChange={e => setFormat(e.target.value as any)} className="ml-2 p-1 border rounded">
            <option value="mp3">MP3</option>
            <option value="wav">WAV</option>
            <option value="ogg">OGG</option>
          </select>
        </label>
      </div>
      {/* Waveform placeholder */}
      {files.length > 0 && <div className="h-16 bg-gray-200 rounded mb-4 flex items-center justify-center text-xs text-gray-500">Waveform Preview (coming soon)</div>}
      {/* Audio preview */}
      {outputUrl && <audio controls src={outputUrl} className="w-full mb-4" />}
      {progress > 0 && progress < 100 && (
        <div className="mb-4"><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-accent h-2 rounded-full" style={{ width: `${progress}%` }}></div></div><div className="text-xs mt-1">Merging... {progress}%</div></div>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {outputUrl && <a href={outputUrl} download={`merged.${format}`} className="btn btn-accent">Download Merged Audio</a>}
    </div>
  );
};

export default AudioMergerPage; 