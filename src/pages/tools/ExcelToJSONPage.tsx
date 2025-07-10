import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { jsonConverter } from '../../components/tools/excel-converter/jsonConverter';
import type { JSONOptions } from '../../components/tools/excel-converter/jsonConverter';

const defaultOptions: JSONOptions = {
  structure: 'arrayOfObjects',
  propertyNaming: 'original',
  pretty: true,
};

const ExcelToJSONPage: React.FC = () => {
  const [json, setJSON] = useState('');
  const [options, setOptions] = useState<JSONOptions>(defaultOptions);
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
      const jsonStr = jsonConverter(worksheetData, options);
      setJSON(jsonStr);
    } catch (err: any) {
      setError('Failed to parse Excel file.');
      setJSON('');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName || 'converted'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Excel to JSON Converter</h1>
      <p className="mb-4 text-gray-600">Convert your Excel (.xlsx) files to JSON format. Choose structure and property naming options.</p>
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="mb-4" />
      <div className="mb-4 flex gap-4 flex-wrap">
        <label>
          Structure:
          <select value={options.structure} onChange={e => setOptions(o => ({ ...o, structure: e.target.value as any }))} className="ml-2">
            <option value="arrayOfObjects">Array of Objects</option>
            <option value="nestedBySheet">Nested by Sheet</option>
            <option value="hierarchical">Hierarchical</option>
            <option value="flattened">Flattened</option>
          </select>
        </label>
        <label>
          Property Naming:
          <select value={options.propertyNaming} onChange={e => setOptions(o => ({ ...o, propertyNaming: e.target.value as any }))} className="ml-2">
            <option value="original">Original</option>
            <option value="camelCase">camelCase</option>
            <option value="snake_case">snake_case</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={options.pretty} onChange={e => setOptions(o => ({ ...o, pretty: e.target.checked }))} className="ml-2" /> Pretty Print
        </label>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {json && (
        <>
          <button onClick={handleDownload} className="btn btn-primary mb-2">Download JSON</button>
          <pre className="bg-slate-100 dark:bg-slate-900 rounded p-4 overflow-x-auto text-xs max-h-96">{json}</pre>
        </>
      )}
    </div>
  );
};

export default ExcelToJSONPage; 