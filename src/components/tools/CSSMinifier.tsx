import React, { useState, useRef } from 'react';

function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, '') // Remove comments
    .replace(/\s{2,}/g, ' ') // Collapse whitespace
    .replace(/\s*([:;{},>])\s*/g, '$1') // Remove space around symbols
    .replace(/;}/g, '}') // Remove unnecessary semicolons
    .replace(/\n|\r/g, '') // Remove newlines
    .trim();
}

const CSSMinifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setOutput(input ? minifyCSS(input) : '');
  }, [input]);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Save the filename for later use in export
    setFileName(file.name.replace(/\.css$/, ''));
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content || '');
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    if (!output) return;
    
    // Create a blob from the minified CSS
    const blob = new Blob([output], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    
    // Create a download link and trigger it
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName || 'minified'}.min.css`;
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* File Import Option */}
      <div className="flex flex-wrap items-center gap-2">
        <button 
          className="btn btn-secondary" 
          onClick={triggerFileInput}
        >
          Import CSS File
        </button>
        <input 
          type="file" 
          accept=".css" 
          ref={fileInputRef}
          onChange={handleFileImport} 
          className="hidden" 
        />
        {fileName && <span className="text-sm text-gray-600">File: {fileName}.css</span>}
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-medium">Original CSS</label>
          <textarea
            className="p-2 border rounded w-full min-h-[120px]"
            placeholder="Paste your CSS here or import a file..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label className="font-medium">Minified CSS</label>
          <textarea
            className="p-2 border rounded w-full min-h-[120px] bg-slate-50 dark:bg-slate-800"
            value={output}
            readOnly
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              className="btn btn-primary"
              disabled={!output}
              onClick={() => { navigator.clipboard.writeText(output); }}
            >
              Copy Minified CSS
            </button>
            <button
              className="btn btn-secondary"
              disabled={!output}
              onClick={handleExport}
            >
              Export as .min.css File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSSMinifier; 