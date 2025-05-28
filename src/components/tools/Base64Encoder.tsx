import React, { useState } from 'react';

function encodeBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return '';
  }
}
function decodeBase64(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return '';
  }
}

const Base64Encoder: React.FC = () => {
  const [tab, setTab] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!input) {
      setOutput('');
      setError('');
      return;
    }
    if (tab === 'encode') {
      setOutput(encodeBase64(input));
      setError('');
    } else {
      const decoded = decodeBase64(input);
      if (decoded === '' && input) {
        setError('Invalid Base64 input.');
        setOutput('');
      } else {
        setOutput(decoded);
        setError('');
      }
    }
  }, [input, tab]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 mb-2">
        <button
          className={`btn ${tab === 'encode' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('encode')}
        >Encode</button>
        <button
          className={`btn ${tab === 'decode' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('decode')}
        >Decode</button>
      </div>
      <textarea
        className="p-2 border rounded w-full min-h-[80px]"
        placeholder={tab === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <div className="flex flex-col gap-2">
        <label className="font-medium">{tab === 'encode' ? 'Base64 Output' : 'Decoded Output'}</label>
        <textarea
          className="p-2 border rounded w-full min-h-[80px] bg-slate-50 dark:bg-slate-800"
          value={output}
          readOnly
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          className="btn btn-primary w-fit"
          disabled={!output}
          onClick={() => { navigator.clipboard.writeText(output); }}
        >Copy Output</button>
      </div>
    </div>
  );
};

export default Base64Encoder; 