import React, { useState } from 'react';

const AudioSpeedChangerPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [speed, setSpeed] = useState<number>(1);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  };

  const handleFile = (f: File) => {
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
    // TODO: Implement speed changing using Web Audio API/Tone.js
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
      <h1 className="text-2xl font-bold mb-4">Audio Speed Changer</h1>
      <div
        className="border-2 border-dashed border-accent rounded-lg p-8 text-center mb-4 cursor-pointer bg-white dark:bg-primary-light"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <p className="mb-2">Drag & drop your audio file here, or <label className="underline cursor-pointer"><input type="file" accept="audio/*" className="hidden" onChange={e => e.target.files && handleFile(e.target.files[0])} />browse</label></p>
        {file && <div className="text-sm text-gray-500">{file.name}</div>}
      </div>
      <div className="mb-4 flex gap-4 items-center">
        <label className="block text-sm font-medium">Speed:
          <select value={speed} onChange={e => setSpeed(Number(e.target.value))} className="ml-2 p-1 border rounded">
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x (Normal)</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </label>
      </div>
      {/* Waveform placeholder */}
      {file && <div className="h-16 bg-gray-200 rounded mb-4 flex items-center justify-center text-xs text-gray-500">Waveform Preview (coming soon)</div>}
      {/* Audio preview */}
      {file && <audio controls src={URL.createObjectURL(file)} className="w-full mb-4" />}
      {progress > 0 && progress < 100 && (
        <div className="mb-4"><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-accent h-2 rounded-full" style={{ width: `${progress}%` }}></div></div><div className="text-xs mt-1">Changing speed... {progress}%</div></div>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {outputUrl && <a href={outputUrl} download="speed-changed.mp3" className="btn btn-accent">Download Changed Audio</a>}
    </div>
  );
};

export default AudioSpeedChangerPage; 