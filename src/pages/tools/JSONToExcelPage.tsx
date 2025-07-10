import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const JSONToExcelPage: React.FC = () => {
  const [preview, setPreview] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPreview([]);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.[^.]+$/, ''));
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      let data: any[] = [];
      if (Array.isArray(json)) {
        data = json;
      } else if (typeof json === 'object') {
        // Try to find an array property
        const arr = Object.values(json).find(v => Array.isArray(v));
        if (arr) data = arr as any[];
        else throw new Error('JSON must be an array or contain an array property.');
      } else {
        throw new Error('Invalid JSON structure.');
      }
      setPreview(data.slice(0, 10));
      // Store for download
      (window as any)._jsonToExcelData = data;
    } catch (err: any) {
      setError('Failed to parse JSON file.');
    }
  };

  const handleDownload = () => {
    const data = (window as any)._jsonToExcelData;
    if (!data) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName || 'converted'}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">JSON to Excel Converter</h1>
      <p className="mb-4 text-gray-600">Convert your JSON files to Excel (.xlsx) format. Upload a JSON array or object containing an array.</p>
      <input type="file" accept=".json,application/json" onChange={handleFile} className="mb-4" />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {preview.length > 0 && (
        <>
          <button onClick={handleDownload} className="btn btn-primary mb-2">Download Excel</button>
          <div className="overflow-x-auto mb-2">
            <table className="table-auto text-xs bg-slate-100 dark:bg-slate-900 rounded">
              <thead>
                <tr>
                  {Object.keys(preview[0]).map((k) => <th key={k} className="px-2 py-1">{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((cell, j) => <td key={j} className="border px-2 py-1">{String(cell)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-xs text-gray-500 mt-2">Previewing first 10 rows.</div>
          </div>
        </>
      )}
    </div>
  );
};

export default JSONToExcelPage; 