import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Utility: Count columns in a CSV row
const countColumns = (row: string[] | undefined) => (row ? row.length : 0);

const CSVToolMerger = () => {
  
  // State
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [fileStats, setFileStats] = useState<{ rows: number; cols: number; headers: string[] }[]>([]);
  const [mergeMode, setMergeMode] = useState<'rows' | 'columns'>('rows');
  const [treatFirstRowAsHeader, setTreatFirstRowAsHeader] = useState(true);
  const [mergedCSV, setMergedCSV] = useState<string>('');
  const [mergedXLSX, setMergedXLSX] = useState<Blob | null>(null);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [tab, setTab] = useState<'preview' | 'headers' | 'details'>('preview');
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
      setFileNames(newFiles.map(f => f.name));
      setMergedCSV('');
      setMergedXLSX(null);
      setPreviewRows([]);
      setError(null);
      setTab('preview');
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
    setFileNames(newFiles.map(f => f.name));
    setFileStats(fileStats.filter((_, i) => i !== idx));
    setMergedCSV('');
    setMergedXLSX(null);
    setPreviewRows([]);
    setError(null);
  };

  // Drag-and-drop reordering
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const reorder = (arr: any[]) => {
      const [removed] = arr.splice(result.source.index, 1);
      arr.splice(result.destination.index, 0, removed);
    };
    const newFiles = files.slice();
    const newNames = fileNames.slice();
    const newStats = fileStats.slice();
    reorder(newFiles);
    reorder(newNames);
    reorder(newStats);
    setFiles(newFiles);
    setFileNames(newNames);
    setFileStats(newStats);
  };

  // Merge logic
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
            <p className="mb-2">Uploaded files (drag to reorder, click X to remove):</p>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="csv-files">
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-2">
                    {files.map((file, idx) => (
                      <Draggable key={file.name + idx} draggableId={file.name + idx} index={idx}>
                        {(prov) => (
                          <li ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded px-3 py-2">
                            <span className="font-mono text-xs">{file.name}</span>
                            <span className="text-xs text-gray-500">({fileStats[idx]?.rows ?? '?'} rows, {fileStats[idx]?.cols ?? '?'} cols)</span>
                            <button className="ml-auto text-red-500 hover:text-red-700" onClick={() => removeFile(idx)} title="Remove">✕</button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}
      </div>
      {/* Merge options and warnings */}
      {files.length > 1 && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-4 items-center">
            <label className="font-semibold">Merge mode:</label>
            <select value={mergeMode} onChange={e => setMergeMode(e.target.value as any)} className="p-2 border rounded" title="Choose how to merge: Append Rows stacks all rows, Merge by Columns combines columns by header.">
              <option value="rows">Append Rows (default)</option>
              <option value="columns">Merge by Columns (by header)</option>
            </select>
            <span className="text-xs text-gray-500" title="If enabled, the first row of each file is treated as a header.">
              <input type="checkbox" checked={treatFirstRowAsHeader} onChange={e => setTreatFirstRowAsHeader(e.target.checked)} className="mr-1" />
              Treat first row as header
            </span>
            <button className="btn btn-primary" onClick={handleMerge} disabled={isProcessing} title="Merge the uploaded CSV files">
              {isProcessing ? 'Merging...' : 'Merge CSVs'}
            </button>
          </div>
          {headerMismatch && treatFirstRowAsHeader && (
            <div className="text-yellow-700 bg-yellow-100 rounded p-2 text-xs">
              Warning: Not all files have matching headers. Merging may result in missing or misaligned columns.
            </div>
          )}
        </div>
      )}
      {/* Merge summary */}
      {summary && (
        <div className="text-xs text-gray-600 dark:text-gray-300">
          <b>Summary:</b> {summary.files} file(s), {summary.totalRows} total rows, {summary.totalCols} columns
        </div>
      )}
      {/* Error */}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {/* Tabbed preview */}
      {mergedCSV && previewRows.length > 0 && (
        <div className="mt-6">
          <div className="flex gap-4 mb-2">
            <button className={`btn btn-secondary ${tab === 'preview' ? 'btn-active' : ''}`} onClick={() => setTab('preview')}>Merged Preview</button>
            <button className={`btn btn-secondary ${tab === 'headers' ? 'btn-active' : ''}`} onClick={() => setTab('headers')}>Headers Only</button>
            <button className={`btn btn-secondary ${tab === 'details' ? 'btn-active' : ''}`} onClick={() => setTab('details')}>File Details</button>
            <button className="btn btn-primary ml-auto" onClick={handleDownloadCSV}>Download CSV</button>
            <button className="btn btn-primary" onClick={handleDownloadXLSX}>Download Excel</button>
          </div>
          {tab === 'preview' && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border">
                <thead>
                  <tr>
                    {previewRows[0].map((h, i) => <th key={i} className="border px-2 py-1 bg-slate-100 dark:bg-slate-700">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(1).map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => <td key={j} className="border px-2 py-1">{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'headers' && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border">
                <thead>
                  <tr>
                    {previewRows[0].map((h, i) => <th key={i} className="border px-2 py-1 bg-slate-100 dark:bg-slate-700">{h}</th>)}
                  </tr>
                </thead>
              </table>
            </div>
          )}
          {tab === 'details' && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs border">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">File Name</th>
                    <th className="border px-2 py-1">Rows</th>
                    <th className="border px-2 py-1">Columns</th>
                  </tr>
                </thead>
                <tbody>
                  {fileNames.map((name, i) => (
                    <tr key={name}>
                      <td className="border px-2 py-1">{name}</td>
                      <td className="border px-2 py-1">{fileStats[i]?.rows ?? '?'}</td>
                      <td className="border px-2 py-1">{fileStats[i]?.cols ?? '?'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CSVToolMerger; 