import React, { useState, useRef, useEffect } from 'react';
import { Compass, Download, Upload, File, Trash } from 'lucide-react';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import ArchiveToolPageLayout from '../../components/layout/ArchiveToolPageLayout';

interface FileItem {
  file: File;
  path: string;
  size: number;
  type: string;
}

const SevenZipSupportPage: React.FC = () => {
  const [mode, setMode] = useState<'compress' | 'extract'>('compress');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [archiveUrl, setArchiveUrl] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState(5);
  const [archiveName, setArchiveName] = useState('archive.7z');
  const [totalSize, setTotalSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (archiveUrl) {
        URL.revokeObjectURL(archiveUrl);
      }
    };
  }, [archiveUrl]);

  useEffect(() => {
    document.title = '7z Support – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Handle 7z format compression and extraction with high compression ratios.');
  }, []);

  // Calculate total size
  useEffect(() => {
    const total = files.reduce((sum, file) => sum + file.size, 0);
    setTotalSize(total);
  }, [files]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    
    const newFiles: FileItem[] = Array.from(fileList).map(file => ({
      file,
      path: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    setArchiveUrl(null);
    setError(null);
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (mode === 'compress') {
      handleFiles(e.dataTransfer.files);
    } else {
      // Handle 7z file for extraction
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].name.endsWith('.7z')) {
        handleExtractFile();
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFilePath = (index: number, newPath: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, path: newPath } : file
    ));
  };

  const handleExtractFile = async () => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    try {
      setError('7z extraction requires the 7z-wasm library. This is a demonstration of the interface.');
    } catch (e: any) {
      setError('Failed to load 7z archive: ' + e.message);
    }
    setIsProcessing(false);
  };

  const create7zArchive = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setArchiveUrl(null);
    
    try {
      // Note: This is a placeholder implementation
      // In a real implementation, you would use 7z-wasm or similar library
      setError('7z compression requires the 7z-wasm library. This is a demonstration of the interface.');
      
      // Simulate processing for demo
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (e: any) {
      setError('Failed to create 7z archive: ' + e.message);
    }
    
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  const downloadArchive = () => {
    if (!archiveUrl) return;
    
    const link = document.createElement('a');
    link.href = archiveUrl;
    link.download = archiveName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      URL.revokeObjectURL(archiveUrl);
      setArchiveUrl(null);
    }, 100);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ArchiveToolPageLayout title="7z Support" icon={ArchiveBoxIcon}>
      {/* Mode Toggle */}
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Operation Mode</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setMode('compress')}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              mode === 'compress'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-gray-300 dark:border-gray-600 hover:border-accent'
            }`}
          >
            <Compass className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Compress Files</span>
          </button>
          <button
            onClick={() => setMode('extract')}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              mode === 'extract'
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-gray-300 dark:border-gray-600 hover:border-accent'
            }`}
          >
            <Upload className="w-6 h-6 mx-auto mb-2" />
            <span className="font-medium">Extract Archive</span>
          </button>
        </div>
      </div>
      {mode === 'compress' ? (
        <>
          {/* File Upload */}
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add Files</h2>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={e => handleFiles(e.target.files)}
            />
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors mb-4"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              <Compass className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports multiple files
              </p>
            </div>
            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Selected Files ({files.length})</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center flex-1 min-w-0">
                        <File className="w-4 h-4 text-gray-500 mr-3 flex-shrink-0" />
                        <input
                          type="text"
                          value={file.path}
                          onChange={e => updateFilePath(index, e.target.value)}
                          className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-accent w-full mr-2 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Compression Settings */}
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Compression Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Compression Level: {compressionLevel}</label>
                <input
                  type="range"
                  min="1"
                  max="9"
                  value={compressionLevel}
                  onChange={e => setCompressionLevel(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Fast (1)</span>
                  <span>Best (9)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Archive Name</label>
                <input
                  type="text"
                  value={archiveName}
                  onChange={e => setArchiveName(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="archive.7z"
                />
              </div>
            </div>
          </div>
          {/* Create Button */}
          <div className="text-center mb-6">
            <button
              onClick={create7zArchive}
              disabled={isProcessing || files.length === 0}
              className="btn btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Creating 7z...' : 'Create 7z Archive'}
            </button>
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
          {/* Results */}
          {archiveUrl && (
            <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">7z Archive Ready!</h2>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <span className="font-medium">Total Size:</span> {formatFileSize(totalSize)}
                </div>
              </div>
              <div className="text-center">
                <button
                  onClick={downloadArchive}
                  className="btn btn-success text-lg px-6 py-3 flex items-center gap-2 mx-auto"
                >
                  <Download className="w-5 h-5" />
                  Download 7z
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Extraction Placeholder */}
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Extract 7z Archive</h2>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".7z"
              onChange={handleExtractFile}
            />
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors mb-4"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Drag & drop 7z file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Extraction support coming soon
              </p>
            </div>
          </div>
        </>
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

export default SevenZipSupportPage; 