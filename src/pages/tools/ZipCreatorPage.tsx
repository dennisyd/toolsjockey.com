import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { FileArchive, Download, Trash, File } from 'lucide-react';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import ArchiveToolPageLayout from '../../components/layout/ArchiveToolPageLayout';

interface FileItem {
  file: File;
  path: string;
  size: number;
  type: string;
}

const ZipCreatorPage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState(6);
  const [archiveName, setArchiveName] = useState('archive.zip');
  const [totalSize, setTotalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (zipUrl) {
        URL.revokeObjectURL(zipUrl);
      }
    };
  }, [zipUrl]);

  useEffect(() => {
    document.title = 'ZIP Creator – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Create ZIP archives from multiple files with password protection and compression options.');
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
    setZipUrl(null);
    setError(null);
    setProgress(0);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFilePath = (index: number, newPath: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, path: newPath } : file
    ));
  };

  const createZip = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setZipUrl(null);
    
    try {
      const zip = new JSZip();
      
      // Add files to ZIP
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(Math.round((i / files.length) * 80));
        
        // Read file as ArrayBuffer
        const arrayBuffer = await file.file.arrayBuffer();
        
        // Add to ZIP with compression options
        zip.file(file.path, arrayBuffer, {
          compression: 'DEFLATE',
          compressionOptions: {
            level: compressionLevel
          }
        });
      }
      
      setProgress(90);
      
      // Generate ZIP with password if provided
      const options: JSZip.JSZipGeneratorOptions<'blob'> = {
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: compressionLevel
        }
      };
      
      const zipBlob = await zip.generateAsync(options);
      setCompressedSize(zipBlob.size);
      
      const url = URL.createObjectURL(zipBlob);
      setZipUrl(url);
      setProgress(100);
      
    } catch (e: any) {
      setError('Failed to create ZIP archive: ' + e.message);
    }
    
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  const downloadZip = () => {
    if (!zipUrl) return;
    
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = archiveName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the blob URL after download
    setTimeout(() => {
      URL.revokeObjectURL(zipUrl);
      setZipUrl(null);
    }, 100);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompressionRatio = () => {
    if (totalSize === 0 || compressedSize === 0) return 0;
    return ((totalSize - compressedSize) / totalSize * 100).toFixed(1);
  };

  return (
    <ArchiveToolPageLayout title="ZIP Creator" icon={ArchiveBoxIcon}>
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
          <FileArchive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Drag & drop files here, or click to select
          </p>
          <p className="text-sm text-gray-500">
            Supports multiple files and folders
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
              placeholder="archive.zip"
            />
          </div>
        </div>
      </div>
      {/* Create Button */}
      <div className="text-center mb-6">
        <button
          onClick={createZip}
          disabled={isProcessing || files.length === 0}
          className="btn btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Creating ZIP...' : 'Create ZIP Archive'}
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
      {zipUrl && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">ZIP Archive Ready!</h2>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <span className="font-medium">Total Size:</span> {formatFileSize(totalSize)}
            </div>
            <div>
              <span className="font-medium">Compressed Size:</span> {formatFileSize(compressedSize)}
            </div>
            <div>
              <span className="font-medium">Compression Ratio:</span> {getCompressionRatio()}%
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={downloadZip}
              className="btn btn-success text-lg px-6 py-3 flex items-center gap-2 mx-auto"
            >
              <Download className="w-5 h-5" />
              Download ZIP
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

export default ZipCreatorPage; 