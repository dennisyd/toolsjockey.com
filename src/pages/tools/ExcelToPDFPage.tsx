import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { pdfConverter } from '../../components/tools/excel-converter/pdfConverter';
import type { PDFOptions } from '../../components/tools/excel-converter/pdfConverter';

const defaultOptions: PDFOptions = {
  layout: 'table',
  branding: true,
  orientation: 'portrait',
  fontSize: 8,
  maxRows: 100,
  includeHeaders: true,
};

const ExcelToPDFPage: React.FC = () => {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [options, setOptions] = useState<PDFOptions>(defaultOptions);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [worksheetData, setWorksheetData] = useState<string[][] | null>(null);

  // Add debug logging for options changes
  console.log('Current options state:', options);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPdfBlob(null);
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.[^.]+$/, ''));
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelData: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      setWorksheetData(excelData); // Store the data for regeneration
      console.log('File processed, data stored for regeneration');
    } catch (err: any) {
      setError('Failed to parse Excel file.');
      setWorksheetData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Regenerate PDF whenever options or worksheetData changes
  useEffect(() => {
    if (worksheetData && worksheetData.length > 0) {
      console.log('Regenerating PDF with new options:', options);
      setIsProcessing(true);
      
      pdfConverter(worksheetData, options)
        .then(pdf => {
          setPdfBlob(pdf);
          setError(null);
        })
        .catch((err: any) => {
          console.error('PDF generation error:', err);
          setError('Failed to generate PDF.');
          setPdfBlob(null);
        })
        .finally(() => {
          setIsProcessing(false);
        });
    }
  }, [options, worksheetData]);

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Excel to PDF Converter</h1>
      
      {/* Use Case Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2"> Best Use Cases</h2>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Small to medium datasets</strong> (up to 1000 rows recommended)</li>
          <li>• <strong>Simple tables</strong> with standard column headers</li>
          <li>• <strong>Reports and summaries</strong> for sharing or printing</li>
          <li>• <strong>Data snapshots</strong> for documentation</li>
        </ul>
        
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Limitations</h3>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• <strong>Wide tables</strong> with many columns may not display properly</li>
            <li>• <strong>Long header names</strong> may be truncated</li>
            <li>• <strong>Complex formatting</strong> (colors, formulas) is not preserved</li>
            <li>• <strong>Large datasets</strong> (&gt;1000 rows) may be slow or incomplete</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Excel File
            </label>
            <input 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleFile} 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {isProcessing && (
            <div className="text-blue-600 text-sm">Processing your file...</div>
          )}

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>
          )}

          {pdfBlob && (
            <button 
              onClick={handleDownload} 
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Download PDF
            </button>
          )}
        </div>

        {/* Options Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">PDF Options</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Layout Style
              </label>
              <select 
                value={options.layout} 
                onChange={e => setOptions(o => ({ ...o, layout: e.target.value as any }))} 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="table">Table - Gray headers with grid lines</option>
                <option value="report">Report - Blue headers with clean styling</option>
                <option value="summary">Summary - With statistics and data overview</option>
                <option value="detailed">Detailed - Dark headers with page numbers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orientation
              </label>
              <select 
                value={options.orientation} 
                onChange={e => setOptions(o => ({ ...o, orientation: e.target.value as any }))} 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="portrait">Portrait - Better for tall tables</option>
                <option value="landscape">Landscape - Better for wide tables</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Size
              </label>
              <select 
                value={options.fontSize} 
                onChange={e => setOptions(o => ({ ...o, fontSize: parseInt(e.target.value) }))} 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={6}>6pt - Small (more data per page)</option>
                <option value={8}>8pt - Medium (default)</option>
                <option value={10}>10pt - Large (easier to read)</option>
                <option value={12}>12pt - Extra Large (very readable)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Rows
              </label>
              <select 
                value={options.maxRows} 
                onChange={e => setOptions(o => ({ ...o, maxRows: parseInt(e.target.value) }))} 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={50}>50 rows</option>
                <option value={100}>100 rows (default)</option>
                <option value={250}>250 rows</option>
                <option value={500}>500 rows</option>
                <option value={1000}>1000 rows (max)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={options.includeHeaders} 
                  onChange={e => setOptions(o => ({ ...o, includeHeaders: e.target.checked }))} 
                  className="mr-2"
                />
                Include Headers (first row as column titles)
              </label>
              
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={options.branding} 
                  onChange={e => {
                    console.log('Branding checkbox changed to:', e.target.checked);
                    setOptions(o => {
                      const newOptions = { ...o, branding: e.target.checked };
                      console.log('New options after branding change:', newOptions);
                      return newOptions;
                    });
                  }} 
                  className="mr-2"
                />
                Add ToolsJockey Branding
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ExcelToPDFPage; 