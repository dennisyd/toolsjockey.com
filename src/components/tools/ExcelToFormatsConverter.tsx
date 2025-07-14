import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { csvConverter } from './excel-converter/csvConverter';
import type { CSVOptions } from './excel-converter/csvConverter';
import { jsonConverter } from './excel-converter/jsonConverter';
import type { JSONOptions } from './excel-converter/jsonConverter';
import { htmlConverter } from './excel-converter/htmlConverter';
import type { HTMLOptions } from './excel-converter/htmlConverter';
import { pdfConverter } from './excel-converter/pdfConverter';
import type { PDFOptions } from './excel-converter/pdfConverter';
import { sheetsConverter, getSheetsImportInstructions } from './excel-converter/sheetsConverter';
import type { SheetsOptions } from './excel-converter/sheetsConverter';
// TODO: Import modular converters when implemented
// import { csvConverter, jsonConverter, htmlConverter, pdfConverter, sheetsConverter } from './excel-converter';

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  sheets: string[];
  preview: string[][][]; // preview per sheet
  metadata: Record<string, any>;
}

const FORMAT_OPTIONS = [
  { key: 'csv', label: 'CSV', color: 'bg-green-500', description: 'Comma, tab, or pipe delimited text', icon: '🟩' },
  { key: 'json', label: 'JSON', color: 'bg-orange-500', description: 'Array of objects or nested', icon: '🟧' },
  { key: 'html', label: 'HTML', color: 'bg-purple-500', description: 'Styled HTML table', icon: '🟪' },
  { key: 'pdf', label: 'PDF', color: 'bg-red-500', description: 'Professional PDF report', icon: '🟥' },
  { key: 'sheets', label: 'Google Sheets', color: 'bg-blue-500', description: 'Google Sheets compatible', icon: '🟦' },
];

const STEPS = ['Upload', 'Format', 'Customize', 'Preview', 'Download'];

