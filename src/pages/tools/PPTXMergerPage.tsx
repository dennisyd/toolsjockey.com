import React, { useState } from 'react';
// import pptxgenjs or similar when implementing

const PPTXMergerPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.pptx'));
    if (droppedFiles.length === 0) {
      setError('Please upload PPTX files.');
      return;
    }
    handleFiles(droppedFiles);
  };

  const handleFiles = (selected: File[]) => {
    if (selected.some(f => f.size > 50 * 1024 * 1024)) {
      setError('One or more files are too large. Max 50MB each.');
      return;
    }
    setFiles(selected);
    setError(null);
    setProgress(0);
    // TODO: Implement PPTX merging using pptxgenjs or similar
    // Simulate progress
    let prog = 0;
    const interval = setInterval(() => {
      prog += 10;
      setProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setMergedUrl('#'); // Placeholder
      }
    }, 200);
  };

  return (
    <div className="container-app mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">PPTX Merger</h1>
      <div
        className="border-2 border-dashed border-accent rounded-lg p-8 text-center mb-4 cursor-pointer bg-white dark:bg-primary-light"
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        <p className="mb-2">Drag & drop your PPTX files here, or <label className="underline cursor-pointer"><input type="file" accept=".pptx" multiple className="hidden" onChange={e => e.target.files && handleFiles(Array.from(e.target.files))} />browse</label></p>
        {files.length > 0 && <div className="text-sm text-gray-500">{files.map(f => f.name).join(', ')}</div>}
      </div>
      {progress > 0 && progress < 100 && (
        <div className="mb-4"><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-accent h-2 rounded-full" style={{ width: `${progress}%` }}></div></div><div className="text-xs mt-1">Merging... {progress}%</div></div>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {mergedUrl && <a href={mergedUrl} download className="btn btn-accent">Download Merged PPTX</a>}
    </div>
  );
};

export default PPTXMergerPage; 