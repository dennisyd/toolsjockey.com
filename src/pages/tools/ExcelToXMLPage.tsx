import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { xmlConverter } from '../../components/tools/excel-converter/xmlConverter';
import type { XMLOptions } from '../../components/tools/excel-converter/xmlConverter';

const defaultOptions: XMLOptions = {
  rootElement: 'rows',
};

const ExcelToXMLPage: React.FC = () => {
  const [xml, setXML] = useState('');
  const [options, setOptions] = useState<XMLOptions>(defaultOptions);
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
      const xmlStr = xmlConverter(worksheetData, options);
      setXML(xmlStr);
    } catch (err: any) {
      setError('Failed to parse Excel file.');
      setXML('');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName || 'converted'}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Excel to XML Converter</h1>
      <p className="mb-4 text-gray-600">Convert your Excel (.xlsx) files to XML format. Choose the root element name.</p>
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="mb-4" />
      <div className="mb-4 flex gap-4 flex-wrap">
        <label>
          Root Element:
          <input type="text" value={options.rootElement} onChange={e => setOptions(o => ({ ...o, rootElement: e.target.value }))} className="ml-2 border rounded px-2 py-1" />
        </label>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {xml && (
        <>
          <button onClick={handleDownload} className="btn btn-primary mb-2">Download XML</button>
          <pre className="bg-slate-100 dark:bg-slate-900 rounded p-4 overflow-x-auto text-xs max-h-96">{xml}</pre>
        </>
      )}
    </div>
  );
};

export default ExcelToXMLPage; 