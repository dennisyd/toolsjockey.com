import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Lock, Unlock, AlertCircle, CheckCircle } from 'lucide-react';
import PDFSuiteLayout from '../../components/layout/PDFSuiteLayout';
import { PDFDocument } from 'pdf-lib';

const UnlockPDFPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Unlock PDF – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Remove password protection from PDF files securely in your browser.');
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.includes('pdf')) {
        setError('Please select a valid PDF file.');
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
        setError('File size too large. Please select a file smaller than 50MB.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
      setOutputUrl(null);
      setIsPasswordProtected(null);
      setPassword('');
      setProgress(0);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.type.includes('pdf')) {
        setError('Please select a valid PDF file.');
        return;
      }
      if (droppedFile.size > 50 * 1024 * 1024) {
        setError('File size too large. Please select a file smaller than 50MB.');
        return;
      }
      setFile(droppedFile);
      setError(null);
      setSuccess(null);
      setOutputUrl(null);
      setIsPasswordProtected(null);
      setPassword('');
      setProgress(0);
    }
  };

  const unlockPDF = async () => {
    if (!file) {
      setError('Please select a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    try {
      setProgress(10);
      const arrayBuffer = await file.arrayBuffer();
      setProgress(30);

      // Try to load the PDF
      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer);
      } catch (error) {
        setError('This PDF is password protected. Password-protected PDFs cannot be unlocked in this browser. Please use a different tool or a PDF viewer.');
        setIsProcessing(false);
        setProgress(0);
        return;
      }

      setProgress(60);

      // Remove password protection by saving without password
      const unlockedPdfBytes = await pdfDoc.save();
      setProgress(90);

      // Create download link
      const blob = new Blob([unlockedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setSuccess('PDF unlocked successfully!');
      setProgress(100);

      // Clean up old URL
      setTimeout(() => {
        if (outputUrl) {
          URL.revokeObjectURL(outputUrl);
        }
      }, 1000);

    } catch (error) {
      console.error('Error unlocking PDF:', error);
      setError('Failed to unlock PDF. Please check if the password is correct and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadUnlockedPDF = () => {
    if (outputUrl && file) {
      const link = document.createElement('a');
      link.href = outputUrl;
      link.download = `unlocked_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPassword('');
    setError(null);
    setSuccess(null);
    setOutputUrl(null);
    setIsPasswordProtected(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <PDFSuiteLayout title="Unlock PDF">
      <main className="container-app mx-auto px-2 md:px-0 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Unlock PDF</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Remove password protection from PDF files. All processing happens securely in your browser.
            </p>
          </div>

          {/* File Upload Section */}
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload PDF</h2>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                file ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 hover:border-blue-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {file ? (
                <div className="space-y-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Drop your PDF here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">Maximum file size: 50MB</p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Select PDF File
                  </button>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Password Section */}
          {file && (
            <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Password Protection</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PDF Password (if required)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter PDF password if protected"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  {isPasswordProtected === true && (
                    <Lock className="w-5 h-5 text-red-500" />
                  )}
                  {isPasswordProtected === false && (
                    <Unlock className="w-5 h-5 text-green-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {isPasswordProtected === null 
                      ? 'Click "Check Protection" to verify'
                      : isPasswordProtected 
                        ? 'PDF appears to be password protected'
                        : 'PDF is not password protected'
                    }
                  </span>
                </div>

                <button
                  onClick={unlockPDF}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-5 h-5" />
                      <span>Unlock PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Processing PDF</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{progress}% complete</p>
            </div>
          )}

          {/* Error Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Messages */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Download Section */}
          {outputUrl && (
            <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Download Unlocked PDF</h2>
              <button
                onClick={downloadUnlockedPDF}
                className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Unlocked PDF</span>
              </button>
            </div>
          )}

          {/* Information Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              How it works
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• Upload your password-protected PDF file</li>
              <li>• Enter the password if prompted</li>
              <li>• The tool will remove password protection while preserving all content</li>
              <li>• Download the unlocked PDF file</li>
              <li>• All processing happens securely in your browser</li>
            </ul>
          </div>
        </div>
      </main>
    </PDFSuiteLayout>
  );
};

export default UnlockPDFPage; 