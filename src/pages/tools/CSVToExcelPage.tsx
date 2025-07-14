import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const CSVToExcelPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [previewData, setPreviewData] = useState<string[][] | null>(null);

  const handleFileUpload = async (files: File[]) => {
    setError(null);
    setPreviewData(null);
    const file = files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are supported.');
      return;
    }
    setFileName(file.name.replace(/\.csv$/i, ''));

    try {
      const text = await file.text();
      // Robust CSV parsing with PapaParse
      const result = Papa.parse<string[]>(text, { skipEmptyLines: true });
      if (result.errors.length > 0) {
        setError('Failed to parse CSV file.');
        return;
      }
      setPreviewData(result.data);
    } catch (err) {
      setError('Failed to parse CSV file.');
    }
  };

  const handleDownload = () => {
    if (!previewData) return;
    const ws = XLSX.utils.aoa_to_sheet(previewData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName || 'converted'}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">CSV to Excel Converter</h1>
      <p className="mb-4 text-gray-600">Upload a CSV file to preview and convert it to Excel (.xlsx).</p>
      <input
        type="file"
        accept=".csv"
        onChange={e => {
          if (e.target.files) handleFileUpload(Array.from(e.target.files));
        }}
        className="mb-4"
      />
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {previewData && (
        <>
          <div className="mb-4">
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors mb-2"
            >
              Download Excel
            </button>
          </div>
          <div className="overflow-x-auto bg-slate-100 rounded p-2 mb-4">
            <table className="min-w-full text-xs">
              <thead>
                <tr>
                  {previewData[0]?.map((cell, idx) => (
                    <th key={idx} className="border px-2 py-1 bg-gray-200">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.slice(1, 21).map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="border px-2 py-1">{cell}</td>
                    ))}
                  </tr>
                ))}
                {previewData.length > 21 && (
                  <tr>
                    <td colSpan={previewData[0]?.length || 1} className="text-center text-gray-500">
                      ...showing first 20 rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default CSVToExcelPage; 