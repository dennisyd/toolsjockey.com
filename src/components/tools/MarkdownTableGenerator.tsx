import React, { useState } from 'react';
import Papa from 'papaparse';

function csvToMarkdownTable(data: string[][]): string {
  if (!data.length) return '';
  const header = '| ' + data[0].join(' | ') + ' |';
  const sep = '| ' + data[0].map(() => '---').join(' | ') + ' |';
  const rows = data.slice(1).map(row => '| ' + row.join(' | ') + ' |');
  return [header, sep, ...rows].join('\n');
}

const MarkdownTableGenerator: React.FC = () => {
  const [data, setData] = useState<string[][]>([]);
  const [raw, setRaw] = useState('');

  const handleFile = (f: File) => {
    Papa.parse(f, {
      complete: (res) => setData(res.data as string[][]),
    });
  };

  const handlePaste = (txt: string) => {
    const rows = txt.trim().split(/\r?\n/).map(r => r.split(/\t|,|\s{2,}/));
    setData(rows);
  };

  const md = csvToMarkdownTable(data);

  return (
    <div className="flex flex-col gap-4">
      <input type="file" accept=".csv" onChange={e => e.target.files && handleFile(e.target.files[0])} />
      <textarea className="p-2 border rounded w-full min-h-[80px]" placeholder="Paste table data here..." value={raw} onChange={e => { setRaw(e.target.value); handlePaste(e.target.value); }} />
      {md && (
        <>
          <label className="font-medium">Markdown Table</label>
          <textarea className="p-2 border rounded w-full min-h-[80px] bg-slate-50 dark:bg-slate-800" value={md} readOnly />
          <button className="btn btn-primary w-fit" onClick={() => navigator.clipboard.writeText(md)}>Copy Markdown</button>
          <div className="mt-4">
            <label className="font-medium">Preview</label>
            <div className="prose bg-white dark:bg-primary-light p-4 rounded shadow overflow-x-auto" dangerouslySetInnerHTML={{ __html: md.replace(/\n/g, '<br/>') }} />
          </div>
        </>
      )}
    </div>
  );
};

export default MarkdownTableGenerator; 