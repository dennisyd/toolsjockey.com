import React, { useState, useCallback } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import FileUploader from '../../components/shared/FileUploader';
import { Database, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ParsedData {
  [key: string]: any;
}

const JSONToExcelPage: React.FC = () => {
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [jsonStructure, setJsonStructure] = useState<string>('');
  const [availableArrays, setAvailableArrays] = useState<string[]>([]);
  const [selectedArray, setSelectedArray] = useState<string>('');
  const [showArraySelection, setShowArraySelection] = useState(false);

  // Parse JSON and detect array structures
  const parseJSONString = (jsonString: string) => {
    try {
      const jsonData = JSON.parse(jsonString);
      return jsonData;
    } catch (err) {
      throw new Error('Invalid JSON format: ' + (err as Error).message);
    }
  };

  // Find arrays in the JSON structure
  const findArraysInJSON = (obj: any, path = ''): string[] => {
    const arrays: string[] = [];
    
    if (Array.isArray(obj)) {
      arrays.push(path || 'root');
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        const childArrays = findArraysInJSON(obj[key], newPath);
        arrays.push(...childArrays);
      });
    }
    
    return arrays;
  };

  // Get array data from JSON using path
  const getArrayFromPath = (jsonData: any, path: string): any[] => {
    if (path === 'root') {
      return Array.isArray(jsonData) ? jsonData : [];
    }
    
    const pathParts = path.split('.');
    let current = jsonData;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return [];
      }
    }
    
    return Array.isArray(current) ? current : [];
  };

  // Flatten nested objects for Excel
  const flattenObject = (obj: any, prefix = ''): any => {
    const flattened: any = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively flatten nested objects
        Object.assign(flattened, flattenObject(value, newKey));
      } else if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings
        flattened[newKey] = value.join(', ');
      } else {
        // Primitive values
        flattened[newKey] = value;
      }
    });
    
    return flattened;
  };

  // Process array data for Excel
  const processArrayData = (arrayData: any[]): ParsedData[] => {
    return arrayData.map((item, index) => {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        // Flatten object structure
        return flattenObject(item);
      } else {
        // Primitive values - create a simple row structure
        return { [`item_${index}`]: item };
      }
    });
  };

  const handleFileUpload = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setJsonFile(file);
    setError('');
    setIsProcessing(true);
    setParsedData([]);
    setAvailableArrays([]);
    setSelectedArray('');
    setShowArraySelection(false);
    setJsonStructure('');

    try {
      const text = await file.text();
      const jsonData = parseJSONString(text);
      
      // Detect JSON structure
      if (Array.isArray(jsonData)) {
        setJsonStructure('Direct array');
        const processedData = processArrayData(jsonData);
        setParsedData(processedData);
      } else if (jsonData && typeof jsonData === 'object') {
        // Find arrays in the object
        const arrays = findArraysInJSON(jsonData);
        
        if (arrays.length === 0) {
          throw new Error('No arrays found in JSON. Unable to convert to Excel format.');
        }
        
        setAvailableArrays(arrays);
        
        // Auto-select the first array
        const defaultArray = arrays[0];
        setSelectedArray(defaultArray);
        
        const arrayData = getArrayFromPath(jsonData, defaultArray);
        const processedData = processArrayData(arrayData);
        setParsedData(processedData);
        setJsonStructure(`Object with ${arrays.length} array(s)`);
        
        if (arrays.length > 1) {
          setShowArraySelection(true);
        }
      } else {
        throw new Error('JSON must be an array or an object containing arrays.');
      }

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleArrayChange = (arrayPath: string) => {
    if (!jsonFile) return;
    
    setSelectedArray(arrayPath);
    setError('');
    
    try {
      jsonFile.text().then(text => {
        const jsonData = parseJSONString(text);
        const arrayData = getArrayFromPath(jsonData, arrayPath);
        const processedData = processArrayData(arrayData);
        setParsedData(processedData);
      });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const convertToExcel = () => {
    if (parsedData.length === 0) return;

    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.json_to_sheet(parsedData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'JSON Data');
      
      // Generate Excel file
      const fileName = jsonFile?.name?.replace(/\.[^/.]+$/, '') || 'json-data';
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      
    } catch (err) {
      setError('Failed to create Excel file: ' + (err as Error).message);
    }
  };

  const reset = () => {
    setJsonFile(null);
    setParsedData([]);
    setError('');
    setJsonStructure('');
    setAvailableArrays([]);
    setSelectedArray('');
    setShowArraySelection(false);
    setIsProcessing(false);
  };

  return (
    <ToolPageLayout
      toolId="json-to-excel"
      title="JSON to Excel Converter"
      icon={Database}
      group="excelcsv"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload JSON File</h2>
          
          <FileUploader
            accept=".json,application/json,text/json"
            onFileUpload={handleFileUpload}
            maxSize={50 * 1024 * 1024} // 50MB limit
            disabled={isProcessing}
            description="Upload your JSON file to convert to Excel format"
          />
          
          {isProcessing && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Processing JSON file...</span>
            </div>
          )}
        </div>

        {/* JSON Structure Info */}
        {jsonStructure && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-sm font-medium text-blue-800">JSON Structure Detected</h3>
            </div>
            <p className="mt-1 text-sm text-blue-700">{jsonStructure}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Array Selection */}
        {showArraySelection && availableArrays.length > 1 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Multiple Arrays Detected</h3>
            <p className="text-sm text-blue-700 mb-3">
              Select which array to convert to Excel:
            </p>
            <div className="space-y-2">
              {availableArrays.map((arrayPath) => (
                <label key={arrayPath} className="flex items-center">
                  <input
                    type="radio"
                    name="arrayPath"
                    value={arrayPath}
                    checked={selectedArray === arrayPath}
                    onChange={(e) => handleArrayChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 font-mono">
                    {arrayPath === 'root' ? 'Root Array' : arrayPath}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Data Preview */}
        {parsedData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Data Preview ({parsedData.length} rows)
              </h2>
              <div className="space-x-2">
                <button
                  onClick={convertToExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Download Excel
                </button>
                <button
                  onClick={reset}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(parsedData[0] || {}).map((column) => (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parsedData.slice(0, 10).map((row, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {parsedData.length > 10 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing first 10 rows of {parsedData.length} total rows
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Use</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="font-semibold text-blue-600 mr-2">1.</span>
              Upload your JSON file using the file uploader above
            </li>
            <li className="flex items-start">
              <span className="font-semibold text-blue-600 mr-2">2.</span>
              The tool will automatically detect arrays in your JSON structure
            </li>
            <li className="flex items-start">
              <span className="font-semibold text-blue-600 mr-2">3.</span>
              If multiple arrays are found, select the one you want to convert
            </li>
            <li className="flex items-start">
              <span className="font-semibold text-blue-600 mr-2">4.</span>
              Preview the converted data in the table below
            </li>
            <li className="flex items-start">
              <span className="font-semibold text-blue-600 mr-2">5.</span>
              Click "Download Excel" to get your converted file
            </li>
          </ul>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">Supported JSON Formats:</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Direct arrays: Arrays of objects or primitives</li>
              <li>• Objects with arrays: Objects containing array properties</li>
              <li>• Nested objects will be flattened (e.g., user.name)</li>
              <li>• Arrays within objects will be converted to comma-separated strings</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default JSONToExcelPage; 