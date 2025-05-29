import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import JSZip from 'jszip';

// Utility: Text transforms
const transforms = {
  uppercase: (v: string) => v.toUpperCase(),
  lowercase: (v: string) => v.toLowerCase(),
  title: (v: string) => v.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()),
};

// Pre-built templates
const templateLibrary = [
  {
    name: 'Business Letter',
    content: `Dear {{Name}},\n\nThank you for your interest in {{Company}}. We are pleased to confirm your {{Position}} role.\n\nYour start date: {{StartDate}}\nYour manager: {{Manager}}\nYour email: {{Email}}\n\nWelcome to the team!\n\nBest regards,\nHR Department`,
  },
  {
    name: 'Event Invitation',
    content: `Dear {{Name}},\n\nYou're invited to {{EventName}}!\n\nDate: {{Date}}\nTime: {{Time}}\nLocation: {{Location}}\nRSVP: {{RSVPEmail}}\n\nWe look forward to seeing you there!\n\nBest regards,\n{{OrganizerName}}`,
  },
  {
    name: 'Invoice Template',
    content: 'INVOICE\n\nBill To: {{CustomerName}}\nCompany: {{CustomerCompany}}\nEmail: {{CustomerEmail}}\n\nInvoice #: {{InvoiceNumber}}\nDate: {{Date}}\nAmount: ${{Amount}}\nDue Date: {{DueDate}}\n\nDescription: {{Description}}\n\nThank you for your business!',
  },
];

// Utility: Apply template to a row
function applyTemplate(template: string, row: Record<string, string>) {
  return template.replace(/{{(\w+)(\|\w+)?}}/g, (_unused, col, transform) => {
    let value = row[col] || '';
    if (transform) {
      const fn = transforms[transform.slice(1) as keyof typeof transforms];
      if (fn) value = fn(value);
    }
    return value;
  });
}

