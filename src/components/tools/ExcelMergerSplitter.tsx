import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import AdSlot from '../ads/AdSlot';

interface SheetInfo {
  fileIdx: number;
  fileName: string;
  sheetName: string;
}

const ExcelMergerSplitter: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [sheetInfos, setSheetInfos] = useState<SheetInfo[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [warning, setWarning] = useState('');

  const { getRootProps, getInputProps } = useDropzone({
    accept: { '.xlsx': ['.xlsx'] },
    multiple: true,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
      setSelected(new Set());
      setWarning('');
      // Parse sheet names
      Promise.all(acceptedFiles.map(f => f.arrayBuffer().then(buf => XLSX.read(buf, { type: 'array' })))).then(wbs => {
        const infos: SheetInfo[] = [];
        wbs.forEach((wb, fileIdx) => {
          wb.SheetNames.forEach(sheetName => {
            infos.push({ fileIdx, fileName: acceptedFiles[fileIdx].name, sheetName });
          });
        });
        setSheetInfos(infos);
      });
    },
  });

  // Warnings
  const fileSizeMB = files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);
  const showSizeWarning = fileSizeMB > 10;

  // Selection helpers
  const keyFor = (info: SheetInfo) => `${info.fileIdx}|${info.sheetName}`;
  const toggleSelect = (info: SheetInfo) => {
    const key = keyFor(info);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const selectedInfos = sheetInfos.filter(info => selected.has(keyFor(info)));

  // Merge selected sheets (append rows)
  const handleMerge = async () => {
    setIsProcessing(true);
    setWarning('');
    try {
      const allRows: any[] = [];
      let header: string[] | null = null;
      for (const info of selectedInfos) {
        const file = files[info.fileIdx];
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const ws = wb.Sheets[info.sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (!header) header = rows[0] as string[];
        allRows.push(...rows.slice(1));
      }
      const merged = [header, ...allRows];
      const ws = XLSX.utils.aoa_to_sheet(merged);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Merged');
      const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
      const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged-sheets.xlsx';
      link.click();
    } catch (e) {
      setWarning('Error merging sheets.');
    }
    setIsProcessing(false);
  };

  // Export selected sheets as separate files (ZIP)
  const handleExportSeparate = async () => {
    setIsProcessing(true);
    setWarning('');
    try {
      const zip = new JSZip();
      for (const info of selectedInfos) {
        const file = files[info.fileIdx];
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const ws = wb.Sheets[info.sheetName];
        const newWb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWb, ws, info.sheetName);
        const out = XLSX.write(newWb, { type: 'array', bookType: 'xlsx' });
        zip.file(`${info.fileName.replace(/\.xlsx$/, '')}-${info.sheetName}.xlsx`, out);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sheets.zip';
      link.click();
    } catch (e) {
      setWarning('Error exporting sheets.');
    }
    setIsProcessing(false);
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
          <h1 className="text-2xl font-bold mb-4">Excel Merger & Splitter</h1>
          <div className="mb-4 text-sm text-yellow-700 bg-yellow-100 rounded p-2">
            <b>Warnings:</b><br />
            - Large Excel files (&gt;10MB) may be slow or fail to process in your browser.<br />
            - Only sheet data is merged/exported. Advanced Excel features (macros, formulas, charts, formatting) may not be preserved.<br />
            - All processing is done in your browser. Your files never leave your device.<br />
          </div>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors mb-4">
            <input {...getInputProps()} />
            <span className="text-gray-500">Drag & drop .xlsx files here, or click to select (batch supported)</span>
          </div>
          {showSizeWarning && <div className="text-red-600 text-xs mb-2">Warning: Total file size is large ({fileSizeMB.toFixed(1)} MB). Processing may be slow or fail.</div>}
          {sheetInfos.length > 0 && (
            <div className="mb-4">
              <div className="font-medium mb-2">Select sheets to merge or export:</div>
              <ul className="text-xs bg-gray-50 dark:bg-primary rounded p-2 max-h-48 overflow-auto">
                {sheetInfos.map(info => (
                  <li key={keyFor(info)}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selected.has(keyFor(info))} onChange={() => toggleSelect(info)} />
                      <span className="font-mono">[{info.fileName}]</span> <span>{info.sheetName}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {warning && <div className="text-red-600 text-xs mb-2">{warning}</div>}
          <div className="flex gap-2 mb-2">
            <button className="btn btn-primary" onClick={handleMerge} disabled={isProcessing || selectedInfos.length === 0}>Merge Selected Sheets</button>
            <button className="btn btn-secondary" onClick={handleExportSeparate} disabled={isProcessing || selectedInfos.length === 0}>Export Selected as Separate Files</button>
          </div>
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

export default ExcelMergerSplitter; 