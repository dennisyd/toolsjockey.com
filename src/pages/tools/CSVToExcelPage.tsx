import React, { useState } from 'react';
import { ArrowDownTrayIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import FileUploader from '../../components/shared/FileUploader';
import * as XLSX from 'xlsx';

const CSVToExcelPage: React.FC = () => {
  const [csvData, setCsvData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0]; // We only need one file
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
      setFileName(file.name.replace('.csv', ''));
      setUploadedFiles(files);
      
      // Parse CSV for preview
      try {
        const lines = text.split('\n');
        const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, ''));
        const previewRows = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers?.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        }).filter(row => Object.values(row).some(val => val !== ''));
        
        setPreviewData(previewRows);
      } catch (error) {
        console.error('Error parsing CSV preview:', error);
        setPreviewData([]);
      }
    };
    reader.readAsText(file);
  };

  const convertToExcel = async () => {
    if (!csvData) return;

    setIsConverting(true);
    
    try {
      // Parse CSV data
      const lines = csvData.split('\n');
      const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, ''));
      
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers?.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      }).filter(row => Object.values(row).some(val => val !== ''));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Download file using native browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName || 'converted'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error converting CSV to Excel:', error);
      alert('Error converting file. Please check your CSV format.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleClear = () => {
    setCsvData(null);
    setFileName('');
    setPreviewData([]);
    setUploadedFiles([]);
  };

  return (
    <ToolPageLayout
      toolId="csv-to-excel"
      title="CSV to Excel Converter"
      icon={DocumentArrowUpIcon}
      group="excelcsv"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h3>
          <FileUploader
            onFileUpload={handleFileUpload}
            accept=".csv"
            maxSize={10 * 1024 * 1024} // 10MB
            description="Drag and drop a CSV file here, or click to browse"
            files={uploadedFiles}
          />
        </div>

        {/* Preview Section */}
        {previewData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Preview</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0] || {}).map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Showing first {previewData.length} rows of data
            </p>
          </div>
        )}

        {/* Conversion Section */}
        {csvData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Convert to Excel</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  File: <span className="font-medium">{fileName || 'converted'}.csv</span>
                </p>
                <p className="text-sm text-gray-600">
                  Rows: <span className="font-medium">{previewData.length + (previewData.length > 0 ? '...' : '0')}</span>
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleClear}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear
                </button>
                <button
                  onClick={convertToExcel}
                  disabled={isConverting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConverting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Converting...
                    </>
                  ) : (
                    <>
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      Convert to Excel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Upload any CSV file (up to 10MB)</li>
            <li>• Preview your data to ensure correct parsing</li>
            <li>• Convert to Excel format with automatic column detection</li>
            <li>• Download the converted .xlsx file</li>
          </ul>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default CSVToExcelPage; 