import React, { useState } from 'react';

const CASES = [
  { label: 'UPPERCASE', value: 'upper' },
  { label: 'lowercase', value: 'lower' },
  { label: 'Title Case', value: 'title' },
  { label: 'Sentence case', value: 'sentence' },
  { label: 'Capitalize Each Word', value: 'capitalize' },
  { label: 'iNVERT cASE', value: 'invert' },
];

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
}
function toSentenceCase(str: string) {
  return str.replace(/(^|[.!?]\s+)([a-z])/g, (_: string, p1: string, p2: string) => p1 + p2.toUpperCase()).replace(/\b([A-Z]+)\b/g, w => w.charAt(0) + w.slice(1).toLowerCase());
}
function toCapitalize(str: string) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}
function toInvertCase(str: string) {
  return str.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
}

function convert(str: string, mode: string) {
  switch (mode) {
    case 'upper': return str.toUpperCase();
    case 'lower': return str.toLowerCase();
    case 'title': return toTitleCase(str);
    case 'sentence': return toSentenceCase(str);
    case 'capitalize': return toCapitalize(str);
    case 'invert': return toInvertCase(str);
    default: return str;
  }
}

const TextCaseConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('upper');
  const output = convert(input, mode);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col gap-2">
        <label className="font-medium">Input Text</label>
        <textarea
          className="p-2 border rounded w-full min-h-[120px]"
          placeholder="Paste or type your text here..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <label className="font-medium">Output</label>
        <textarea
          className="p-2 border rounded w-full min-h-[120px] bg-slate-50 dark:bg-slate-800"
          value={output}
          readOnly
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {CASES.map(c => (
            <button
              key={c.value}
              className={`btn ${mode === c.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMode(c.value)}
              type="button"
            >{c.label}</button>
          ))}
        </div>
        <button
          className="btn btn-primary w-fit mt-2"
          disabled={!output}
          onClick={() => { navigator.clipboard.writeText(output); }}
        >Copy Output</button>
      </div>
    </div>
  );
};

export default TextCaseConverter; 