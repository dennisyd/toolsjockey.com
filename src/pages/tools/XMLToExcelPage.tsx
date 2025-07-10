import React, { useState } from 'react';
import { ArrowDownTrayIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import FileUploader from '../../components/shared/FileUploader';
import * as XLSX from 'xlsx';

function parseXMLToRows(xmlString: string, rowTagGuess?: string) {
  // Parse XML and try to extract tabular data
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlString, 'application/xml');
  const parserError = xml.getElementsByTagName('parsererror');
  if (parserError.length > 0) {
    throw new Error('Invalid XML file.');
  }

  // Try to guess the main repeating element (row)
  let rowTag = rowTagGuess;
  if (!rowTag) {
    // Find the first element with multiple siblings of the same tag
    const allElements = Array.from(xml.getElementsByTagName('*'));
    const tagCounts: Record<string, number> = {};
    allElements.forEach(el => {
      tagCounts[el.tagName] = (tagCounts[el.tagName] || 0) + 1;
    });
    rowTag = Object.entries(tagCounts).filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1])[0]?.[0];
  }
  if (!rowTag) throw new Error('Could not detect a repeating row element in the XML.');

  const rows = Array.from(xml.getElementsByTagName(rowTag));
  if (rows.length === 0) throw new Error('No data rows found in the XML.');

  // Extract columns from first row
  const firstRow = rows[0];
  const columns = Array.from(firstRow.children).map(child => child.tagName);

  // Build data array
  const data = rows.map(row => {
    const obj: Record<string, string> = {};
    columns.forEach(col => {
      const el = row.getElementsByTagName(col)[0];
      obj[col] = el ? el.textContent || '' : '';
    });
    return obj;
  });

  return { columns, data, rowTag };
}

const XMLToExcelPage: React.FC = () => {
  const [xmlData, setXmlData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [rowTag, setRowTag] = useState<string>('');
  const [rowTagInput, setRowTagInput] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileUpload = (files: File[]) => {
    setError(null);
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setXmlData(text);
      setFileName(file.name.replace('.xml', ''));
      setUploadedFiles(files);
      try {
        const { columns, data, rowTag } = parseXMLToRows(text);
        setColumns(columns);
        setData(data);
        setRowTag(rowTag);
        setRowTagInput(rowTag);
      } catch (err: any) {
        setColumns([]);
        setData([]);
        setRowTag('');
        setRowTagInput('');
        setError(err.message || 'Failed to parse XML.');
      }
    };
    reader.readAsText(file);
  };

  const handleRowTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowTagInput(e.target.value);
    if (xmlData && e.target.value) {
      try {
        const { columns, data, rowTag } = parseXMLToRows(xmlData, e.target.value);
        setColumns(columns);
        setData(data);
        setRowTag(rowTag);
        setError(null);
      } catch (err: any) {
        setColumns([]);
        setData([]);
        setRowTag('');
        setError(err.message || 'Failed to parse XML.');
      }
    }
  };

  const convertToExcel = async () => {
    if (!data || data.length === 0) return;
    setIsConverting(true);
    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName || 'converted'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to convert to Excel.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleClear = () => {
    setXmlData(null);
    setFileName('');
    setColumns([]);
    setData([]);
    setRowTag('');
    setRowTagInput('');
    setUploadedFiles([]);
    setError(null);
  };

  return (
    <ToolPageLayout
      toolId="xml-to-excel"
      title="XML to Excel Converter"
      icon={DocumentArrowUpIcon}
      group="excelcsv"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload XML File</h3>
          <FileUploader
            onFileUpload={handleFileUpload}
            accept=".xml"
            maxSize={10 * 1024 * 1024} // 10MB
            description="Drag and drop an XML file here, or click to browse"
            files={uploadedFiles}
          />
          {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
        </div>

        {/* Row Tag Selection */}
        {xmlData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              XML Row Element (repeating):
            </label>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full max-w-xs"
              value={rowTagInput}
              onChange={handleRowTagChange}
              placeholder="e.g. row, item, record"
            />
            <p className="text-xs text-gray-500 mt-1">
              The tool tries to auto-detect the repeating element. You can override it here if needed.
            </p>
          </div>
        )}

        {/* Preview Section */}
        {data.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Preview</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columns.map((header, index) => (
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
                  {data.slice(0, 10).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((col, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Showing first {Math.min(data.length, 10)} of {data.length} rows
            </p>
          </div>
        )}

        {/* Conversion Section */}
        {data.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Convert to Excel</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  File: <span className="font-medium">{fileName || 'converted'}.xml</span>
                </p>
                <p className="text-sm text-gray-600">
                  Rows: <span className="font-medium">{data.length}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Columns: <span className="font-medium">{columns.length}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Row element: <span className="font-medium">{rowTag}</span>
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
            <li>• Upload any XML file (up to 10MB)</li>
            <li>• The tool auto-detects the repeating row element (e.g. <code>&lt;row&gt;</code>, <code>&lt;item&gt;</code>, etc.)</li>
            <li>• Preview your data and adjust the row element if needed</li>
            <li>• Download the converted .xlsx file</li>
          </ul>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default XMLToExcelPage; 