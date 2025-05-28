import React, { useState } from 'react';

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');
  let output: React.ReactNode = text;
  try {
    if (pattern) {
      const re = new RegExp(pattern, flags);
      let lastIndex = 0;
      const matches = [];
      for (const m of text.matchAll(re)) {
        const start = m.index ?? 0;
        if (start > lastIndex) matches.push(text.slice(lastIndex, start));
        matches.push(<mark key={start} className="bg-yellow-200 text-black rounded px-1">{m[0]}</mark>);
        lastIndex = start + m[0].length;
      }
      if (lastIndex < text.length) matches.push(text.slice(lastIndex));
      output = matches;
    }
  } catch {
    output = <span className="text-red-600">Invalid regex</span>;
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-slate-100 dark:bg-slate-700 rounded p-3 text-sm text-gray-700 dark:text-gray-200">
        <b>How to use:</b> Enter a <b>regex pattern</b> (e.g. <code>foo.*bar</code>), optional <b>flags</b> (e.g. <code>gim</code>), and the text to test below. All matches will be <mark className="bg-yellow-200 text-black rounded px-1">highlighted</mark> in real time.<br/>
        <b>Flags:</b> <code>g</code> (global), <code>i</code> (ignore case), <code>m</code> (multiline), <code>s</code> (dotAll), <code>y</code> (sticky).<br/>
        Example: Pattern <code>\d+</code> with flag <code>g</code> will highlight all numbers.
      </div>
      <div className="flex gap-2">
        <input className="p-2 border rounded flex-1" placeholder="Pattern" value={pattern} onChange={e => setPattern(e.target.value)} />
        <input className="p-2 border rounded w-24" placeholder="Flags (gimsy)" value={flags} onChange={e => setFlags(e.target.value)} />
      </div>
      <textarea className="p-2 border rounded w-full min-h-[120px]" placeholder="Text to test..." value={text} onChange={e => setText(e.target.value)} />
      <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 min-h-[40px] whitespace-pre-wrap font-mono">{output}</div>
    </div>
  );
};

export default RegexTester; 