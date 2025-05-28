import React, { useState } from 'react';
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
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 flex flex-col gap-2">
        <label className="font-medium">Text A</label>
        <textarea className="p-2 border rounded w-full min-h-[120px]" value={a} onChange={e => setA(e.target.value)} />
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <label className="font-medium">Text B</label>
        <textarea className="p-2 border rounded w-full min-h-[120px]" value={b} onChange={e => setB(e.target.value)} />
      </div>
      <div className="w-full md:w-1/2 flex flex-col gap-2">
        <label className="font-medium">Diff Output</label>
        <div className="p-2 border rounded bg-slate-50 dark:bg-slate-800 min-h-[120px] whitespace-pre-wrap font-mono text-sm">
          {diffHtml(a, b)}
        </div>
      </div>
    </div>
  );
};

export default TextDiffViewer; 