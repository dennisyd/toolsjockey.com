import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { csvConverter } from '../../components/tools/excel-converter/csvConverter';
import type { CSVOptions } from '../../components/tools/excel-converter/csvConverter';

const defaultOptions: CSVOptions = {
  delimiter: ',',
  encoding: 'UTF-8',
  quoting: 'minimal',
  headers: true,
  lineEnding: '\n',
};

const ExcelToCSVPage: React.FC = () => {
  const [csv, setCSV] = useState('');
  const [options, setOptions] = useState<CSVOptions>(defaultOptions);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.[^.]+$/, ''));
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const worksheetData: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const csvStr = csvConverter(worksheetData, options);
      setCSV(csvStr);
    } catch (err: any) {
      setError('Failed to parse Excel file.');
      setCSV('');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName || 'converted'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Excel to CSV Converter</h1>
      <p className="mb-4 text-gray-600">Convert your Excel (.xlsx) files to CSV format. Choose delimiter, encoding, and other options.</p>
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="mb-4" />
      <div className="mb-4 flex gap-4 flex-wrap">
        <label>
          Delimiter:
          <select value={options.delimiter} onChange={e => setOptions(o => ({ ...o, delimiter: e.target.value }))} className="ml-2">
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
          </select>
        </label>
        <label>
          Quoting:
          <select value={options.quoting} onChange={e => setOptions(o => ({ ...o, quoting: e.target.value as any }))} className="ml-2">
            <option value="always">Always</option>
            <option value="minimal">Minimal</option>
            <option value="never">Never</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={options.headers} onChange={e => setOptions(o => ({ ...o, headers: e.target.checked }))} className="ml-2" /> Include Headers
        </label>
        <label>
          Line Ending:
          <select value={options.lineEnding} onChange={e => setOptions(o => ({ ...o, lineEnding: e.target.value as any }))} className="ml-2">
            <option value="\n">LF (\n)</option>
            <option value="\r\n">CRLF (\r\n)</option>
            <option value="\r">CR (\r)</option>
          </select>
        </label>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {csv && (
        <>
          <button onClick={handleDownload} className="btn btn-primary mb-2">Download CSV</button>
          <pre className="bg-slate-100 dark:bg-slate-900 rounded p-4 overflow-x-auto text-xs max-h-96">{csv}</pre>
        </>
      )}
    </div>
  );
};

export default ExcelToCSVPage; 