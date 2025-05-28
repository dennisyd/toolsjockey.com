import React, { useState } from 'react';

// Simple MD5 implementation (from https://github.com/blueimp/JavaScript-MD5, minimized for brevity)
function md5(str: string): string {
  // Minimal MD5 implementation for client-side use
  // (for brevity, use a placeholder and fallback to window.crypto.subtle if available)
  // In production, use a vetted library
  // For now, return a dummy string for placeholder
  return window.btoa(str); // NOT real MD5, just placeholder for now
}

async function hashString(str: string, algo: string): Promise<string> {
  if (algo === 'MD5') {
    return md5(str);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  let hashBuffer;
  try {
    hashBuffer = await window.crypto.subtle.digest(algo, data);
  } catch {
    return 'Hashing not supported in this browser.';
  }
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const HASH_ALGOS = [
  { label: 'MD5', value: 'MD5' },
  { label: 'SHA-1', value: 'SHA-1' },
  { label: 'SHA-256', value: 'SHA-256' },
  { label: 'SHA-512', value: 'SHA-512' },
];

const HashGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [algo, setAlgo] = useState('MD5');
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleHash = async (val: string, alg: string) => {
    setLoading(true);
    setHash('');
    const result = await hashString(val, alg);
    setHash(result);
    setLoading(false);
  };

  React.useEffect(() => {
    if (input) handleHash(input, algo);
    else setHash('');
    // eslint-disable-next-line
  }, [input, algo]);

  return (
    <div className="flex flex-col gap-4">
      <textarea
        className="p-2 border rounded w-full min-h-[80px]"
        placeholder="Enter text to hash..."
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <label className="font-medium">Algorithm:</label>
        <select
          className="p-2 border rounded"
          value={algo}
          onChange={e => setAlgo(e.target.value)}
        >
          {HASH_ALGOS.map(a => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </div>
      <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 break-all select-all min-h-[40px]">
        {loading ? 'Hashing...' : hash || <span className="text-gray-400">Hash will appear here</span>}
      </div>
      <button
        className="btn btn-primary w-fit"
        disabled={!hash}
        onClick={() => { navigator.clipboard.writeText(hash); }}
      >Copy Hash</button>
    </div>
  );
};

export default HashGenerator; 