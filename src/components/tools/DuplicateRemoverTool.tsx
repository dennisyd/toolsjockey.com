import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

function parseFile(file: File, cb: (data: string[][]) => void) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') {
    Papa.parse(file, {
      complete: (res) => cb(res.data as string[][]),
    });
  } else {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as string[][];
      cb(data);
    };
    reader.readAsBinaryString(file);
  }
}

function downloadCSV(data: string[][], name = 'deduped.csv') {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const DuplicateRemoverTool: React.FC = () => {
  const [data, setData] = useState<string[][]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const handleFile = (f: File) => {
    parseFile(f, (rows) => {
      setData(rows);
      setColumns(rows[0] || []);
      setSelected(rows[0] ? [rows[0][0]] : []);
    });
  };

  const deduped = React.useMemo(() => {
    if (!data.length || !selected.length) return [];
    const seen = new Set();
    const out = [data[0]];
    for (const row of data.slice(1)) {
      const key = selected.map(col => row[columns.indexOf(col)]).join('||');
      if (!seen.has(key)) {
        seen.add(key);
        out.push(row);
      }
    }
    return out;
  }, [data, selected, columns]);

  return (
    <div className="flex flex-col gap-4">
      <input type="file" accept=".csv,.xlsx" onChange={e => e.target.files && handleFile(e.target.files[0])} />
      {columns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {columns.map(col => (
            <label key={col} className="flex items-center gap-1">
              <input type="checkbox" checked={selected.includes(col)} onChange={e => setSelected(sel => e.target.checked ? [...sel, col] : sel.filter(c => c !== col))} />
              {col}
            </label>
          ))}
        </div>
      )}
      {deduped.length > 1 && (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-xs">
              <thead><tr>{deduped[0].map((h, i) => <th key={i} className="border px-2 py-1 bg-slate-100 dark:bg-slate-700">{h}</th>)}</tr></thead>
              <tbody>{deduped.slice(1).map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="border px-2 py-1">{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <button className="btn btn-primary mt-2" onClick={() => downloadCSV(deduped)}>Download CSV</button>
        </>
      )}
    </div>
  );
};

export default DuplicateRemoverTool; 