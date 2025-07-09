import React, { useState } from 'react';
// import pptxgenjs or similar when implementing

const PPTXSplitterPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [splitUrls, setSplitUrls] = useState<string[]>([]);
  const [range, setRange] = useState<string>('');

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  };

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.pptx')) {
      setError('Please upload a PPTX file.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File too large. Max 50MB.');
      return;
    }
    setFile(f);
    setError(null);
    setProgress(0);
    // TODO: Implement PPTX splitting using pptxgenjs or similar
    // Simulate progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setSplitUrls(['#']); // Placeholder
      }
    }, 200);
  };

  return (
    <div className="container-app mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">PPTX Splitter</h1>
      <div
        className="border-2 border-dashed border-accent rounded-lg p-8 text-center mb-4 cursor-pointer bg-white dark:bg-primary-light"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <p className="mb-2">Drag & drop your PPTX file here, or <label className="underline cursor-pointer"><input type="file" accept=".pptx" className="hidden" onChange={e => e.target.files && handleFile(e.target.files[0])} />browse</label></p>
        {file && <div className="text-sm text-gray-500">{file.name}</div>}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Slide Range (e.g. 1-3,5)</label>
        <input type="text" value={range} onChange={e => setRange(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g. 1-3,5" />
      </div>
      {progress > 0 && progress < 100 && (
        <div className="mb-4"><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-accent h-2 rounded-full" style={{ width: `${progress}%` }}></div></div><div className="text-xs mt-1">Splitting... {progress}%</div></div>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {splitUrls.length > 0 && (
        <div className="mt-4 space-y-2">
          {splitUrls.map((url, idx) => (
            <a key={idx} href={url} download={`slide-${idx + 1}.pptx`} className="block btn btn-accent mb-2">Download Slide {idx + 1}</a>
          ))}
        </div>
      )}
    </div>
  );
};

export default PPTXSplitterPage; 