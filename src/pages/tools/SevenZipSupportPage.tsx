import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { Compass, Download, Upload, File, Trash } from 'lucide-react';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import ArchiveToolPageLayout from '../../components/layout/ArchiveToolPageLayout';

interface FileItem {
  file: File;
  path: string;
  size: number;
  type: string;
}

interface ExtractedFile {
  name: string;
  size: number;
  data: Blob;
  isDirectory: boolean;
}

const SevenZipSupportPage: React.FC = () => {
  const [mode, setMode] = useState<'compress' | 'extract'>('compress');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [archiveUrl, setArchiveUrl] = useState<string | null>(null);
  const [compressionLevel, setCompressionLevel] = useState(5);
  const [archiveName, setArchiveName] = useState('archive.zip');
  const [totalSize, setTotalSize] = useState(0);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
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
    document.title = 'ZIP Support – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Handle ZIP format compression and extraction with high compression ratios.');
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
      // Handle ZIP file for extraction
      const files = e.dataTransfer.files;
      if (files.length > 0 && (files[0].name.endsWith('.zip') || files[0].name.endsWith('.7z'))) {
        handleExtractFile(files[0]);
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

  const handleExtractFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setExtractedFiles([]);
    
    try {
      setProgress(20);
      
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
      
      setProgress(50);
      
      const extracted: ExtractedFile[] = [];
      let processed = 0;
      const totalFiles = Object.keys(zipData.files).length;
      
      for (const [relativePath, zipEntry] of Object.entries(zipData.files)) {
        if (!zipEntry.dir) {
          const data = await zipEntry.async('blob');
          extracted.push({
            name: relativePath.split('/').pop() || '',
            size: data.size,
            data,
            isDirectory: false
          });
        }
        processed++;
        setProgress(50 + (processed / totalFiles) * 40);
      }
      
      setExtractedFiles(extracted);
      setProgress(100);
      
    } catch (e: any) {
      setError('Failed to extract archive: ' + e.message);
    }
    
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  const createZipArchive = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setArchiveUrl(null);
    
    try {
      const zip = new JSZip();
      
      // Add files to zip
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        const fileData = await fileItem.file.arrayBuffer();
        
        zip.file(fileItem.path, fileData, {
          compression: 'DEFLATE',
          compressionOptions: {
            level: Math.min(9, Math.max(1, compressionLevel))
          }
        });
        
        setProgress((i + 1) / files.length * 80);
      }
      
      setProgress(90);
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: Math.min(9, Math.max(1, compressionLevel))
        }
      });
      
      setProgress(100);
      
      // Create download URL
      const url = URL.createObjectURL(zipBlob);
      setArchiveUrl(url);
      
    } catch (e: any) {
      setError('Failed to create ZIP archive: ' + e.message);
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

  const downloadExtractedFile = (file: ExtractedFile) => {
    const url = URL.createObjectURL(file.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ArchiveToolPageLayout title="ZIP Support" icon={ArchiveBoxIcon}>
      <h1 className="text-2xl font-bold mb-4">7z Support</h1>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded text-blue-900 text-sm mb-4">
        <strong>What does this tool do?</strong><br />
        The 7z Support tool enables you to create and extract 7z (7-Zip) archives, a high-compression format popular for reducing file sizes and bundling many files together.
      </div>
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
                  <span>Fast</span>
                  <span>Balanced</span>
                  <span>Best</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Archive Name</label>
                <input
                  type="text"
                  value={archiveName}
                  onChange={e => setArchiveName(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-accent"
                  placeholder="archive.zip"
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Total Size:</strong> {formatFileSize(totalSize)}
              </p>
            </div>
          </div>
          
          {/* Create Archive Button */}
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
            <button
              onClick={createZipArchive}
              disabled={files.length === 0 || isProcessing}
              className="w-full bg-accent hover:bg-accent/80 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isProcessing ? 'Creating Archive...' : 'Create ZIP Archive'}
            </button>
            
            {isProcessing && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{progress.toFixed(0)}% Complete</p>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}
            
            {archiveUrl && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 dark:text-green-200 font-medium">Archive Created Successfully!</p>
                    <p className="text-green-700 dark:text-green-300 text-sm">Ready for download</p>
                  </div>
                  <button
                    onClick={downloadArchive}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Extract Mode */}
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Upload ZIP Archive</h2>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".zip,.7z"
              onChange={e => e.target.files?.[0] && handleExtractFile(e.target.files[0])}
            />
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors mb-4"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Drag & drop ZIP file here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports ZIP and 7z formats
              </p>
            </div>
            
            {isProcessing && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Extracting... {progress.toFixed(0)}%</p>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}
          </div>
          
          {/* Extracted Files */}
          {extractedFiles.length > 0 && (
            <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Extracted Files ({extractedFiles.length})</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {extractedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center flex-1 min-w-0">
                      <File className="w-4 h-4 text-gray-500 mr-3 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                      <button
                        onClick={() => downloadExtractedFile(file)}
                        className="text-accent hover:text-accent/80 p-1"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </ArchiveToolPageLayout>
  );
};

export default SevenZipSupportPage; 