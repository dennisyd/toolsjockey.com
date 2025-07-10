import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
// Drag-and-drop imports removed

// Utility: Count columns in a CSV row
const countColumns = (row: string[] | undefined) => (row ? row.length : 0);

const CSVToolMerger = () => {
  // State
  const [files, setFiles] = useState<File[]>([]);
  const [fileStats, setFileStats] = useState<{ rows: number; cols: number; headers: string[] }[]>([]);
  const [mergeMode, setMergeMode] = useState<'rows' | 'columns'>('rows');
  const [treatFirstRowAsHeader, setTreatFirstRowAsHeader] = useState(true);
  const [mergedCSV, setMergedCSV] = useState<string>('');
  const [mergedXLSX, setMergedXLSX] = useState<Blob | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [headerMismatch, setHeaderMismatch] = useState(false);

  // File upload logic (batch)
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    multiple: true,
    onDrop: async (acceptedFiles) => {
      // Append new files, avoid duplicates by name
      const newFiles = [...files, ...acceptedFiles.filter(f => !files.some(existing => existing.name === f.name))];
      setFiles(newFiles);
      setMergedCSV('');
      setMergedXLSX(null);
      setPreviewRows([]);
      setError(null);
      // Parse for stats
      const stats: { rows: number; cols: number; headers: string[] }[] = [];
      let headersRef: string[] | null = null;
      let mismatch = false;
      for (const file of newFiles) {
        const text = await file.text();
        const parsed = Papa.parse<string[]>(text, { header: false });
        const rows = parsed.data as string[][];
        const headers = treatFirstRowAsHeader && rows.length ? rows[0] : [];
        if (headersRef && treatFirstRowAsHeader && headers.join() !== headersRef.join()) mismatch = true;
        if (!headersRef && treatFirstRowAsHeader) headersRef = headers;
        stats.push({ rows: rows.length, cols: countColumns(rows[0]), headers });
      }
      setFileStats(stats);
      setHeaderMismatch(mismatch);
    }
  });

  // Remove a file
  const removeFile = (idx: number) => {
    const newFiles = files.slice();
    newFiles.splice(idx, 1);
    setFiles(newFiles);
    setFileStats(fileStats.filter((_, i) => i !== idx));
    setMergedCSV('');
    setMergedXLSX(null);
    setPreviewRows([]);
    setError(null);
  };

  // Merge logic (unchanged)
  const handleMerge = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      // Parse all files
      const allData: { data: string[][], headers: string[] }[] = [];
      for (const file of files) {
        const text = await file.text();
        const parsed = Papa.parse<string[]>(text, { header: false });
        if (parsed.errors.length) throw new Error(parsed.errors[0].message);
        const rows = parsed.data as string[][];
        const headers = treatFirstRowAsHeader && rows.length ? rows[0] : [];
        allData.push({ data: rows, headers });
      }
      let merged: string[][] = [];
      if (mergeMode === 'rows') {
        // Merge by appending rows, using header from first file
        merged = treatFirstRowAsHeader ? [allData[0].headers] : [];
        for (const { data } of allData) {
          merged.push(...data.slice(treatFirstRowAsHeader ? 1 : 0));
        }
      } else {
        // Merge by columns (by header)
        // Find all unique headers
        const allHeaders = Array.from(new Set(allData.flatMap(f => f.headers)));
        // Build row map by index
        const maxRows = Math.max(...allData.map(f => f.data.length));
        merged = [allHeaders];
        for (let i = 1; i < maxRows; i++) {
          const row: string[] = [];
          for (const header of allHeaders) {
            let found = '';
            for (const file of allData) {
              const colIdx = file.headers.indexOf(header);
              if (colIdx !== -1 && file.data[i] && file.data[i][colIdx] !== undefined) {
                found = file.data[i][colIdx];
                break;
              }
            }
            row.push(found);
          }
          merged.push(row);
        }
      }
      setMergedCSV(Papa.unparse(merged));
      setPreviewRows(merged.slice(0, 10));
      // Excel export
      const ws = XLSX.utils.aoa_to_sheet(merged);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Merged');
      const xlsxBlob = new Blob([XLSX.write(wb, { type: 'array', bookType: 'xlsx' })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      setMergedXLSX(xlsxBlob);
    } catch (e: any) {
      setError(e.message || 'Failed to merge CSVs.');
    }
    setIsProcessing(false);
  };

  // Download merged CSV
  const handleDownloadCSV = () => {
    const blob = new Blob([mergedCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download merged Excel
  const handleDownloadXLSX = () => {
    if (!mergedXLSX) return;
    const url = URL.createObjectURL(mergedXLSX);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Merge summary
  const summary = files.length > 0 ? {
    files: files.length,
    totalRows: fileStats.reduce((sum, f) => sum + f.rows, 0),
    totalCols: Math.max(...fileStats.map(f => f.cols)),
  } : null;

  return (
    <div className="flex flex-col gap-6">
      {/* File upload and management */}
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors">
        <input {...getInputProps()} />
        {files.length === 0 ? (
          <div>
            <p className="font-semibold">Drag & drop CSV files here, or click to select (batch supported)</p>
            <p className="text-sm text-gray-500 mt-1">Supported: CSV</p>
          </div>
        ) : (
          <div>
            <p className="mb-2">Uploaded files (click X to remove):</p>
            <ul className="flex flex-col gap-2">
              {files.map((file, idx) => (
                <li key={file.name + idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded px-3 py-2">
                  <span className="font-mono text-xs">{file.name}</span>
                  <button onClick={e => { e.stopPropagation(); removeFile(idx); }} className="ml-auto text-red-500 hover:text-red-700">✕</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Merge options */}
      {files.length > 1 && (
        <div className="flex flex-wrap gap-4 items-center">
          <label className="flex items-center gap-2">
            <input type="radio" checked={mergeMode === 'rows'} onChange={() => setMergeMode('rows')} /> Merge by rows
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={mergeMode === 'columns'} onChange={() => setMergeMode('columns')} /> Merge by columns
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={treatFirstRowAsHeader} onChange={() => setTreatFirstRowAsHeader(v => !v)} /> Treat first row as header
          </label>
          <button onClick={handleMerge} className="btn btn-accent" disabled={isProcessing}>{isProcessing ? 'Merging...' : 'Merge Files'}</button>
        </div>
      )}

      {/* Error message */}
      {error && <div className="text-red-600 font-semibold">{error}</div>}
      {/* Header mismatch warning */}
      {headerMismatch && <div className="text-yellow-600 font-semibold">Warning: Header mismatch detected between files.</div>}

      {/* Preview and download */}
      {mergedCSV && (
        <div className="bg-slate-100 dark:bg-slate-900 rounded p-4 mt-4">
          <div className="flex gap-4 mb-2">
            <button onClick={handleDownloadCSV} className="btn btn-primary">Download CSV</button>
            <button onClick={handleDownloadXLSX} className="btn btn-secondary">Download Excel</button>
          </div>
          <div className="overflow-x-auto">
            <table className="table-auto text-xs">
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => <td key={j} className="border px-2 py-1">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-gray-500 mt-2">Previewing first 10 rows of merged file.</div>
        </div>
      )}

      {/* File summary */}
      {summary && (
        <div className="text-xs text-gray-500 mt-2">
          {summary.files} files loaded, {summary.totalRows} total rows, {summary.totalCols} columns (max)
        </div>
      )}
    </div>
  );
};

export default CSVToolMerger; 