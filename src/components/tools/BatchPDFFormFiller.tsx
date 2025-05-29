import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import JSZip from 'jszip';

// Helper to get field type name and possible values
function getFieldTypeAndOptions(field: any) {
  const ctor = field?.constructor?.name;
  let type = 'Unknown';
  let options: string[] = [];
  if (!ctor) return { type, options };
  if (ctor.includes('Text')) type = 'Text';
  else if (ctor.includes('CheckBox')) type = 'Checkbox';
  else if (ctor.includes('Radio')) {
    type = 'Radio';
    if (typeof field.getOptions === 'function') {
      options = field.getOptions();
    }
  }
  else if (ctor.includes('Dropdown') || ctor.includes('ComboBox')) {
    type = 'Dropdown';
    if (typeof field.getOptions === 'function') {
      options = field.getOptions();
    }
  }
  else if (ctor.includes('Button')) type = 'Button';
  return { type, options };
}

const BatchPDFFormFiller: React.FC = () => {
  // PDF upload and field extraction
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fieldNames, setFieldNames] = useState<string[]>([]);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isFillable, setIsFillable] = useState<boolean | null>(null);
  const [fieldDetails, setFieldDetails] = useState<{ name: string; type: string; options?: string[] }[]>([]);
  const [xfaWarning, setXfaWarning] = useState<string | null>(null);

  // Data upload
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [dataRows, setDataRows] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [columnNames, setColumnNames] = useState<string[]>([]);

  // Processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Refs for file inputs
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const dataInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Upload PDF and extract fields
  const handlePDFUpload = async (file: File) => {
    setPdfError(null);
    setIsFillable(null);
    setFieldNames([]);
    setFieldDetails([]);
    setXfaWarning(null);
    setPdfFile(file);
    setZipUrl(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      setPdfBytes(bytes);
      const pdfDoc = await PDFDocument.load(bytes);
      // XFA detection (look for /XFA in the catalog)
      const catalog = (pdfDoc as any).context.lookup(pdfDoc.catalog);
      if (catalog && catalog.get('XFA')) {
        setXfaWarning('Warning: This PDF uses XFA forms (Adobe LiveCycle). These are not supported by this tool.');
      }
      const form = pdfDoc.getForm();
      // Try to extract field names, types, and options
      let fields: string[] = [];
      let details: { name: string; type: string; options?: string[] }[] = [];
      try {
        const pdfFields = form.getFields();
        fields = pdfFields.map(f => f.getName());
        details = pdfFields.map(f => {
          const { type, options } = getFieldTypeAndOptions(f);
          return { name: f.getName(), type, options };
        });
      } catch {
        fields = [];
        details = [];
      }
      setFieldNames(fields);
      setFieldDetails(details);
      setIsFillable(fields.length > 0);
      if (fields.length === 0) setPdfError('No fillable fields found. This PDF may be scanned or non-interactive.');
    } catch (e: any) {
      setPdfError('Failed to parse PDF.');
      setIsFillable(false);
    }
  };

  // Export field names as CSV or Excel
  const exportTemplate = (type: 'csv' | 'xlsx') => {
    if (fieldNames.length === 0) return;
    if (type === 'csv') {
      const csv = Papa.unparse([fieldNames]);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pdf-fields-template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const ws = XLSX.utils.aoa_to_sheet([fieldNames]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      const xlsxBlob = new Blob([XLSX.write(wb, { type: 'array', bookType: 'xlsx' })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(xlsxBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pdf-fields-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Step 2: Upload CSV or Excel and parse
  const handleDataUpload = async (file: File) => {
    setDataError(null);
    setDataFile(file);
    setZipUrl(null);
    try {
      let rows: any[] = [];
      let columns: string[] = [];
      if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const parsed = Papa.parse(text, { header: true });
        if (parsed.errors.length) throw new Error(parsed.errors[0].message);
        rows = parsed.data as any[];
        columns = parsed.meta.fields || [];
      } else {
        const data = await file.arrayBuffer();
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        columns = Object.keys(rows[0] || {});
      }
      setDataRows(rows);
      setColumnNames(columns);
      // Validate columns
      if (fieldNames.length > 0) {
        const missing = fieldNames.filter(f => !columns.includes(f));
        if (missing.length > 0) {
          setValidationWarning(`Warning: The following PDF fields are missing in your data: ${missing.join(', ')}`);
        } else {
          setValidationWarning(null);
        }
      }
    } catch (e: any) {
      setDataError('Failed to parse data file.');
    }
  };

  // Step 3: Fill PDFs and create ZIP
  const handleFillAndZip = async () => {
    if (!pdfBytes || !dataRows.length) return;
    setIsProcessing(true);
    setProgress(0);
    setZipUrl(null);
    const zip = new JSZip();
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      try {
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        for (const detail of fieldDetails) {
          const field = detail.name;
          const value = row[field];
          try {
            if (detail.type === 'Text') {
              form.getTextField(field).setText(value !== undefined ? String(value) : '');
            } else if (detail.type === 'Checkbox') {
              const normalized = String(value).trim().toLowerCase();
              if (["true","1","yes","on","checked","x"].includes(normalized)) {
                form.getCheckBox(field).check();
              } else {
                form.getCheckBox(field).uncheck();
              }
            } else if (detail.type === 'Radio') {
              if (value !== undefined && value !== '') {
                form.getRadioGroup(field).select(String(value));
              }
            } else if (detail.type === 'Dropdown') {
              if (value !== undefined && value !== '') {
                form.getDropdown(field).select(String(value));
              }
            } else {
              // fallback: try text
              form.getTextField(field).setText(value !== undefined ? String(value) : '');
            }
          } catch {
            // ignore field errors
          }
        }
        form.flatten();
        const filledBytes = await pdfDoc.save();
        zip.file(`filled_${i + 1}.pdf`, filledBytes);
      } catch {
        // skip row on error
      }
      setProgress(Math.round(((i + 1) / dataRows.length) * 100));
    }
    const content = await zip.generateAsync({ type: 'blob' }, (meta) => {
      setProgress(Math.round(meta.percent));
    });
    const url = URL.createObjectURL(content);
    setZipUrl(url);
    setIsProcessing(false);
  };

  // UI
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-8">
      {/* Step 1: Upload PDF */}
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-md p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2">Step 1: Upload Fillable PDF</h2>
        <input
          type="file"
          accept="application/pdf"
          ref={pdfInputRef}
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handlePDFUpload(file);
          }}
        />
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
          onClick={() => pdfInputRef.current?.click()}
        >
          {pdfFile ? (
            <span className="font-semibold">{pdfFile.name}</span>
          ) : (
            <span>Drag & drop or click to select a fillable PDF</span>
          )}
        </div>
        {xfaWarning && <div className="text-yellow-700 bg-yellow-100 rounded p-2 text-xs">{xfaWarning}</div>}
        {pdfError && <div className="text-red-600 text-sm">{pdfError}</div>}
        {isFillable === false && !pdfError && (
          <div className="text-yellow-700 bg-yellow-100 rounded p-2 text-xs">This PDF does not appear to be fillable.</div>
        )}
        {fieldDetails.length > 0 && (
          <div className="mt-2">
            <div className="font-semibold mb-1">Detected Fields:</div>
            <ul className="list-disc pl-6 text-sm">
              {fieldDetails.map(f => (
                <li key={f.name}>
                  <span className="font-mono">{f.name}</span> <span className="text-xs text-gray-500">({f.type})</span>
                  {f.options && f.options.length > 0 && (
                    <span className="ml-2 text-xs text-blue-600">Options: {f.options.join(', ')}</span>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex gap-2 mt-2">
              <button className="btn btn-secondary" onClick={() => exportTemplate('csv')}>Export CSV Template</button>
              <button className="btn btn-secondary" onClick={() => exportTemplate('xlsx')}>Export Excel Template</button>
            </div>
          </div>
        )}
      </div>
      {/* Step 2: Upload Data */}
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-md p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2">Step 2: Upload Data (CSV* or Excel)</h2>
        <input
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          ref={dataInputRef}
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleDataUpload(file);
          }}
        />
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-accent transition-colors"
          onClick={() => dataInputRef.current?.click()}
        >
          {dataFile ? (
            <span className="font-semibold">{dataFile.name}</span>
          ) : (
            <span>Drag & drop or click to select a CSV or Excel file</span>
          )}
        </div>
        <div className="mt-2 text-xs text-accent"><b>*Tip:</b> If you edit your CSV in Excel, open it in a text editor after saving and remove any quotes from the header row before importing. This helps avoid import errors.</div>
        {dataError && <div className="text-red-600 text-sm">{dataError}</div>}
        {validationWarning && <div className="text-yellow-700 bg-yellow-100 rounded p-2 text-xs">{validationWarning}</div>}
        {columnNames.length > 0 && (
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">Columns detected: {columnNames.join(', ')}</div>
        )}
      </div>
      {/* Step 3: Fill PDFs and Download ZIP */}
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-md p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2">Step 3: Generate & Download</h2>
        <button
          className="btn btn-primary w-full"
          onClick={handleFillAndZip}
          disabled={!pdfBytes || !dataRows.length || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Generate Filled PDFs & Download ZIP'}
        </button>
        {isProcessing && (
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div
              className="bg-accent h-4 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}
        {zipUrl && (
          <a
            href={zipUrl}
            download="filled_pdfs.zip"
            className="btn btn-primary w-full mt-2 text-center"
          >
            Download ZIP
          </a>
        )}
      </div>
      {/* Footer donation message */}
      <div className="text-center text-xs text-gray-600 dark:text-gray-300 mt-8">
        <div className="mb-2">This tool is 100% free and runs in your browser. If it saved you time, consider donating.</div>
        <a
          href="https://www.buymeacoffee.com/toolsjockey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded shadow"
        >
          ☕ Buy Me a Coffee
        </a>
      </div>
    </div>
  );
};

export default BatchPDFFormFiller; 