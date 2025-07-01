import React, { useState, useRef } from 'react';
import DiffMatchPatch from 'diff-match-patch';

const dmp = new DiffMatchPatch();

function diffHtml(a: string, b: string) {
  const diff = dmp.diff_main(a, b);
  dmp.diff_cleanupSemantic(diff);
  return diff.map(([op, data]: [number, string], i: number) => {
    if (op === 0) return <span key={i}>{data}</span>;
    if (op === -1) return <span key={i} className="bg-red-200 text-red-800">{data}</span>;
    if (op === 1) return <span key={i} className="bg-green-200 text-green-800">{data}</span>;
    return null;
  });
}

const TextDiffViewer: React.FC = () => {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [fileNameA, setFileNameA] = useState('');
  const [fileNameB, setFileNameB] = useState('');
  
  const fileInputARef = useRef<HTMLInputElement>(null);
  const fileInputBRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (side: 'A' | 'B') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (side === 'A') {
        setA(content || '');
        setFileNameA(file.name);
      } else {
        setB(content || '');
        setFileNameB(file.name);
      }
    };
    reader.readAsText(file);
    
    // Reset the file input so the same file can be selected again
    e.target.value = '';
  };

  const triggerFileInput = (side: 'A' | 'B') => {
    if (side === 'A') {
      fileInputARef.current?.click();
    } else {
      fileInputBRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="font-medium">Text A</label>
          <div>
            <button 
              className="text-sm px-2 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded"
              onClick={() => triggerFileInput('A')}
            >
              Import File
            </button>
            <input 
              type="file" 
              ref={fileInputARef}
              onChange={handleFileImport('A')} 
              className="hidden" 
            />
          </div>
        </div>
        {fileNameA && (
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            File: {fileNameA}
            <button 
              className="ml-2 text-red-600 hover:text-red-800" 
              onClick={() => setFileNameA('')}
              aria-label="Clear file"
            >
              ✕
            </button>
          </div>
        )}
        <textarea 
          className="p-2 border rounded w-full min-h-[120px]" 
          value={a} 
          onChange={e => setA(e.target.value)}
          placeholder="Enter text or import a file..."
        />
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="font-medium">Text B</label>
          <div>
            <button 
              className="text-sm px-2 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded"
              onClick={() => triggerFileInput('B')}
            >
              Import File
            </button>
            <input 
              type="file" 
              ref={fileInputBRef}
              onChange={handleFileImport('B')} 
              className="hidden" 
            />
          </div>
        </div>
        {fileNameB && (
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            File: {fileNameB}
            <button 
              className="ml-2 text-red-600 hover:text-red-800" 
              onClick={() => setFileNameB('')}
              aria-label="Clear file"
            >
              ✕
            </button>
          </div>
        )}
        <textarea 
          className="p-2 border rounded w-full min-h-[120px]" 
          value={b} 
          onChange={e => setB(e.target.value)}
          placeholder="Enter text or import a file..."
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col gap-2">
        <label className="font-medium">Diff Output</label>
        <div className="p-2 border rounded bg-slate-50 dark:bg-slate-800 min-h-[120px] whitespace-pre-wrap font-mono text-sm overflow-auto">
          {diffHtml(a, b)}
        </div>
      </div>
    </div>
  );
};

export default TextDiffViewer; 