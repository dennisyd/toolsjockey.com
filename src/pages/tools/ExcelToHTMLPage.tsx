import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { htmlConverter } from '../../components/tools/excel-converter/htmlConverter';
import type { HTMLOptions } from '../../components/tools/excel-converter/htmlConverter';

const defaultOptions: HTMLOptions = {
  template: 'basic',
  theme: '',
  interactivity: false,
  printOptimized: false,
};

const ExcelToHTMLPage: React.FC = () => {
  const [html, setHTML] = useState('');
  const [options, setOptions] = useState<HTMLOptions>(defaultOptions);
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
      const htmlStr = htmlConverter(worksheetData, options);
      setHTML(htmlStr);
    } catch (err: any) {
      setError('Failed to parse Excel file.');
      setHTML('');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName || 'converted'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Excel to HTML Converter</h1>
      <p className="mb-4 text-gray-600">Convert your Excel (.xlsx) files to HTML format. Choose template and options.</p>
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="mb-4" />
      <div className="mb-4 flex gap-4 flex-wrap">
        <label>
          Template:
          <select value={options.template} onChange={e => setOptions(o => ({ ...o, template: e.target.value as any }))} className="ml-2">
            <option value="basic">Basic</option>
            <option value="professional">Professional</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={options.interactivity} onChange={e => setOptions(o => ({ ...o, interactivity: e.target.checked }))} className="ml-2" /> Interactivity
        </label>
        <label>
          <input type="checkbox" checked={options.printOptimized} onChange={e => setOptions(o => ({ ...o, printOptimized: e.target.checked }))} className="ml-2" /> Print Optimized
        </label>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {html && (
        <>
          <button onClick={handleDownload} className="btn btn-primary mb-2">Download HTML</button>
          <pre className="bg-slate-100 dark:bg-slate-900 rounded p-4 overflow-x-auto text-xs max-h-96">{html}</pre>
        </>
      )}
    </div>
  );
};

export default ExcelToHTMLPage; 