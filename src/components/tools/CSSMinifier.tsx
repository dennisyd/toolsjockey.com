import React, { useState } from 'react';

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

  React.useEffect(() => {
    setOutput(input ? minifyCSS(input) : '');
  }, [input]);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col gap-2">
        <label className="font-medium">Original CSS</label>
        <textarea
          className="p-2 border rounded w-full min-h-[120px]"
          placeholder="Paste your CSS here..."
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
        <button
          className="btn btn-primary w-fit mt-2"
          disabled={!output}
          onClick={() => { navigator.clipboard.writeText(output); }}
        >Copy Minified CSS</button>
      </div>
    </div>
  );
};

export default CSSMinifier; 