import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import JSZip from 'jszip';
import AdSlot from '../ads/AdSlot';

interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  sheets: string[];
  preview: string[][]; // First 5 rows
}

const ExcelMergerSplitter: React.FC = () => {
  // Stepper state
  const [step, setStep] = useState(1);
  // File management
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]); // Indexes of selected files
  const [isProcessing, setIsProcessing] = useState(false);
  const [warning, setWarning] = useState('');
  // Merge config
  const [mergeStrategy, setMergeStrategy] = useState<'rows' | 'columns'>('rows');
  // Preview
  const [previewData, setPreviewData] = useState<string[][]>([]);
  // Export logic
  const [exportSuccess, setExportSuccess] = useState(false);
  // Column-based merging logic
  const [joinKey, setJoinKey] = useState('');
  const [joinKeyOptions, setJoinKeyOptions] = useState<string[]>([]);
  const [joinType, setJoinType] = useState<'left' | 'inner' | 'right' | 'outer'>('left');
  const [mergeReport, setMergeReport] = useState<string>('');
  // For sheet selection
  const [selectedSheets, setSelectedSheets] = useState<{ [fileIdx: number]: string }>({});
  // Column mapping logic
  const [columnMapping, setColumnMapping] = useState<{ [fileIdx: number]: { [fileCol: string]: string } }>({});
  const [showMappingUI, setShowMappingUI] = useState(false);

  // Dropzone for multi-format
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      '.xlsx': ['.xlsx'],
      '.xls': ['.xls'],
      '.csv': ['.csv'],
    },
    multiple: true,
    onDrop: async (acceptedFiles) => {
      setWarning('');
      const files: UploadedFile[] = [];
      for (const file of acceptedFiles) {
        let sheets: string[] = [];
        let preview: string[][] = [];
        if (file.name.endsWith('.csv')) {
          const text = await file.text();
          const parsed = Papa.parse<string[]>(text, { preview: 5 });
          preview = parsed.data as string[][];
          sheets = ['Sheet1'];
        } else {
          const buf = await file.arrayBuffer();
          const wb = XLSX.read(buf, { type: 'array' });
          sheets = wb.SheetNames;
          const ws = wb.Sheets[sheets[0]];
          preview = (XLSX.utils.sheet_to_json(ws, { header: 1 }) as (string | number | boolean | null)[][])
            .map(row => row.map(cell => cell == null ? '' : String(cell))).slice(0, 5);
        }
        files.push({
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          sheets,
          preview,
        });
      }
      setUploaded(prev => [...prev, ...files]);
      setSelectedFiles(prev => [...prev, ...files.map((_, i) => prev.length + i)]);
    },
  });

  // Remove file
  const removeFile = (idx: number) => {
    setUploaded(prev => prev.filter((_, i) => i !== idx));
    setSelectedFiles(prev => prev.filter(i => i !== idx).map(i => (i > idx ? i - 1 : i)));
  };

  // Reorder files
  const moveFile = (from: number, to: number) => {
    if (to < 0 || to >= uploaded.length) return;
    const newFiles = [...uploaded];
    const [moved] = newFiles.splice(from, 1);
    newFiles.splice(to, 0, moved);
    setUploaded(newFiles);
    setSelectedFiles(selectedFiles.map(i => (i === from ? to : i)));
  };

  // File size warning
  const fileSizeMB = uploaded.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024);
  const showSizeWarning = fileSizeMB > 10;

  // When mergeStrategy or selectedFiles change, update join key options and sheet selection
  React.useEffect(() => {
    if (mergeStrategy === 'columns' && selectedFiles.length > 0) {
      const f = uploaded[selectedFiles[0]];
      if (f) {
        let header: string[] = [];
        if (f.name.endsWith('.csv')) {
          header = f.preview[0] || [];
        } else {
          // Use selected sheet or default to first
          const sheetName = selectedSheets[selectedFiles[0]] || f.sheets[0];
          const ws = XLSX.read(f.file, { type: 'array' }).Sheets[sheetName];
          header = (XLSX.utils.sheet_to_json(ws, { header: 1 })[0] as (string | number | boolean | null)[] || []).map(cell => cell == null ? '' : String(cell));
        }
        setJoinKeyOptions(header.map(h => (h ?? '').toString()));
        setJoinKey(header[0] || '');
      }
    }
  }, [mergeStrategy, selectedFiles, uploaded, selectedSheets]);

  // Sheet selection handler
  const handleSheetChange = (fileIdx: number, sheet: string) => {
    setSelectedSheets(prev => ({ ...prev, [fileIdx]: sheet }));
  };

  // Mapping UI handler
  const handleMappingChange = (fileIdx: number, fileCol: string, unifiedCol: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [fileIdx]: { ...(prev[fileIdx] || {}), [fileCol]: unifiedCol },
    }));
  };

  // --- Row-based merging logic ---
  const mergeByRows = async () => {
    setIsProcessing(true);
    setWarning('');
    try {
      // Gather selected files
      const files = selectedFiles.map(idx => uploaded[idx]);
      // Parse all as arrays of arrays
      const allData: { header: string[]; rows: string[][]; fileName: string }[] = [];
      for (const f of files) {
        let data: string[][] = [];
        let header: string[] = [];
        if (f.name.endsWith('.csv')) {
          const text = await f.file.text();
          const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
          data = parsed.data as string[][];
        } else {
          const buf = await f.file.arrayBuffer();
          const wb = XLSX.read(buf, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        }
        if (data.length > 0) {
          header = data[0].map(h => (h ?? '').toString());
          allData.push({ header, rows: data.slice(1), fileName: f.name });
        }
      }
      // Build unified header (union of all headers, case-insensitive)
      const headerSet = new Map<string, string>();
      allData.forEach(({ header }) => {
        header.forEach(h => {
          const key = h.trim().toLowerCase();
          if (key && !headerSet.has(key)) headerSet.set(key, h);
        });
      });
      const unifiedHeader = Array.from(headerSet.values());
      // Optionally add source file column
      const addSourceCol = true; // TODO: make configurable
      if (addSourceCol) unifiedHeader.push('Source File');
      // Align and merge rows
      const mergedRows: string[][] = [];
      allData.forEach(({ header, rows, fileName }) => {
        const colMap = header.map(h => unifiedHeader.findIndex(u => u.trim().toLowerCase() === h.trim().toLowerCase()));
        rows.forEach(row => {
          const newRow = Array(unifiedHeader.length).fill('');
          colMap.forEach((idx, i) => {
            if (idx >= 0) newRow[idx] = (row[i] ?? '').toString();
          });
          if (addSourceCol) newRow[unifiedHeader.length - 1] = fileName;
          mergedRows.push(newRow);
        });
      });
      setPreviewData([unifiedHeader, ...mergedRows]);
      setStep(3);
      setMergeReport(`${mergedRows.length} rows merged successfully from ${files.length} files.`);
    } catch (e) {
      console.error("Excel merge error:", e);
      setWarning(`Error merging files by rows: ${e instanceof Error ? e.message : 'Please check file formats.'}`);
      setIsProcessing(false);
      return; // Prevent proceeding when there's an error
    }
    setIsProcessing(false);
  };

  // --- Column-based merging logic ---
  const mergeByColumns = async () => {
    setIsProcessing(true);
    setWarning('');
    setMergeReport('');
    try {
      // Gather selected files and parse data
      const files = selectedFiles.map(idx => uploaded[idx]);
      const allData: { header: string[]; rows: string[][]; fileName: string; keyIdx: number; keyMap: Map<string, string[]> }[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        let data: string[][] = [];
        let header: string[] = [];
        if (f.name.endsWith('.csv')) {
          const text = await f.file.text();
          const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
          data = parsed.data as string[][];
        } else {
          const buf = await f.file.arrayBuffer();
          const wb = XLSX.read(buf, { type: 'array' });
          const sheetName = selectedSheets[selectedFiles[i]] || f.sheets[0];
          const ws = wb.Sheets[sheetName];
          data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        }
        if (data.length > 0) {
          header = data[0].map(h => (h ?? '').toString());
          const keyIdx = header.findIndex(h => h.trim().toLowerCase() === joinKey.trim().toLowerCase());
          
          // Check if the key column was found
          if (keyIdx === -1) {
            throw new Error(`Key column "${joinKey}" not found in file "${f.name}". Available columns: ${header.join(', ')}`);
          }
          
          // Map key to row
          const keyMap = new Map<string, string[]>();
          data.slice(1).forEach(row => {
            if (keyIdx < 0 || keyIdx >= row.length) return;
            const key = (row[keyIdx] ?? '').toString();
            if (key) keyMap.set(key, row);
          });
          allData.push({ header, rows: data.slice(1), fileName: f.name, keyIdx, keyMap });
        }
      }
      if (allData.length === 0) throw new Error('No data to merge');
      // Build unified header (from mapping or all headers)
      let unifiedHeader: string[] = [];
      if (Object.keys(columnMapping).length > 0) {
        // Use mapped columns
        const mapped = new Set<string>();
        Object.values(columnMapping).forEach(map => Object.values(map).forEach(col => mapped.add(col)));
        unifiedHeader = Array.from(mapped);
      } else {
        unifiedHeader = [...allData[0].header];
        for (let i = 1; i < allData.length; i++) {
          allData[i].header.forEach(h => {
            if (!unifiedHeader.includes(h)) unifiedHeader.push(h);
          });
        }
      }
      // --- Join logic (with mapping) ---
      const allKeys = new Set<string>();
      allData.forEach(d => d.rows.forEach(row => {
        const key = (row[d.keyIdx] ?? '').toString();
        if (key) allKeys.add(key);
      }));
      let keysToInclude: Set<string>;
      if (joinType === 'left') {
        keysToInclude = new Set(Array.from(allData[0].keyMap.keys()));
      } else if (joinType === 'inner') {
        keysToInclude = new Set(Array.from(allData[0].keyMap.keys()));
        for (let i = 1; i < allData.length; i++) {
          keysToInclude = new Set([...keysToInclude].filter(k => allData[i].keyMap.has(k)));
        }
      } else if (joinType === 'right') {
        keysToInclude = new Set(Array.from(allData[allData.length - 1].keyMap.keys()));
      } else { // outer
        keysToInclude = allKeys;
      }
      const mergedRows: string[][] = [];
      let matched = 0, unmatched = 0;
      keysToInclude.forEach(key => {
        const row = Array(unifiedHeader.length).fill('');
        let hasAll = true;
        for (let i = 0; i < allData.length; i++) {
          const d = allData[i];
          const r = d.keyMap.get(key);
          if (!r) {
            hasAll = false;
            continue;
          }
          d.header.forEach((h, idx) => {
            // Use mapping if present
            const mappedCol = columnMapping[i]?.[h] || h;
            const colIdx = unifiedHeader.findIndex(u => u === mappedCol);
            if (colIdx !== -1) row[colIdx] = (r[idx] ?? '').toString();
          });
        }
        mergedRows.push(row);
        if (hasAll) matched++; else unmatched++;
      });
      setPreviewData([unifiedHeader, ...mergedRows]);
      setStep(3);
      setMergeReport(`${mergedRows.length} rows merged. ${matched} fully matched, ${unmatched} with missing data.`);
    } catch (e) {
      console.error("Excel merge error:", e);
      setWarning(`Error merging files by columns: ${e instanceof Error ? e.message : 'Please check file formats and key column.'}`);
      setIsProcessing(false);
      return; // Prevent proceeding to next step when there's an error
    }
    setIsProcessing(false);
  };

  // --- Export logic ---
  const handleExportExcel = () => {
    if (previewData.length === 0) return;
    const ws = XLSX.utils.aoa_to_sheet(previewData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Merged');
    const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged-data.xlsx';
    link.click();
    setExportSuccess(true);
  };

  const handleExportCSV = () => {
    if (previewData.length === 0) return;
    const csv = Papa.unparse(previewData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged-data.csv';
    link.click();
    setExportSuccess(true);
  };

  // Advanced export: JSON
  const handleExportJSON = () => {
    if (previewData.length === 0) return;
    const [header, ...rows] = previewData;
    const json = rows.map(row => Object.fromEntries(header.map((h, i) => [h, row[i]])));
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged-data.json';
    link.click();
    setExportSuccess(true);
  };

  // Advanced export: HTML table
  const handleExportHTML = () => {
    if (previewData.length === 0) return;
    const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Merged Data</title></head><body><table border='1'><thead><tr>${previewData[0].map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${previewData.slice(1).map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged-data.html';
    link.click();
    setExportSuccess(true);
  };

  // Advanced export: TSV
  const handleExportTSV = () => {
    if (previewData.length === 0) return;
    const tsv = previewData.map(row => row.map(cell => (cell ?? '').toString().replace(/\t/g, ' ')).join('\t')).join('\n');
    const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged-data.tsv';
    link.click();
    setExportSuccess(true);
  };

  // Advanced export: ZIP (all formats + report)
  const handleExportZIP = async () => {
    if (previewData.length === 0) return;
    const zip = new JSZip();
    // Excel
    const ws = XLSX.utils.aoa_to_sheet(previewData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Merged');
    const excelOut = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    zip.file('merged-data.xlsx', excelOut);
    // CSV
    const csv = Papa.unparse(previewData);
    zip.file('merged-data.csv', csv);
    // JSON
    const [header, ...rows] = previewData;
    const json = rows.map(row => Object.fromEntries(header.map((h, i) => [h, row[i]])));
    zip.file('merged-data.json', JSON.stringify(json, null, 2));
    // HTML
    const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Merged Data</title></head><body><table border='1'><thead><tr>${previewData[0].map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${previewData.slice(1).map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
    zip.file('merged-data.html', html);
    // TSV
    const tsv = previewData.map(row => row.map(cell => (cell ?? '').toString().replace(/\t/g, ' ')).join('\t')).join('\n');
    zip.file('merged-data.tsv', tsv);
    // Report
    const report = `Merged ${rows.length} rows, ${header.length} columns.\nExported formats: Excel, CSV, JSON, HTML, TSV.`;
    zip.file('merge-report.txt', report);
    // Generate and download
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged-data.zip';
    link.click();
    setExportSuccess(true);
  };

  // Column mapping UI (for column-based merge)
  const mappingUI = (
    <div className="mb-4 border rounded p-3 bg-gray-50">
      <div className="font-medium mb-2">Column Mapping (manual alignment)</div>
      <div className="text-xs text-gray-500 mb-2">Map columns from each file to unified output columns. Unmapped columns will be ignored. {/* TODO: Add ignore/rename/type conversion */}</div>
      <table className="text-xs w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">File</th>
            <th className="border px-2 py-1">File Column</th>
            <th className="border px-2 py-1">Map to Output Column</th>
          </tr>
        </thead>
        <tbody>
          {selectedFiles.map((idx, fileIdx) => {
            const f = uploaded[idx];
            if (!f) return null;
            const cols = f.name.endsWith('.csv') ? (f.preview[0] || []) : f.sheets[0] ? f.preview[0] || [] : [];
            return cols.map((col: string) => (
              <tr key={f.name + col}>
                <td className="border px-2 py-1 font-mono">{f.name}</td>
                <td className="border px-2 py-1">{col}</td>
                <td className="border px-2 py-1">
                  <input
                    className="border rounded px-1 py-0.5 text-xs"
                    value={columnMapping[fileIdx]?.[col] || col}
                    onChange={e => handleMappingChange(fileIdx, col, e.target.value)}
                    aria-label={`Map ${col} from ${f.name}`}
                  />
                </td>
              </tr>
            ));
          })}
        </tbody>
      </table>
      <button
        className="mt-2 bg-blue-600 text-white rounded px-4 py-1 text-xs font-semibold"
        onClick={() => setShowMappingUI(false)}
        aria-label="Done with column mapping"
      >Done</button>
    </div>
  );

  // Step 2: Merge config UI (now with join type, sheet selection, and mapping)
  const mergeConfigUI = (
    <div className="mb-4">
      <div className="font-medium mb-2">Select merge strategy:</div>
      <div className="flex gap-4 mb-2" role="radiogroup" aria-label="Merge strategy">
        <label className="flex items-center gap-2">
          <input type="radio" checked={mergeStrategy === 'rows'} onChange={() => setMergeStrategy('rows')} aria-checked={mergeStrategy === 'rows'} />
          <span>Merge by Rows (Append/Stack)</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" checked={mergeStrategy === 'columns'} onChange={() => setMergeStrategy('columns')} aria-checked={mergeStrategy === 'columns'} />
          <span>Merge by Columns (Join/Combine)</span>
        </label>
      </div>
      {mergeStrategy === 'columns' && (
        <>
          <div className="mb-2">
            <label className="font-medium text-xs mr-2">Key column for join:</label>
            <select
              className="border rounded px-2 py-1 text-xs"
              value={joinKey}
              onChange={e => setJoinKey(e.target.value)}
              aria-label="Key column for join"
            >
              {joinKeyOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="font-medium text-xs mr-2">Join type:</label>
            <select
              className="border rounded px-2 py-1 text-xs"
              value={joinType}
              onChange={e => setJoinType(e.target.value as any)}
              aria-label="Join type"
            >
              <option value="left">Left Join (default)</option>
              <option value="inner">Inner Join (only matching keys)</option>
              <option value="right">Right Join</option>
              <option value="outer">Full Outer Join</option>
            </select>
          </div>
          {/* Sheet selection for each file */}
          <div className="mb-2">
            <div className="font-medium text-xs mb-1">Sheet selection (for Excel files):</div>
            {selectedFiles.map(idx => {
              const f = uploaded[idx];
              if (!f || f.sheets.length < 2) return null;
              return (
                <div key={f.name + idx} className="mb-1">
                  <span className="text-xs font-mono">{f.name}:</span>
                  <select
                    className="border rounded px-2 py-1 text-xs ml-2"
                    value={selectedSheets[idx] || f.sheets[0]}
                    onChange={e => handleSheetChange(idx, e.target.value)}
                    aria-label={`Sheet for ${f.name}`}
                  >
                    {f.sheets.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
          {/* Column mapping UI toggle */}
          <div className="mb-2">
            <button
              className="bg-gray-200 text-gray-800 rounded px-3 py-1 text-xs font-semibold"
              onClick={() => setShowMappingUI(v => !v)}
              aria-label="Show column mapping UI"
            >
              {showMappingUI ? 'Hide Column Mapping' : 'Show Column Mapping'}
            </button>
          </div>
          {showMappingUI && mappingUI}
        </>
      )}
      <div className="text-xs text-gray-500 mb-2">Advanced options and sheet-level operations coming soon. {/* TODO: Add ignore/rename/type conversion to mapping UI */}</div>
      {mergeStrategy === 'rows' && (
        <button
          className="bg-blue-600 text-white rounded px-4 py-2 font-semibold"
          onClick={mergeByRows}
          disabled={isProcessing || selectedFiles.length < 2}
          aria-disabled={isProcessing || selectedFiles.length < 2}
        >
          {isProcessing ? 'Processing...' : 'Generate Preview'}
        </button>
      )}
      {mergeStrategy === 'columns' && (
        <button
          className="bg-blue-600 text-white rounded px-4 py-2 font-semibold"
          onClick={mergeByColumns}
          disabled={isProcessing || selectedFiles.length < 2 || !joinKey}
          aria-disabled={isProcessing || selectedFiles.length < 2 || !joinKey}
          title={!joinKey ? "Please select a key column" : ""}
        >
          {isProcessing ? 'Processing...' : 'Generate Preview'}
        </button>
      )}
    </div>
  );

  // Step 3: Preview (now with stats and merge report)
  const previewUI = (
    <div className="mb-4">
      <div className="font-medium mb-2">Merged Data Preview (first 100 rows):</div>
      <div className="mb-2 text-xs text-gray-500">
        {previewData.length > 1 && (
          <>
            {previewData[0].length} columns, {previewData.length - 1} rows, {selectedFiles.length} files merged
          </>
        )}
        {mergeReport && <div className="text-green-700 mt-1">{mergeReport}</div>}
      </div>
      <div className="overflow-auto border rounded bg-gray-50 max-h-64">
        <table className="text-xs w-full">
          <tbody>
            {previewData.slice(0, 100).map((row, i) => (
              <tr key={i}>{row.map((cell, j) => <td key={j} className="border px-2 py-1">{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Step 4: Export (now with download buttons)
  const exportUI = (
    <div className="mb-4">
      <div className="font-medium mb-2">Export Merged Data</div>
      <div className="flex flex-wrap gap-4 mb-2">
        <button className="bg-green-600 text-white rounded px-4 py-2 font-semibold" onClick={handleExportExcel} disabled={previewData.length === 0}>
          Download as Excel (.xlsx)
        </button>
        <button className="bg-blue-600 text-white rounded px-4 py-2 font-semibold" onClick={handleExportCSV} disabled={previewData.length === 0}>
          Download as CSV
        </button>
        <button className="bg-yellow-600 text-white rounded px-4 py-2 font-semibold" onClick={handleExportJSON} disabled={previewData.length === 0}>
          Download as JSON
        </button>
        <button className="bg-pink-600 text-white rounded px-4 py-2 font-semibold" onClick={handleExportHTML} disabled={previewData.length === 0}>
          Download as HTML
        </button>
        <button className="bg-purple-600 text-white rounded px-4 py-2 font-semibold" onClick={handleExportTSV} disabled={previewData.length === 0}>
          Download as TSV
        </button>
        <button className="bg-gray-800 text-white rounded px-4 py-2 font-semibold" onClick={handleExportZIP} disabled={previewData.length === 0}>
          Download ZIP (All Formats + Report)
        </button>
      </div>
      {exportSuccess && <div className="text-green-700 text-xs mt-2">Export successful! Your file has downloaded.</div>}
      <div className="text-xs text-gray-500 mt-2">All major formats supported. Merge report included in ZIP.</div>
    </div>
  );

  // Stepper navigation
  const stepLabels = ['Upload Files', 'Configure Merge', 'Preview', 'Export'];
  const canProceed = [
    uploaded.length > 0,
    selectedFiles.length > 0,
    previewData.length > 0,
    true,
  ];

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
          <h1 className="text-2xl font-bold mb-4">Excel Merger & Combiner</h1>
          <div className="mb-4 text-sm text-yellow-700 bg-yellow-100 rounded p-2">
            <b>Warnings:</b><br />
            - Large files (&gt;10MB) may be slow or fail to process in your browser.<br />
            - Only sheet data is merged/exported. Advanced Excel features (macros, formulas, charts, formatting) may not be preserved.<br />
            - All processing is done in your browser. Your files never leave your device.<br />
          </div>
          {/* Stepper */}
          <div className="flex gap-2 mb-6">
            {stepLabels.map((label, i) => (
              <button
                key={label}
                className={`px-3 py-1 rounded ${step === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} font-semibold text-xs`}
                onClick={() => canProceed.slice(0, i).every(Boolean) && setStep(i + 1)}
                disabled={!canProceed.slice(0, i).every(Boolean)}
              >
                {i + 1}. {label}
              </button>
            ))}
          </div>
          {/* Step 1: Upload */}
          {step === 1 && (
            <>
              <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors mb-4">
                <input {...getInputProps()} />
                <span className="text-gray-500">Drag & drop .xlsx, .xls, .csv files here, or click to select (batch supported)</span>
              </div>
              {showSizeWarning && <div className="text-red-600 text-xs mb-2">Warning: Total file size is large ({fileSizeMB.toFixed(1)} MB). Processing may be slow or fail.</div>}
              {uploaded.length > 0 && (
                <div className="mb-4">
                  <div className="font-medium mb-2">Uploaded Files:</div>
                  <ul className="text-xs bg-gray-50 dark:bg-primary rounded p-2 max-h-48 overflow-auto">
                    {uploaded.map((f, idx) => (
                      <li key={f.name + idx} className="flex items-center gap-2 mb-2 border-b pb-2">
                        <input type="checkbox" checked={selectedFiles.includes(idx)} onChange={() => setSelectedFiles(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])} />
                        <span className="font-mono">{f.name}</span>
                        <span className="text-gray-400">({(f.size / 1024).toFixed(1)} KB)</span>
                        <span className="text-gray-400">{f.sheets.length} sheet{f.sheets.length > 1 ? 's' : ''}</span>
                        <button className="text-red-600 text-xs" onClick={() => removeFile(idx)}>Remove</button>
                        <button className="text-xs text-blue-600" onClick={() => moveFile(idx, idx - 1)} disabled={idx === 0}>↑</button>
                        <button className="text-xs text-blue-600" onClick={() => moveFile(idx, idx + 1)} disabled={idx === uploaded.length - 1}>↓</button>
                        <div className="ml-2">
                          <table className="border text-[10px]">
                            <tbody>
                              {f.preview.map((row, i) => (
                                <tr key={i}>{row.map((cell, j) => <td key={j} className="border px-1 py-0.5">{cell}</td>)}</tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          {/* Step 2: Merge Config */}
          {step === 2 && mergeConfigUI}
          {/* Step 3: Preview */}
          {step === 3 && previewUI}
          {/* Step 4: Export */}
          {step === 4 && exportUI}
          {warning && <div className="text-red-600 text-xs mb-2">{warning}</div>}
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