const ExcelToFormatsConverter: React.FC = () => {
  // Stepper state
  const [step, setStep] = useState(1);
  // File management
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  // Format selection
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  // TODO: Add customization state per format

  // Dropzone for Excel files
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: true,
    onDrop: async (acceptedFiles) => {
      const files: UploadedFile[] = [];
      for (const file of acceptedFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheets = workbook.SheetNames;
        const preview: string[][][] = sheets.map(sheetName => {
          const ws = workbook.Sheets[sheetName];
          return (XLSX.utils.sheet_to_json(ws, { header: 1 }) as (string | number | boolean | null)[][])
            .map(row => row.map(cell => cell == null ? '' : String(cell)));
        });
        files.push({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          sheets,
          preview,
          metadata: {
            sheetCount: sheets.length,
            rowCounts: sheets.map(s => XLSX.utils.sheet_to_json(workbook.Sheets[s], { header: 1 }).length),
          },
        });
      }
      setUploaded(prev => [...prev, ...files]);
      setSelectedFiles(prev => [...prev, ...files.map((_, i) => prev.length + i)]);
    },
  });

  // Stepper navigation
  const canProceed = [
    uploaded.length > 0,
    selectedFiles.length > 0 && selectedFormats.length > 0,
    true, // TODO: Add customization validation
    true, // TODO: Add preview validation
    true,
  ];

  const defaultCSVOptions: CSVOptions = {
    delimiter: ',',
    encoding: 'UTF-8',
    quoting: 'minimal',
    headers: true,
    lineEnding: '\n',
  };
  const defaultJSONOptions: JSONOptions = {
    structure: 'arrayOfObjects',
    propertyNaming: 'original',
    pretty: true,
  };
  const defaultHTMLOptions: HTMLOptions = {
    template: 'basic',
    theme: 'default',
    interactivity: false,
    printOptimized: false,
  };
  const defaultPDFOptions: PDFOptions = {
    layout: 'table',
    branding: false,
    orientation: 'portrait',
    fontSize: 8,
    maxRows: 100,
    includeHeaders: true,
  };
  const defaultSheetsOptions: SheetsOptions = {
    formulaPreservation: false,
    multiSheet: false,
    importInstructions: true,
  };

  // Customization state per format
  const [csvOptions, setCSVOptions] = useState<CSVOptions>(defaultCSVOptions);
  const [jsonOptions, setJSONOptions] = useState<JSONOptions>(defaultJSONOptions);
  const [htmlOptions, setHTMLOptions] = useState<HTMLOptions>(defaultHTMLOptions);
  const [pdfOptions, setPDFOptions] = useState<PDFOptions>(defaultPDFOptions);
  const [sheetsOptions, setSheetsOptions] = useState<SheetsOptions>(defaultSheetsOptions);

  // Preview state
  const [previewData, setPreviewData] = useState<{ [key: string]: string | Blob }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: get worksheet data (first file, first sheet for demo)
  const getWorksheetData = (): string[][] => {
    if (!uploaded.length) return [];
    // TODO: Support multi-file, multi-sheet
    return uploaded[0].preview[0] || [];
  };

  // Step 3: Customization UI
  const customizationUI = (
    <div>
      <div className="font-medium mb-2">Customize Conversion Options</div>
      {selectedFormats.includes('csv') && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <div className="font-semibold mb-1">CSV Options</div>
          <label className="block mb-1 text-xs">Delimiter:
            <select value={csvOptions.delimiter} onChange={e => setCSVOptions(o => ({ ...o, delimiter: e.target.value }))} className="ml-2">
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </label>
          <label className="block mb-1 text-xs">Encoding:
            <select value={csvOptions.encoding} onChange={e => setCSVOptions(o => ({ ...o, encoding: e.target.value }))} className="ml-2">
              <option value="UTF-8">UTF-8</option>
              <option value="UTF-16">UTF-16</option>
              <option value="ASCII">ASCII</option>
            </select>
          </label>
          <label className="block mb-1 text-xs">Quoting:
            <select value={csvOptions.quoting} onChange={e => setCSVOptions(o => ({ ...o, quoting: e.target.value as any }))} className="ml-2">
              <option value="minimal">Minimal</option>
              <option value="always">Always</option>
              <option value="never">Never</option>
            </select>
          </label>
          <label className="block mb-1 text-xs">Include Headers:
            <input type="checkbox" checked={csvOptions.headers} onChange={e => setCSVOptions(o => ({ ...o, headers: e.target.checked }))} className="ml-2" />
          </label>
          <label className="block mb-1 text-xs">Line Ending:
            <select value={csvOptions.lineEnding} onChange={e => setCSVOptions(o => ({ ...o, lineEnding: e.target.value as any }))} className="ml-2">
              <option value="\n">Unix (\n)</option>
              <option value="\r\n">Windows (\r\n)</option>
              <option value="\r">Mac (\r)</option>
            </select>
          </label>
        </div>
      )}
      {selectedFormats.includes('json') && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <div className="font-semibold mb-1">JSON Options</div>
          <label className="block mb-1 text-xs">Structure:
            <select value={jsonOptions.structure} onChange={e => setJSONOptions(o => ({ ...o, structure: e.target.value as any }))} className="ml-2">
              <option value="arrayOfObjects">Array of Objects</option>
              <option value="nestedBySheet">Nested by Sheet</option>
              <option value="hierarchical">Hierarchical</option>
              <option value="flattened">Flattened</option>
            </select>
          </label>
          <label className="block mb-1 text-xs">Property Naming:
            <select value={jsonOptions.propertyNaming} onChange={e => setJSONOptions(o => ({ ...o, propertyNaming: e.target.value as any }))} className="ml-2">
              <option value="original">Original</option>
              <option value="camelCase">camelCase</option>
              <option value="snake_case">snake_case</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label className="block mb-1 text-xs">Pretty Print:
            <input type="checkbox" checked={jsonOptions.pretty} onChange={e => setJSONOptions(o => ({ ...o, pretty: e.target.checked }))} className="ml-2" />
          </label>
        </div>
      )}
      {selectedFormats.includes('html') && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <div className="font-semibold mb-1">HTML Options</div>
          <label className="block mb-1 text-xs">Template:
            <select value={htmlOptions.template} onChange={e => setHTMLOptions(o => ({ ...o, template: e.target.value as any }))} className="ml-2">
              <option value="basic">Basic</option>
              <option value="professional">Professional</option>
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label className="block mb-1 text-xs">Interactivity:
            <input type="checkbox" checked={htmlOptions.interactivity} onChange={e => setHTMLOptions(o => ({ ...o, interactivity: e.target.checked }))} className="ml-2" />
          </label>
          <label className="block mb-1 text-xs">Print Optimized:
            <input type="checkbox" checked={htmlOptions.printOptimized} onChange={e => setHTMLOptions(o => ({ ...o, printOptimized: e.target.checked }))} className="ml-2" />
          </label>
        </div>
      )}
      {selectedFormats.includes('pdf') && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <div className="font-semibold mb-1">PDF Options</div>
          <label className="block mb-1 text-xs">Layout:
            <select value={pdfOptions.layout} onChange={e => setPDFOptions(o => ({ ...o, layout: e.target.value as any }))} className="ml-2">
              <option value="table">Table - Gray headers</option>
              <option value="report">Report - Blue headers</option>
              <option value="summary">Summary - With stats</option>
              <option value="detailed">Detailed - With page numbers</option>
            </select>
          </label>
          <label className="block mb-1 text-xs">Branding:
            <input type="checkbox" checked={pdfOptions.branding} onChange={e => setPDFOptions(o => ({ ...o, branding: e.target.checked }))} className="ml-2" />
          </label>
          <label className="block mb-1 text-xs">Orientation:
            <select value={pdfOptions.orientation} onChange={e => setPDFOptions(o => ({ ...o, orientation: e.target.value as any }))} className="ml-2">
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>
          <label className="block mb-1 text-xs">Font Size:
            <select value={pdfOptions.fontSize} onChange={e => setPDFOptions(o => ({ ...o, fontSize: parseInt(e.target.value) }))} className="ml-2">
              <option value={6}>6pt</option>
              <option value={8}>8pt</option>
              <option value={10}>10pt</option>
              <option value={12}>12pt</option>
            </select>
          </label>
          <label className="block mb-1 text-xs">Max Rows:
            <select value={pdfOptions.maxRows} onChange={e => setPDFOptions(o => ({ ...o, maxRows: parseInt(e.target.value) }))} className="ml-2">
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </label>
          <label className="block mb-1 text-xs">Include Headers:
            <input type="checkbox" checked={pdfOptions.includeHeaders} onChange={e => setPDFOptions(o => ({ ...o, includeHeaders: e.target.checked }))} className="ml-2" />
          </label>
        </div>
      )}
      {selectedFormats.includes('sheets') && (
        <div className="mb-4 p-3 border rounded bg-gray-50">
          <div className="font-semibold mb-1">Google Sheets Options</div>
          <label className="block mb-1 text-xs">Preserve Formulas:
            <input type="checkbox" checked={sheetsOptions.formulaPreservation} onChange={e => setSheetsOptions(o => ({ ...o, formulaPreservation: e.target.checked }))} className="ml-2" />
          </label>
          <label className="block mb-1 text-xs">Multi-Sheet:
            <input type="checkbox" checked={sheetsOptions.multiSheet} onChange={e => setSheetsOptions(o => ({ ...o, multiSheet: e.target.checked }))} className="ml-2" />
          </label>
          <label className="block mb-1 text-xs">Include Import Instructions:
            <input type="checkbox" checked={sheetsOptions.importInstructions} onChange={e => setSheetsOptions(o => ({ ...o, importInstructions: e.target.checked }))} className="ml-2" />
          </label>
        </div>
      )}
      <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold" onClick={async () => {
        setIsGenerating(true);
        setError(null);
        try {
          const worksheetData = getWorksheetData();
          const newPreview: { [key: string]: string | Blob } = {};
          if (selectedFormats.includes('csv')) newPreview.csv = csvConverter(worksheetData, csvOptions);
          if (selectedFormats.includes('json')) newPreview.json = jsonConverter(worksheetData, jsonOptions);
          if (selectedFormats.includes('html')) newPreview.html = htmlConverter(worksheetData, htmlOptions);
          if (selectedFormats.includes('pdf')) newPreview.pdf = await pdfConverter(worksheetData, pdfOptions);
          if (selectedFormats.includes('sheets')) newPreview.sheets = sheetsConverter(worksheetData, sheetsOptions).csv;
          setPreviewData(newPreview);
          setStep(4);
        } catch (e: any) {
          setError(e.message || 'Error generating preview.');
        }
        setIsGenerating(false);
      }} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Preview'}
      </button>
      {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
    </div>
  );

  // Step 4: Preview UI
  const previewUI = (
    <div>
      <div className="font-medium mb-2">Preview Output</div>
      {selectedFormats.map(fmt => (
        <div key={fmt} className="mb-4">
          <div className="font-semibold mb-1">{FORMAT_OPTIONS.find(f => f.key === fmt)?.label} Preview</div>
          {fmt === 'pdf' ? (
            previewData.pdf ? <span className="text-xs text-gray-500">PDF ready for download.</span> : <span className="text-xs text-gray-400">No preview available.</span>
          ) : (
            <pre className="bg-gray-100 rounded p-2 text-xs max-h-48 overflow-auto">
              {typeof previewData[fmt] === 'string' ? (previewData[fmt] as string).split('\n').slice(0, 20).join('\n') : 'No preview.'}
            </pre>
          )}
          {/* Google Sheets import instructions */}
          {fmt === 'sheets' && (
            <div className="text-xs text-blue-700 mt-2 border-l-4 border-blue-300 pl-2 bg-blue-50">
              <strong>Note:</strong> This is a Google Sheets-compatible CSV file.<br />
              {getSheetsImportInstructions()}
            </div>
          )}
        </div>
      ))}
      <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold" onClick={() => setStep(5)}>Continue to Download</button>
    </div>
  );

  // Step 5: Download UI
  const handleDownload = (fmt: string) => {
    const data = previewData[fmt];
    if (!data) return;
    let blob: Blob;
    let filename = `converted.${fmt === 'sheets' ? 'csv' : fmt}`;
    if (fmt === 'pdf' && data instanceof Blob) {
      blob = data;
      filename = 'converted.pdf';
    } else {
      blob = new Blob([data as string], { type: 'text/plain' });
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };
  const handleDownloadZip = async () => {
    const zip = new JSZip();
    for (const fmt of selectedFormats) {
      const data = previewData[fmt];
      if (!data) continue;
      let filename = `converted.${fmt === 'sheets' ? 'csv' : fmt}`;
      if (fmt === 'pdf' && data instanceof Blob) {
        zip.file('converted.pdf', data);
      } else {
        zip.file(filename, data as string);
      }
      // Add Google Sheets instructions as a .txt file
      if (fmt === 'sheets') {
        zip.file('GoogleSheets_Import_Instructions.txt', getSheetsImportInstructions());
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'converted-files.zip';
    link.click();
  };
  const downloadUI = (
    <div>
      <div className="font-medium mb-2">Download Converted Files</div>
      <div className="flex flex-wrap gap-4 mb-4">
        {selectedFormats.map(fmt => (
          <button key={fmt} className="bg-blue-600 text-white px-4 py-2 rounded font-semibold" onClick={() => handleDownload(fmt)} disabled={!previewData[fmt]}>
            Download {FORMAT_OPTIONS.find(f => f.key === fmt)?.label}
          </button>
        ))}
        {selectedFormats.length > 1 && (
          <button className="bg-green-600 text-white px-4 py-2 rounded font-semibold" onClick={handleDownloadZip}>
            Download All as ZIP
          </button>
        )}
      </div>
      {/* Google Sheets import instructions */}
      {selectedFormats.includes('sheets') && (
        <div className="text-xs text-blue-700 mt-2 border-l-4 border-blue-300 pl-2 bg-blue-50">
          <strong>Note:</strong> The Google Sheets output is a CSV file. {getSheetsImportInstructions()}
        </div>
      )}
      <div className="text-xs text-gray-500">If you have issues with a format, please let us know!</div>
    </div>
  );

  return (
    <div className="container-app max-w-4xl mx-auto p-4">
      {/* Stepper */}
      <div className="flex gap-2 mb-6">
        {STEPS.map((label, i) => (
          <button
            key={label}
            className={`px-3 py-1 rounded ${step === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} font-semibold text-xs`}
            onClick={() => canProceed.slice(0, i).every(Boolean) && setStep(i + 1)}
            disabled={!canProceed.slice(0, i).every(Boolean)}
            aria-current={step === i + 1}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>
      {/* Step 1: Upload */}
      {step === 1 && (
        <div>
          <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4 ${isDragActive ? 'border-blue-500' : 'border-gray-300 hover:border-accent'}`}>
            <input {...getInputProps()} />
            <span className="text-gray-500">Drag & drop .xlsx, .xls files here, or click to select (batch supported)</span>
          </div>
          {uploaded.length > 0 && (
            <div className="mb-4">
              <div className="font-medium mb-2">Uploaded Files:</div>
              <ul className="text-xs bg-gray-50 rounded p-2 max-h-48 overflow-auto">
                {uploaded.map((f, idx) => (
                  <li key={f.name + idx} className="mb-2 border-b pb-2">
                    <span className="font-mono">{f.name}</span>
                    <span className="text-gray-400 ml-2">({(f.size / 1024).toFixed(1)} KB)</span>
                    {/* TODO: Show real sheet names, metadata, preview */}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {/* Step 2: Format Selection */}
      {step === 2 && (
        <div>
          <div className="font-medium mb-2">Select Output Formats:</div>
          <div className="flex flex-wrap gap-4 mb-4">
            {FORMAT_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={`flex flex-col items-center px-4 py-3 rounded shadow ${opt.color} text-white font-semibold focus:outline-none ${selectedFormats.includes(opt.key) ? 'ring-2 ring-offset-2 ring-blue-400' : ''}`}
                onClick={() => setSelectedFormats(prev => prev.includes(opt.key) ? prev.filter(f => f !== opt.key) : [...prev, opt.key])}
                aria-pressed={selectedFormats.includes(opt.key)}
              >
                <span className="text-2xl mb-1">{opt.icon}</span>
                <span>{opt.label}</span>
                <span className="text-xs font-normal mt-1">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Step 3: Customization (per format) */}
      {step === 3 && customizationUI}
      {/* Step 4: Preview */}
      {step === 4 && previewUI}
      {/* Step 5: Download */}
      {step === 5 && downloadUI}
    </div>
  );
};

export default ExcelToFormatsConverter; 