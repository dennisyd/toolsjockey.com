import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { FolderOpen, Download, File, CheckSquare, Square } from 'lucide-react';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import ArchiveToolPageLayout from '../../components/layout/ArchiveToolPageLayout';

interface ArchiveFile {
  name: string;
  size: number;
  compressedSize: number;
  isDirectory: boolean;
  date: Date;
  path: string;
}

interface ExtractedFile {
  name: string;
  data: Blob;
  size: number;
  path: string;
}

const ZipExtractorPage: React.FC = () => {
  const [archive, setArchive] = useState<JSZip | null>(null);
  const [archiveFiles, setArchiveFiles] = useState<ArchiveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [totalSize, setTotalSize] = useState(0);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  useEffect(() => {
    document.title = 'ZIP Extractor – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Extract files from ZIP archives with preview and selective extraction.');
  }, []);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setArchiveFiles([]);
    setSelectedFiles(new Set());
    setExtractedFiles([]);
    setDownloadUrl(null);
    
    try {
      const zip = new JSZip();
      setProgress(20);
      
      // Load the ZIP file
      const zipData = await zip.loadAsync(file);
      
      setProgress(40);
      setArchive(zipData);
      
      // Extract file information
      const files: ArchiveFile[] = [];
      
      zipData.forEach((relativePath, zipEntry) => {
        const isDirectory = zipEntry.dir;
        
        files.push({
          name: zipEntry.name.split('/').pop() || '',
          size: 0,
          compressedSize: 0,
          isDirectory,
          date: zipEntry.date,
          path: relativePath
        });
      });
      
      setArchiveFiles(files);
      setTotalSize(totalSize);
      setProgress(100);
      
    } catch (e: any) {
      setError('Failed to load archive: ' + e.message);
    }
    
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const toggleFileSelection = (path: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(path)) {
      newSelected.delete(path);
    } else {
      newSelected.add(path);
    }
    setSelectedFiles(newSelected);
  };

  const selectAll = () => {
    const allPaths = archiveFiles.filter(f => !f.isDirectory).map(f => f.path);
    setSelectedFiles(new Set(allPaths));
  };

  const selectNone = () => {
    setSelectedFiles(new Set());
  };

  const extractFiles = async () => {
    if (!archive || selectedFiles.size === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setExtractedFiles([]);
    setDownloadUrl(null);
    
    try {
      const extracted: ExtractedFile[] = [];
      const selectedArray = Array.from(selectedFiles);
      
      for (let i = 0; i < selectedArray.length; i++) {
        const path = selectedArray[i];
        setProgress(Math.round((i / selectedArray.length) * 80));
        
        const zipEntry = archive.file(path);
        if (zipEntry) {
          const data = await zipEntry.async('blob');
          const fileInfo = archiveFiles.find(f => f.path === path);
          
          if (fileInfo) {
            extracted.push({
              name: fileInfo.name,
              data,
              size: 0,
              path
            });
          }
        }
      }
      
      setExtractedFiles(extracted);
      setProgress(100);
      
    } catch (e: any) {
      setError('Failed to extract files: ' + e.message);
    }
    
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  const downloadFiles = () => {
    if (extractedFiles.length === 0) return;
    
    if (extractedFiles.length === 1) {
      // Single file download
      const file = extractedFiles[0];
      const url = URL.createObjectURL(file.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
      // Multiple files - create a ZIP
      const zip = new JSZip();
      
      extractedFiles.forEach(file => {
        zip.file(file.name, file.data);
      });
      
      zip.generateAsync({ type: 'blob' }).then(zipBlob => {
        const url = URL.createObjectURL(zipBlob);
        setDownloadUrl(url);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'extracted_files.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          URL.revokeObjectURL(url);
          setDownloadUrl(null);
        }, 100);
      });
    }
  };

  return (
    <ArchiveToolPageLayout title="ZIP Extractor" icon={ArchiveBoxIcon}>
      {/* File Upload */}
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload ZIP Archive</h2>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".zip"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors mb-4"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Drag & drop ZIP file here, or click to select
          </p>
          <p className="text-sm text-gray-500">
            Supports ZIP format only
          </p>
        </div>
      </div>
      {/* Progress */}
      {isProcessing && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-accent h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Processing... {progress}%
          </p>
        </div>
      )}
      {/* Archive File List */}
      {archiveFiles.length > 0 && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Archive Contents</h2>
          <div className="flex items-center gap-4 mb-4">
            <button onClick={selectAll} className="btn btn-sm btn-outline">Select All</button>
            <button onClick={selectNone} className="btn btn-sm btn-outline">Select None</button>
            <span className="text-sm text-gray-500">{selectedFiles.size} selected</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="p-3">Select</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Path</th>
                </tr>
              </thead>
              <tbody>
                {archiveFiles.map((file, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-3 text-center">
                      {!file.isDirectory && (
                        <button
                          onClick={() => toggleFileSelection(file.path)}
                          className="focus:outline-none"
                        >
                          {selectedFiles.has(file.path) ? (
                            <CheckSquare className="w-4 h-4 text-accent" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="p-3">
                      {file.isDirectory ? (
                        <FolderOpen className="w-4 h-4 text-blue-500 inline mr-1" />
                      ) : (
                        <File className="w-4 h-4 text-gray-500 inline mr-1" />
                      )}
                      <span className={file.isDirectory ? 'text-blue-600' : ''}>{file.name}</span>
                    </td>
                    <td className="p-3">{file.isDirectory ? 'Folder' : 'File'}</td>
                    <td className="p-3">{file.path}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Extract Button */}
      {archiveFiles.length > 0 && (
        <div className="text-center mb-6">
          <button
            onClick={extractFiles}
            disabled={isProcessing || selectedFiles.size === 0}
            className="btn btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Extracting...' : 'Extract Selected Files'}
          </button>
        </div>
      )}
      {/* Results */}
      {extractedFiles.length > 0 && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Extraction Complete!</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {extractedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="flex items-center flex-1 min-w-0">
                  <File className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <button
                    onClick={() => {
                      const url = URL.createObjectURL(file.data);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = file.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      setTimeout(() => URL.revokeObjectURL(url), 100);
                    }}
                    className="btn btn-success btn-sm ml-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={downloadFiles}
              className="btn btn-primary flex items-center gap-2 mx-auto"
            >
              <Download className="w-5 h-5" />
              Download All
            </button>
          </div>
        </div>
      )}
      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200 mb-6">
          {error}
        </div>
      )}
    </ArchiveToolPageLayout>
  );
};

export default ZipExtractorPage; 