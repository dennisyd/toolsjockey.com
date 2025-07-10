import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { pdfConverter } from '../../components/tools/excel-converter/pdfConverter';
import type { PDFOptions } from '../../components/tools/excel-converter/pdfConverter';

const defaultOptions: PDFOptions = {
  layout: 'table',
  branding: true,
  charts: false,
};

const ExcelToPDFPage: React.FC = () => {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [options, setOptions] = useState<PDFOptions>(defaultOptions);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPdfBlob(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.[^.]+$/, ''));
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const worksheetData: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const pdf = await pdfConverter(worksheetData, options);
      setPdfBlob(pdf);
    } catch (err: any) {
      setError('Failed to parse Excel file or generate PDF.');
      setPdfBlob(null);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName || 'converted'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Excel to PDF Converter</h1>
      <p className="mb-4 text-gray-600">Convert your Excel (.xlsx) files to PDF format. Choose layout and branding options.</p>
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} className="mb-4" />
      <div className="mb-4 flex gap-4 flex-wrap">
        <label>
          Layout:
          <select value={options.layout} onChange={e => setOptions(o => ({ ...o, layout: e.target.value as any }))} className="ml-2">
            <option value="table">Table</option>
            <option value="report">Report</option>
            <option value="summary">Summary</option>
            <option value="detailed">Detailed</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={options.branding} onChange={e => setOptions(o => ({ ...o, branding: e.target.checked }))} className="ml-2" /> Branding
        </label>
        <label>
          <input type="checkbox" checked={options.charts} onChange={e => setOptions(o => ({ ...o, charts: e.target.checked }))} className="ml-2" /> Charts (if supported)
        </label>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {pdfBlob && (
        <button onClick={handleDownload} className="btn btn-primary mb-2">Download PDF</button>
      )}
    </div>
  );
};

export default ExcelToPDFPage; 