const MailMergeTool: React.FC = () => {
  // State
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [csvStats, setCsvStats] = useState<{ rows: number; columns: number; delimiter: string }>({ rows: 0, columns: 0, delimiter: ',' });
  const [csvError, setCsvError] = useState<string | null>(null);
  const [template, setTemplate] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('');
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [mergeResults, setMergeResults] = useState<string[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CSV Upload & Parse
  const handleFile = (file: File) => {
    setCsvError(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (!results.data || !Array.isArray(results.data)) {
          setCsvError('Failed to parse CSV.');
          return;
        }
        const data = results.data as Record<string, string>[];
        if (data.length === 0) {
          setCsvError('CSV contains no data.');
          return;
        }
        setCsvData(data);
        setHeaders(Object.keys(data[0]));
        setCsvStats({
          rows: data.length,
          columns: Object.keys(data[0]).length,
          delimiter: results.meta.delimiter || ',',
        });
        setShowToast('CSV uploaded successfully!');
      },
      error: (err) => setCsvError('CSV parse error: ' + err.message),
    });
  };

  // Template Save/Load
  const saveTemplate = () => {
    localStorage.setItem('mailmerge_template', template);
    setShowToast('Template saved!');
  };
  const loadTemplate = () => {
    const t = localStorage.getItem('mailmerge_template');
    if (t) setTemplate(t);
    setShowToast('Template loaded!');
  };

  // Merge
  const handleMerge = () => {
    if (!template || headers.length === 0) return;
    setIsMerging(true);
    setTimeout(() => {
      const results = csvData.map(row => applyTemplate(template, row));
      setMergeResults(results);
      setPreviewIndex(0);
      setIsMerging(false);
      setShowToast('Mail merge complete!');
    }, 100);
  };

  // Download single
  const downloadSingle = () => {
    if (!mergeResults.length) return;
    const blob = new Blob([mergeResults[previewIndex]], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `document_${previewIndex + 1}.txt`;
    a.click();
  };

  // Download all as ZIP
  const downloadAll = async () => {
    if (!mergeResults.length) return;
    const zip = new JSZip();
    mergeResults.forEach((content, i) => {
      zip.file(`document_${i + 1}.txt`, content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mailmerge_documents.zip';
    a.click();
  };

  // Placeholder validation
  const unmatchedPlaceholders = template.match(/{{(\w+)}}/g)?.filter(ph => !headers.includes(ph.replace(/[{}]/g, '')));

  // Toast auto-hide
  React.useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  // UI
  return (
    <div className="flex flex-col gap-8">
      {/* Step 1: CSV Upload */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-2">Step 1: Upload CSV Data</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <button className="dropzone border-2 border-dashed border-blue-400 rounded-lg px-6 py-4 bg-blue-50 hover:bg-blue-100 transition" onClick={() => fileInputRef.current?.click()}>
            <span className="font-semibold">Click or drag a CSV file here</span>
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files && handleFile(e.target.files[0])} />
          {csvError && <span className="text-red-600 ml-4">{csvError}</span>}
        </div>
        {csvData.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">{csvStats.rows} records, {csvStats.columns} columns (Delimiter: <b>{csvStats.delimiter}</b>)</div>
            <table className="w-full text-xs border">
              <thead><tr>{headers.map(h => <th key={h} className="border px-2 py-1 bg-gray-100">{h}</th>)}</tr></thead>
              <tbody>
                {csvData.slice(0, 3).map((row, i) => (
                  <tr key={i}>{headers.map(h => <td key={h} className="border px-2 py-1">{row[h]}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Step 2: Template Editor */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-2">Step 2: Edit Template</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <textarea
            className="w-full min-h-[180px] border rounded p-2 font-mono text-sm"
            placeholder="Type your template here using {{ColumnName}} placeholders..."
            value={template}
            onChange={e => setTemplate(e.target.value)}
          />
          <div className="flex flex-col gap-2 min-w-[220px]">
            <label className="font-semibold">Pre-built Templates</label>
            <select className="border rounded p-1" value={templateName} onChange={e => {
              const t = templateLibrary.find(t => t.name === e.target.value);
              setTemplateName(e.target.value);
              if (t) setTemplate(t.content);
            }}>
              <option value="">Select a template...</option>
              {templateLibrary.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
            </select>
            <button className="mt-2 bg-blue-600 text-white rounded px-3 py-1" onClick={saveTemplate}>Save Template</button>
            <button className="bg-gray-300 text-gray-800 rounded px-3 py-1" onClick={loadTemplate}>Load Saved</button>
            <div className="text-xs text-gray-500 mt-2">Placeholders: <code>{headers.map(h => `{{${h}}}`).join(', ')}</code></div>
            {unmatchedPlaceholders && unmatchedPlaceholders.length > 0 && (
              <div className="text-xs text-red-600 mt-2">Unmatched: {unmatchedPlaceholders.join(', ')}</div>
            )}
            <div className="text-xs text-gray-400 mt-2">{template.length} characters</div>
          </div>
        </div>
      </section>

      {/* Step 3: Preview & Generate */}
      <section className="card p-6">
        <h2 className="text-xl font-bold mb-2">Step 3: Preview & Generate</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <button className="bg-green-600 text-white rounded px-4 py-2 font-semibold" onClick={handleMerge} disabled={!template || headers.length === 0 || isMerging}>
            {isMerging ? 'Merging...' : 'Generate Documents'}
          </button>
          {mergeResults.length > 0 && (
            <>
              <button className="bg-blue-600 text-white rounded px-3 py-1" onClick={downloadSingle}>Download Current</button>
              <button className="bg-blue-700 text-white rounded px-3 py-1" onClick={downloadAll}>Download All as ZIP</button>
              <span className="text-xs text-gray-500 ml-2">{mergeResults.length} documents generated</span>
            </>
          )}
        </div>
        {mergeResults.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <button className="px-2 py-1 rounded bg-gray-200" onClick={() => setPreviewIndex(i => Math.max(0, i - 1))} disabled={previewIndex === 0}>Prev</button>
              <span className="text-xs">{previewIndex + 1} / {mergeResults.length}</span>
              <button className="px-2 py-1 rounded bg-gray-200" onClick={() => setPreviewIndex(i => Math.min(mergeResults.length - 1, i + 1))} disabled={previewIndex === mergeResults.length - 1}>Next</button>
            </div>
            <pre className="bg-gray-100 rounded p-3 text-xs overflow-x-auto max-h-64">{mergeResults[previewIndex]}</pre>
          </div>
        )}
      </section>

      {/* Toast */}
      {showToast && <div className="toast fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow">{showToast}</div>}
    </div>
  );
};

export default MailMergeTool; 