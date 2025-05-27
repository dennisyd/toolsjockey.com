import { useState, useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import jsonLang from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/github-dark.css';

hljs.registerLanguage('json', jsonLang);

const JSONFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'pretty' | 'minify'>('pretty');
  const [highlighted, setHighlighted] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format or minify JSON
  const handleFormat = () => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      const formatted = mode === 'pretty'
        ? JSON.stringify(parsed, null, 2)
        : JSON.stringify(parsed);
      setOutput(formatted);
      setHighlighted(hljs.highlight(formatted, { language: 'json' }).value);
    } catch (e: any) {
      setError(e.message || 'Invalid JSON');
      setOutput('');
      setHighlighted('');
    }
  };

  // Handle file upload
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setInput(ev.target?.result as string || '');
      setOutput('');
      setError(null);
      setHighlighted('');
    };
    reader.onerror = () => setError('Failed to read file.');
    reader.readAsText(file);
  };

  // Copy output to clipboard
  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
  };

  // Download output as file
  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Input area */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold">Paste or upload JSON:</label>
        <textarea
          className="w-full min-h-[120px] p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-y font-mono"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Paste your JSON here..."
          aria-label="JSON input"
        />
        <div className="flex gap-2 items-center">
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>Upload JSON</button>
          <input
            type="file"
            accept=".json,application/json"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFile}
          />
          <button className={`btn ${mode === 'pretty' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('pretty')}>Format</button>
          <button className={`btn ${mode === 'minify' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setMode('minify')}>Minify</button>
          <button className="btn btn-primary" onClick={handleFormat}>Validate & {mode === 'pretty' ? 'Format' : 'Minify'}</button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>
      {/* Output area */}
      {output && (
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Result:</label>
          <pre className="rounded-lg p-3 bg-slate-900 text-white overflow-x-auto text-sm" style={{ minHeight: 120 }}>
            <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          </pre>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={handleCopy}>Copy</button>
            <button className="btn btn-secondary" onClick={handleDownload}>Download</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JSONFormatter; 