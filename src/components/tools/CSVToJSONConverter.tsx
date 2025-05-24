import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import AdSlot from '../ads/AdSlot';

function parseCSV(csv: string): any[] {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
}

const CSVToJSONConverter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [json, setJson] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { '.csv': ['.csv'] },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      setError('');
      setJson('');
      setFile(null);
      const csvFile = acceptedFiles[0];
      if (!csvFile || !csvFile.name.endsWith('.csv')) {
        setError('Only .csv files are supported.');
        return;
      }
      setFile(csvFile);
      setIsProcessing(true);
      try {
        const text = await csvFile.text();
        const data = parseCSV(text);
        setJson(JSON.stringify(data, null, 2));
      } catch (e: any) {
        setError('Failed to parse CSV. ' + (e.message || ''));
      }
      setIsProcessing(false);
    },
  });

  const handleDownload = () => {
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (file?.name.replace(/\.csv$/, '') || 'data') + '.json';
    link.click();
  };

  return (
    <div className="container-app grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Header Ad */}
      <div className="md:col-span-12">
        <AdSlot slot="header" className="mb-4" />
      </div>
      {/* Sidebar Ad */}
      <div className="hidden md:block md:col-span-3">
        <AdSlot slot="sidebar" className="sticky top-6" />
      </div>
      {/* Main Content */}
      <div className="md:col-span-6">
        <div className="bg-white dark:bg-primary-light rounded-lg p-6 shadow-md mb-6">
          <h1 className="text-2xl font-bold mb-4">CSV to JSON Converter</h1>
          <div className="mb-4 text-sm text-yellow-700 bg-yellow-100 rounded p-2">
            <b>Instructions:</b><br />
            - Only <b>.csv</b> files are supported.<br />
            - All processing is done in your browser. Your files never leave your device.<br />
          </div>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors mb-4">
            <input {...getInputProps()} />
            <span className="text-gray-500">Drag & drop a .csv file here, or click to select</span>
          </div>
          {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
          {isProcessing && <div className="text-accent text-sm mb-2">Converting...</div>}
          {json && (
            <>
              <div className="mb-2 flex justify-between items-center">
                <span className="font-medium">JSON Preview</span>
                <button className="btn btn-primary btn-sm" onClick={handleDownload}>Download .json</button>
              </div>
              <pre className="bg-gray-100 dark:bg-primary rounded p-3 text-xs overflow-auto max-h-96 whitespace-pre-wrap border border-gray-200 dark:border-gray-700 mb-2">
                {json}
              </pre>
            </>
          )}
        </div>
        {/* Between tools ad */}
        <AdSlot slot="native" className="my-6" />
      </div>
      {/* Sidebar Ad (mobile) */}
      <div className="md:hidden col-span-12">
        <AdSlot slot="mobile" />
      </div>
      {/* Footer Ad */}
      <div className="md:col-span-12">
        <AdSlot slot="footer" className="mt-4" />
      </div>
    </div>
  );
};

export default CSVToJSONConverter; 