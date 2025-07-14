import React, { useState } from 'react';
import * as XLSX from 'xlsx'; // <-- Add this import

const CSVToExcelPage: React.FC = () => {
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a CSV file.');
      return;
    }

    setFileName(file.name.replace(/\.csv$/i, ''));
    
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const data = lines
        .filter(line => line.trim() !== '')
        .map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')));
      
      setCsvData(data);
    } catch (error) {
      alert('Error reading CSV file.');
    }
  };

  // FIX: Use xlsx to generate a real Excel file
  const downloadExcel = () => {
    if (!csvData) return;

    // Create a worksheet from the CSV data
    const worksheet = XLSX.utils.aoa_to_sheet(csvData);
    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    // Write the workbook as an Excel file
    XLSX.writeFile(workbook, `${fileName || 'converted'}.xlsx`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">CSV to Excel Converter</h1>
      
      <div className="mb-6">
        <input 
          type="file" 
          accept=".csv" 
          onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {csvData && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <tbody>
                {csvData.slice(0, 10).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border border-gray-300 px-2 py-1">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Showing first 10 rows of {csvData.length} total rows
          </p>
        </div>
      )}

      {csvData && (
        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
        >
          Download Excel File
        </button>
      )}
    </div>
  );
};

export default CSVToExcelPage;