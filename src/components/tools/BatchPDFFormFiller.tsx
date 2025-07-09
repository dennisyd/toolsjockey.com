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
  
  if (!field) return { type, options };
  
  // First try using instance methods to determine type
  try {
    // Check for text field methods
    if (typeof field.getText === 'function' && typeof field.setText === 'function') {
      type = 'Text';
    }
    // Check for checkbox methods
    else if (typeof field.isChecked === 'function' || typeof field.check === 'function') {
      type = 'Checkbox';
    }
    // Check for radio group methods
    else if (typeof field.getSelected === 'function' && typeof field.select === 'function') {
      type = 'Radio';
      if (typeof field.getOptions === 'function') {
        options = field.getOptions();
      }
    }
    // Check for dropdown methods
    else if (typeof field.getOptions === 'function' && typeof field.select === 'function') {
      type = 'Dropdown';
      options = field.getOptions();
    }
    // Check for button methods
    else if (typeof field.getName === 'function' && !type) {
      type = 'Button';
    }
  } catch (e) {
    console.error('Error determining field type by methods:', e);
  }
  
  // If we couldn't determine by methods, fall back to constructor name
  if (type === 'Unknown' && ctor) {
    if (ctor.includes('Text')) type = 'Text';
    else if (ctor.includes('CheckBox')) type = 'Checkbox';
    else if (ctor.includes('Radio')) {
      type = 'Radio';
      if (typeof field.getOptions === 'function') {
        try {
          options = field.getOptions();
        } catch (e) {
          console.error('Error getting radio options:', e);
        }
      }
    }
    else if (ctor.includes('Dropdown') || ctor.includes('ComboBox')) {
      type = 'Dropdown';
      if (typeof field.getOptions === 'function') {
        try {
          options = field.getOptions();
        } catch (e) {
          console.error('Error getting dropdown options:', e);
        }
      }
    }
    else if (ctor.includes('Button')) type = 'Button';
  }
  
  return { type, options };
}

