import React, { useState } from 'react';

const AudioMetadataEditorPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({ title: '', artist: '', album: '' });

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
    // TODO: Read and edit ID3 tags using jsmediatags or similar
    // Simulate progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetadata({ ...metadata, [e.target.name]: e.target.value });
  };

  return (
    <div className="container-app mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Audio Metadata Editor</h1>
      <div
        className="border-2 border-dashed border-accent rounded-lg p-8 text-center mb-4 cursor-pointer bg-white dark:bg-primary-light"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <p className="mb-2">Drag & drop your audio file here, or <label className="underline cursor-pointer"><input type="file" accept="audio/*" className="hidden" onChange={e => e.target.files && handleFile(e.target.files[0])} />browse</label></p>
        {file && <div className="text-sm text-gray-500">{file.name}</div>}
      </div>
      <div className="mb-4 flex flex-col gap-2">
        <label className="block text-sm font-medium">Title:
          <input type="text" name="title" value={metadata.title} onChange={handleMetadataChange} className="ml-2 p-1 border rounded w-64" />
        </label>
        <label className="block text-sm font-medium">Artist:
          <input type="text" name="artist" value={metadata.artist} onChange={handleMetadataChange} className="ml-2 p-1 border rounded w-64" />
        </label>
        <label className="block text-sm font-medium">Album:
          <input type="text" name="album" value={metadata.album} onChange={handleMetadataChange} className="ml-2 p-1 border rounded w-64" />
        </label>
      </div>
      {/* Waveform placeholder */}
      {file && <div className="h-16 bg-gray-200 rounded mb-4 flex items-center justify-center text-xs text-gray-500">Waveform Preview (coming soon)</div>}
      {/* Audio preview */}
      {file && <audio controls src={URL.createObjectURL(file)} className="w-full mb-4" />}
      {progress > 0 && progress < 100 && (
        <div className="mb-4"><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-accent h-2 rounded-full" style={{ width: `${progress}%` }}></div></div><div className="text-xs mt-1">Editing... {progress}%</div></div>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {outputUrl && <a href={outputUrl} download="edited.mp3" className="btn btn-accent">Download Edited Audio</a>}
    </div>
  );
};

export default AudioMetadataEditorPage; 