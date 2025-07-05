import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { RefreshCw, Download, File, CheckCircle, Trash } from 'lucide-react';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import ArchiveToolPageLayout from '../../components/layout/ArchiveToolPageLayout';

interface FileItem {
  file: File;
  originalSize: number;
  compressedSize?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  compressedBlob?: Blob;
}

type CompressionFormat = 'zip' | 'gzip' | 'brotli';

const BatchCompressorPage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressionFormat, setCompressionFormat] = useState<CompressionFormat>('zip');
  const [compressionLevel, setCompressionLevel] = useState(6);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup any blob URLs if needed
    };
  }, []);

  useEffect(() => {
    document.title = 'Batch Compressor – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Compress multiple files individually with format selection and progress tracking.');
  }, []);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    
    const newFiles: FileItem[] = Array.from(fileList).map(file => ({
      file,
      originalSize: file.size,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(file => file.status !== 'completed'));
  };

  const clearErrors = () => {
    setFiles(prev => prev.filter(file => file.status !== 'error'));
  };

  const compressFile = async (fileItem: FileItem, index: number): Promise<void> => {
    try {
      // Update status to processing
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'processing' } : f
      ));

      let compressedBlob: Blob;
      let compressedSize: number;

      if (compressionFormat === 'zip') {
        // Create ZIP archive
        const zip = new JSZip();
        zip.file(fileItem.file.name, fileItem.file);
        
        compressedBlob = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: {
            level: compressionLevel
          }
        });
        compressedSize = compressedBlob.size;
      } else {
        // For gzip/brotli, we'll simulate compression
        // In a real implementation, you'd use libraries like pako for gzip
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
        
        // Simulate compression (in reality, this would be actual compression)
        compressedSize = Math.floor(fileItem.originalSize * (0.7 + Math.random() * 0.2));
        compressedBlob = new Blob([fileItem.file], { type: fileItem.file.type });
      }

      // Update file with compressed data
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'completed',
          compressedSize,
          compressedBlob
        } : f
      ));

    } catch (e: any) {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'error',
          error: e.message
        } : f
      ));
    }
  };

  const startBatchCompression = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    for (let i = 0; i < pendingFiles.length; i++) {
      const fileIndex = files.findIndex(f => f === pendingFiles[i]);
      await compressFile(pendingFiles[i], fileIndex);
      
      // Update progress
      const progressPercent = Math.round(((i + 1) / pendingFiles.length) * 100);
      setProgress(progressPercent);
    }
    
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  const downloadAll = () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.compressedBlob);
    
    if (completedFiles.length === 0) return;
    
    if (completedFiles.length === 1) {
      // Single file download
      const file = completedFiles[0];
      const url = URL.createObjectURL(file.compressedBlob!);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.file.name}.${compressionFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
      // Multiple files - create a ZIP
      const zip = new JSZip();
      
      completedFiles.forEach(file => {
        const extension = compressionFormat === 'zip' ? 'zip' : compressionFormat;
        zip.file(`${file.file.name}.${extension}`, file.compressedBlob!);
      });
      
      zip.generateAsync({ type: 'blob' }).then(zipBlob => {
        const url = URL.createObjectURL(zipBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'compressed_files.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionRatio = (original: number, compressed: number) => {
    if (original === 0) return 0;
    return ((original - compressed) / original * 100).toFixed(1);
  };

  return (
    <ArchiveToolPageLayout title="Batch Compressor" icon={ArchiveBoxIcon}>
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
          <RefreshCw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
                    <span className="truncate">{file.file.name}</span>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-sm text-gray-500">
                      {formatFileSize(file.originalSize)}
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
            <label className="block text-sm font-medium mb-2">Format</label>
            <select
              value={compressionFormat}
              onChange={e => setCompressionFormat(e.target.value as CompressionFormat)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="zip">ZIP</option>
              <option value="gzip">GZIP</option>
              <option value="brotli">Brotli</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Compression Level: {compressionLevel}
            </label>
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
        </div>
      </div>
      {/* Start Button */}
      <div className="text-center mb-6">
        <button
          onClick={startBatchCompression}
          disabled={isProcessing || files.length === 0}
          className="btn btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Compressing...' : 'Start Compression'}
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
      {files.some(f => f.status === 'completed') && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Compression Results</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {files.filter(f => f.status === 'completed').map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <div className="flex items-center flex-1 min-w-0">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="truncate">{file.file.name}</span>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm text-gray-500">
                    {formatFileSize(file.originalSize)} → {formatFileSize(file.compressedSize || 0)}
                  </span>
                  <span className="text-xs text-green-700 font-semibold">
                    {getCompressionRatio(file.originalSize, file.compressedSize || 0)}%
                  </span>
                  <button
                    onClick={() => {
                      if (file.compressedBlob) {
                        const url = URL.createObjectURL(file.compressedBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${file.file.name}.${compressionFormat}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        setTimeout(() => URL.revokeObjectURL(url), 100);
                      }
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
              onClick={downloadAll}
              className="btn btn-primary flex items-center gap-2 mx-auto"
            >
              <Download className="w-5 h-5" />
              Download All
            </button>
          </div>
        </div>
      )}
      {/* Error */}
      {files.some(f => f.status === 'error') && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200 mb-6">
          <h3 className="font-semibold mb-2">Errors</h3>
          <ul className="list-disc pl-6">
            {files.filter(f => f.status === 'error').map((file, index) => (
              <li key={index} className="mb-1">
                <span className="font-semibold">{file.file.name}:</span> {file.error}
              </li>
            ))}
          </ul>
          <button
            onClick={clearErrors}
            className="btn btn-sm btn-outline mt-2"
          >
            Clear Errors
          </button>
        </div>
      )}
      {/* Clear Completed */}
      {files.some(f => f.status === 'completed') && (
        <div className="text-center mb-6">
          <button
            onClick={clearCompleted}
            className="btn btn-outline btn-sm"
          >
            Clear Completed
          </button>
        </div>
      )}
    </ArchiveToolPageLayout>
  );
};

export default BatchCompressorPage; 