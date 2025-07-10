import React, { useState, useCallback } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import FileUploader from '../../components/shared/FileUploader';
import { Database } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ParsedData {
  [key: string]: any;
}

const XMLToExcelPage: React.FC = () => {
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [xmlContent, setXmlContent] = useState<string>('');
  const [detectedRowElements, setDetectedRowElements] = useState<string[]>([]);
  const [selectedRowElement, setSelectedRowElement] = useState<string>('');
  const [showManualSelection, setShowManualSelection] = useState(false);

  // Parse XML and detect repeating elements
  const parseXMLString = (xmlString: string) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML format');
      }

      return xmlDoc;
    } catch (err) {
      throw new Error('Failed to parse XML: ' + (err as Error).message);
    }
  };

  // Find repeating elements that could represent rows
  const findRepeatingElements = (xmlDoc: Document): string[] => {
    const elementCounts: { [key: string]: number } = {};
    
    // Count all element tag names
    const walkNode = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        elementCounts[tagName] = (elementCounts[tagName] || 0) + 1;
        
        // Recursively walk child nodes
        for (let i = 0; i < element.childNodes.length; i++) {
          walkNode(element.childNodes[i]);
        }
      }
    };

    walkNode(xmlDoc.documentElement);

    // Find elements that appear multiple times (potential row elements)
    const repeatingElements = Object.entries(elementCounts)
      .filter(([, count]) => count > 1)
      .map(([tagName]) => tagName)
      .sort();

    return repeatingElements;
  };

  // Extract data from selected row elements
  const extractDataFromElements = (xmlDoc: Document, rowElementName: string): ParsedData[] => {
    const rowElements = xmlDoc.getElementsByTagName(rowElementName);
    const data: ParsedData[] = [];
    const allColumns = new Set<string>();

    // First pass: collect all possible column names
    for (let i = 0; i < rowElements.length; i++) {
      const rowElement = rowElements[i];
      
      // Extract all child elements as columns
      const extractColumns = (element: Element, prefix = '') => {
        for (let j = 0; j < element.children.length; j++) {
          const child = element.children[j];
          const columnName = prefix ? `${prefix}.${child.tagName}` : child.tagName;
          
          if (child.children.length > 0 && child.textContent !== child.children[0]?.textContent) {
            // Has child elements, recurse
            extractColumns(child, columnName);
          } else {
            // Leaf node, extract text content
            allColumns.add(columnName);
          }
        }
      };

      extractColumns(rowElement);
    }

    // Second pass: extract data with consistent columns
    for (let i = 0; i < rowElements.length; i++) {
      const rowElement = rowElements[i];
      const rowData: ParsedData = {};
      
      // Initialize all columns
      allColumns.forEach(col => {
        rowData[col] = '';
      });

      // Extract data
      const extractData = (element: Element, prefix = '') => {
        for (let j = 0; j < element.children.length; j++) {
          const child = element.children[j];
          const columnName = prefix ? `${prefix}.${child.tagName}` : child.tagName;
          
          if (child.children.length > 0 && child.textContent !== child.children[0]?.textContent) {
            // Has child elements, recurse
            extractData(child, columnName);
          } else {
            // Leaf node, extract text content
            const value = child.textContent?.trim() || '';
            rowData[columnName] = value;
          }
        }
      };

      extractData(rowElement);
      data.push(rowData);
    }

    return data;
  };

  const handleFileUpload = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setXmlFile(file);
    setError('');
    setIsProcessing(true);
    setParsedData([]);
    setDetectedRowElements([]);
    setSelectedRowElement('');
    setShowManualSelection(false);

    try {
      const text = await file.text();
      setXmlContent(text);
      
      const xmlDoc = parseXMLString(text);
      const repeatingElements = findRepeatingElements(xmlDoc);
      
      if (repeatingElements.length === 0) {
        throw new Error('No repeating elements found in XML. Unable to determine row structure.');
      }

      setDetectedRowElements(repeatingElements);
      
      // Auto-select the first repeating element
      const defaultElement = repeatingElements[0];
      setSelectedRowElement(defaultElement);
      
      const data = extractDataFromElements(xmlDoc, defaultElement);
      setParsedData(data);
      
      if (repeatingElements.length > 1) {
        setShowManualSelection(true);
      }

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleRowElementChange = (elementName: string) => {
    if (!xmlContent) return;
    
    setSelectedRowElement(elementName);
    setError('');
    
    try {
      const xmlDoc = parseXMLString(xmlContent);
      const data = extractDataFromElements(xmlDoc, elementName);
      setParsedData(data);
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
      XLSX.utils.book_append_sheet(workbook, worksheet, 'XML Data');
      
      // Generate Excel file
      const fileName = xmlFile?.name?.replace(/\.[^/.]+$/, '') || 'xml-data';
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      
    } catch (err) {
      setError('Failed to create Excel file: ' + (err as Error).message);
    }
  };

  const reset = () => {
    setXmlFile(null);
    setParsedData([]);
    setError('');
    setXmlContent('');
    setDetectedRowElements([]);
    setSelectedRowElement('');
    setShowManualSelection(false);
    setIsProcessing(false);
  };

  return (
    <ToolPageLayout
      toolId="xml-to-excel"
      title="XML to Excel Converter"
      icon={Database}
      group="excelcsv"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload XML File</h2>
          
          <FileUploader
            accept=".xml,text/xml,application/xml"
            onFileUpload={handleFileUpload}
            maxSize={10 * 1024 * 1024} // 10MB limit
            disabled={isProcessing}
            description="Upload your XML file to convert to Excel format"
          />
          
          {isProcessing && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Processing XML file...</span>
            </div>
          )}
        </div>

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

        {/* Row Element Selection */}
        {showManualSelection && detectedRowElements.length > 1 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Multiple Row Elements Detected</h3>
            <p className="text-sm text-blue-700 mb-3">
              Select which XML element represents the data rows:
            </p>
            <div className="space-y-2">
              {detectedRowElements.map((element) => (
                <label key={element} className="flex items-center">
                  <input
                    type="radio"
                    name="rowElement"
                    value={element}
                    checked={selectedRowElement === element}
                    onChange={(e) => handleRowElementChange(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700 font-mono">&lt;{element}&gt;</span>
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
              Upload your XML file using the file uploader above
            </li>
            <li className="flex items-start">
              <span className="font-semibold text-blue-600 mr-2">2.</span>
              The tool will automatically detect repeating elements that represent data rows
            </li>
            <li className="flex items-start">
              <span className="font-semibold text-blue-600 mr-2">3.</span>
              If multiple row elements are found, select the appropriate one
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
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default XMLToExcelPage; 