const BatchPDFFormFiller: React.FC = () => {
  console.log('BatchPDFFormFiller rendering');
  
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
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Refs for file inputs
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const dataInputRef = useRef<HTMLInputElement>(null);
  
  // Manual field type override
  const [manualTypeOverrides, setManualTypeOverrides] = useState<Record<string, string>>({});
  
  // Step 1: Upload PDF and extract fields
  const handlePDFUpload = async (file: File) => {
    setPdfError(null);
    setIsFillable(null);
    setFieldNames([]);
    setFieldDetails([]);
    setXfaWarning(null);
    setPdfFile(file);
    setZipUrl(null);
    setDebugInfo(`Processing PDF: ${file.name} (${file.size} bytes)`);
    
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      setPdfBytes(bytes);
      
      const loadOptions = {
        updateMetadata: false,
        // Add a cache breaker for PDF loading to avoid cached objects
        forceIndirectObjects: true
      };
      
      console.log('Loading PDF document...');
      const pdfDoc = await PDFDocument.load(bytes, loadOptions);
      console.log('PDF document loaded successfully');
      
      // Log PDF version
      setDebugInfo(prev => `${prev}\nPDF Version: ${(pdfDoc as any).getVersion ? (pdfDoc as any).getVersion() : 'Unknown'}`);
      
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
        console.log('Getting form fields...');
        const pdfFields = form.getFields();
        console.log(`Found ${pdfFields.length} fields in the PDF`);
        setDebugInfo(prev => `${prev}\nFound ${pdfFields.length} form fields`);
        
        fields = pdfFields.map(f => f.getName());
        
        details = pdfFields.map(f => {
          const fieldName = f.getName();
          const fieldConstructor = f?.constructor?.name || 'Unknown';
          console.log(`Field ${fieldName}: constructor = ${fieldConstructor}`);
          
          // Determine type either from constructor or methods
          const { type, options } = getFieldTypeAndOptions(f);
          
          // Display extra debug info
          setDebugInfo(prev => `${prev}\nField: ${fieldName} (Type: ${type}, Constructor: ${fieldConstructor})`);
          
          return { name: fieldName, type, options };
        });
      } catch (error) {
        console.error('Error extracting PDF fields:', error);
        setDebugInfo(prev => `${prev}\nError extracting fields: ${error}`);
        fields = [];
        details = [];
      }
      
      setFieldNames(fields);
      setFieldDetails(details);
      setIsFillable(fields.length > 0);
      
      if (fields.length === 0) {
        setPdfError('No fillable fields found. This PDF may be scanned or non-interactive.');
      }
    } catch (e: any) {
      console.error('Error loading PDF:', e);
      setDebugInfo(prev => `${prev}\nError loading PDF: ${e.message || 'Unknown error'}`);
      setPdfError('Failed to parse PDF: ' + (e.message || 'Unknown error'));
      setIsFillable(false);
    }
  };

  // Update field type manually
  const handleTypeChange = (fieldName: string, newType: string) => {
    const newOverrides = { ...manualTypeOverrides, [fieldName]: newType };
    setManualTypeOverrides(newOverrides);
    
    // Update field details with the override
    const updatedDetails = fieldDetails.map(detail => {
      if (detail.name === fieldName) {
        return { ...detail, type: newType };
      }
      return detail;
    });
    
    setFieldDetails(updatedDetails);
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
    setDebugInfo(`Processing data file: ${file.name}`);
    
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
      setDebugInfo(prev => `${prev}\nFound ${rows.length} data rows with ${columns.length} columns`);
      
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
      console.error('Error parsing data file:', e);
      setDebugInfo(prev => `${prev}\nError parsing data file: ${e.message || 'Unknown error'}`);
      setDataError(`Failed to parse data file: ${e.message || 'Unknown error'}`);
    }
  };

  // Step 3: Fill PDFs and create ZIP
  const handleFillAndZip = async () => {
    if (!pdfBytes || !dataRows.length) return;
    setIsProcessing(true);
    setProgress(0);
    setZipUrl(null);
    setDebugInfo(`Starting PDF filling process for ${dataRows.length} rows`);
    
    const zip = new JSZip();
    let errors = 0;
    
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      try {
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const form = pdfDoc.getForm();
        
        for (const detail of fieldDetails) {
          const field = detail.name;
          const value = row[field];
          const fieldType = manualTypeOverrides[field] || detail.type;
          
          try {
            // Handle based on field type (with extra error handling)
            if (fieldType === 'Text') {
              console.log(`Setting text field ${field} to "${value}"`);
              const textField = form.getTextField(field);
              textField.setText(value !== undefined ? String(value) : '');
              
              // Handle date fields - both direct date inputs and Excel-style date numbers
              if (value !== undefined) {
                const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
                const valueStr = String(value);
                
                // Check if field name contains "date" (case insensitive)
                const isDateField = field.toLowerCase().includes('date');
                
                if (dateRegex.test(valueStr)) {
                  // For direct date inputs, set the text directly to preserve the entered format
                  console.log(`Setting date field ${field} to formatted date: ${valueStr}`);
                  textField.setText(valueStr);
                } else if (isDateField && !isNaN(Number(valueStr))) {
                  // This might be an Excel date serial number (days since 1/1/1900)
                  try {
                    // Convert Excel date number to JS date
                    const excelEpoch = new Date(1900, 0, 1);
                    const daysSinceEpoch = Number(valueStr) - 2; // Excel has a leap year bug we need to adjust for
                    const date = new Date(excelEpoch);
                    date.setDate(date.getDate() + daysSinceEpoch);
                    
                    // Format as MM/DD/YYYY
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    const day = date.getDate().toString().padStart(2, '0');
                    const year = date.getFullYear();
                    const formattedDate = `${month}/${day}/${year}`;
                    
                    console.log(`Converting Excel date ${valueStr} to ${formattedDate} for field ${field}`);
                    textField.setText(formattedDate);
                  } catch (dateError) {
                    console.error(`Date conversion error for ${field}:`, dateError);
                    textField.setText(valueStr);
                  }
                }
              }
            } else if (fieldType === 'Checkbox') {
              const normalized = value !== undefined ? String(value).trim().toLowerCase() : '';
              if (["true","1","yes","on","checked","x"].includes(normalized)) {
                form.getCheckBox(field).check();
              } else {
                form.getCheckBox(field).uncheck();
              }
            } else if (fieldType === 'Radio') {
              if (value !== undefined && value !== '') {
                form.getRadioGroup(field).select(String(value));
              }
            } else if (fieldType === 'Dropdown') {
              if (value !== undefined && value !== '') {
                form.getDropdown(field).select(String(value));
              }
            } else {
              // fallback: try text
              console.log(`Using fallback text field for ${field} (${fieldType})`);
              form.getTextField(field).setText(value !== undefined ? String(value) : '');
            }
          } catch (fieldError) {
            console.error(`Error setting field ${field}:`, fieldError);
            setDebugInfo(prev => `${prev}\nError with field ${field}: ${fieldError instanceof Error ? fieldError.message : 'Unknown error'}`);
            
            // Try fallback approach for problematic fields
            try {
              const anyForm = form as any;
              if (typeof anyForm.getField === 'function') {
                const genericField = anyForm.getField(field);
                if (genericField && typeof genericField.setValue === 'function') {
                  genericField.setValue(value !== undefined ? String(value) : '');
                }
              }
            } catch (fallbackError) {
              // Ignore fallback errors
            }
          }
        }
        
        // Flatten the form
        try {
          form.flatten();
        } catch (flattenError) {
          console.error('Error flattening form:', flattenError);
          setDebugInfo(prev => `${prev}\nError flattening form: ${flattenError instanceof Error ? flattenError.message : 'Unknown error'}`);
        }
        
        // Save the PDF
        const filledBytes = await pdfDoc.save();
        zip.file(`filled_${i + 1}.pdf`, filledBytes);
      } catch (rowError) {
        console.error(`Error processing row ${i + 1}:`, rowError);
        setDebugInfo(prev => `${prev}\nError processing row ${i + 1}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`);
        errors++;
      }
      
      setProgress(Math.round(((i + 1) / dataRows.length) * 100));
    }
    
    // Generate the ZIP file
    try {
      const content = await zip.generateAsync({ type: 'blob' }, (meta) => {
        setProgress(Math.round(meta.percent));
      });
      
      const url = URL.createObjectURL(content);
      setZipUrl(url);
      
      if (errors > 0) {
        setDebugInfo(prev => `${prev}\nCompleted with ${errors} errors. Some PDFs may not have processed correctly.`);
      } else {
        setDebugInfo(prev => `${prev}\nAll PDFs processed successfully!`);
      }
    } catch (zipError) {
      console.error('Error creating ZIP file:', zipError);
      setDebugInfo(prev => `${prev}\nError creating ZIP file: ${zipError instanceof Error ? zipError.message : 'Unknown error'}`);
    }
    
    setIsProcessing(false);
  };

  // UI
  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-8">
      {/* Step 1: Upload PDF */}
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-md p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-2">Step 1: Upload Fillable PDF</h2>
        <div className="bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 rounded p-3 text-sm text-blue-700 dark:text-blue-300 mb-2">
          <strong>Note:</strong> Due to client-side processing limitations, multiselect fields cannot be processed. All other field types are supported.
        </div>
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
                <li key={f.name} className="mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{f.name}</span>
                    <select 
                      value={manualTypeOverrides[f.name] || f.type}
                      onChange={(e) => handleTypeChange(f.name, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-1"
                    >
                      <option value="Text">Text</option>
                      <option value="Checkbox">Checkbox</option>
                      <option value="Radio">Radio</option>
                      <option value="Dropdown">Dropdown</option>
                      <option value="Button">Button</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                    <span className="text-xs text-gray-500">({f.type})</span>
                  </div>
                  {f.options && f.options.length > 0 && (
                    <span className="ml-2 text-xs text-blue-600 block">Options: {f.options.join(', ')}</span>
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
      
      {/* Debug Information Section - renamed to Processing Status */}
      {debugInfo && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 className="font-bold mb-2">Processing Status</h3>
          <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-48 bg-black text-green-400 p-2 rounded">
            {debugInfo}
          </pre>
        </div>
      )}
    </div>
  );
};

export default BatchPDFFormFiller; 