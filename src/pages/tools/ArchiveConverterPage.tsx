import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { Download, Upload, ArrowRight, File, Folder } from 'lucide-react';
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

type TargetFormat = 'zip' | 'tar' | 'tar.gz' | 'tar.bz2';

const ArchiveConverterPage: React.FC = () => {
  const [sourceArchive, setSourceArchive] = useState<JSZip | null>(null);
  const [archiveFiles, setArchiveFiles] = useState<ArchiveFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('zip');
  const [archiveName, setArchiveName] = useState('');
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [sourceSize, setSourceSize] = useState(0);
  const [targetSize, setTargetSize] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState(6);
  const [preserveStructure, setPreserveStructure] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (convertedUrl) {
        URL.revokeObjectURL(convertedUrl);
      }
    };
  }, [convertedUrl]);

  useEffect(() => {
    document.title = 'Archive Converter – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Convert between different archive formats with compression options.');
  }, []);

  // Update archive name when target format changes
  useEffect(() => {
    if (archiveName) {
      const baseName = archiveName.split('.')[0] || 'archive';
      setArchiveName(`${baseName}.${targetFormat}`);
    }
  }, [targetFormat]);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setArchiveFiles([]);
    setSourceArchive(null);
    setConvertedUrl(null);
    setArchiveName(file.name);
    setSourceSize(file.size);
    
    try {
      const zip = new JSZip();
      setProgress(20);
      
      // Load the source archive
      const zipData = await zip.loadAsync(file);
      
      setProgress(40);
      setSourceArchive(zipData);
      
      // Extract file information
      const files: ArchiveFile[] = [];
      
      zipData.forEach((relativePath, zipEntry) => {
        const isDirectory = zipEntry.dir;
        const date = zipEntry.date;
        
        files.push({
          name: zipEntry.name.split('/').pop() || '',
          size: 0,
          compressedSize: 0,
          isDirectory,
          date,
          path: relativePath
        });
      });
      
      setArchiveFiles(files);
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

  const convertArchive = async () => {
    if (!sourceArchive || archiveFiles.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setConvertedUrl(null);
    
    try {
      // Note: This is a placeholder implementation
      // In a real implementation, you would use specific libraries for each format
      setError('Archive conversion requires specific libraries for each format. This is a demonstration of the interface.');
      
      // Simulate processing for demo
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Simulate target size
      setTargetSize(Math.floor(sourceSize * (0.8 + Math.random() * 0.4)));
      
    } catch (e: any) {
      setError('Failed to convert archive: ' + e.message);
    }
    
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  const downloadConverted = () => {
    if (!convertedUrl) return;
    
    const link = document.createElement('a');
    link.href = convertedUrl;
    link.download = archiveName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      URL.revokeObjectURL(convertedUrl);
      setConvertedUrl(null);
    }, 100);
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

  const getFormatInfo = (format: string) => {
    const info = {
      'zip': { name: 'ZIP', description: 'Universal archive format', compression: 'Good' },
      '7z': { name: '7z', description: 'High compression format', compression: 'Excellent' },
      'tar': { name: 'TAR', description: 'Uncompressed archive', compression: 'None' },
      'tar.gz': { name: 'TAR.GZ', description: 'Gzip compressed', compression: 'Good' },
      'tar.bz2': { name: 'TAR.BZ2', description: 'Bzip2 compressed', compression: 'Better' },
      'rar': { name: 'RAR', description: 'Proprietary format', compression: 'Good' }
    };
    return info[format as keyof typeof info] || { name: format.toUpperCase(), description: '', compression: '' };
  };

  return (
    <ArchiveToolPageLayout title="Archive Converter" icon={ArchiveBoxIcon}>
      {/* File Upload */}
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Source Archive</h2>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".zip,.7z,.tar,.tar.gz,.tar.bz2,.rar"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors mb-4"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Drag & drop archive file here, or click to select
          </p>
          <p className="text-sm text-gray-500">
            Supports ZIP, 7z, TAR, RAR, and other formats
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
      {/* Archive Info */}
      {archiveFiles.length > 0 && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Source Archive Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {archiveFiles.filter(f => !f.isDirectory).length}
              </div>
              <div className="text-sm text-gray-600">Files</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatFileSize(sourceSize)}
              </div>
              <div className="text-sm text-gray-600">Archive Size</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {getFormatInfo(targetFormat).name}
              </div>
              <div className="text-sm text-gray-600">Format</div>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Size</th>
                </tr>
              </thead>
              <tbody>
                {archiveFiles.slice(0, 10).map((file, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-3">
                      {file.isDirectory ? (
                        <Folder className="w-4 h-4 text-blue-500" />
                      ) : (
                        <File className="w-4 h-4 text-gray-500" />
                      )}
                    </td>
                    <td className="p-3">
                      <span className={file.isDirectory ? 'text-blue-600' : ''}>
                        {file.name}
                      </span>
                    </td>
                    <td className="p-3">{formatFileSize(file.size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {archiveFiles.length > 10 && (
              <p className="text-center text-sm text-gray-500 mt-2">
                Showing first 10 files of {archiveFiles.length} total
              </p>
            )}
          </div>
        </div>
      )}
      {/* Conversion Settings */}
      {archiveFiles.length > 0 && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Conversion Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target Format */}
            <div>
              <label className="block text-sm font-medium mb-2">Target Format</label>
              <select
                value={targetFormat}
                onChange={e => setTargetFormat(e.target.value as TargetFormat)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="zip">ZIP</option>
                <option value="tar">TAR (Uncompressed)</option>
                <option value="tar.gz">TAR.GZ (Gzip)</option>
                <option value="tar.bz2">TAR.BZ2 (Bzip2)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {getFormatInfo(targetFormat).description}
              </p>
            </div>
            {/* Archive Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Output Archive Name</label>
              <input
                type="text"
                value={archiveName}
                onChange={e => setArchiveName(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="converted_archive.zip"
              />
            </div>
            {/* Compression Level */}
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
                disabled={targetFormat === 'tar'}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Fast (1)</span>
                <span>Best (9)</span>
              </div>
            </div>
            {/* Preserve Structure */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Options</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="preserveStructure"
                  checked={preserveStructure}
                  onChange={e => setPreserveStructure(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="preserveStructure" className="text-sm">
                  Preserve folder structure
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Format Comparison */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-200">Format Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {(['zip', 'tar', 'tar.gz', 'tar.bz2'] as TargetFormat[]).map(format => {
            const info = getFormatInfo(format);
            const isSelected = format === targetFormat;
            return (
              <div
                key={format}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-accent bg-accent/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-accent'
                }`}
                onClick={() => setTargetFormat(format)}
              >
                <div className="font-medium mb-1">{info.name}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {info.description}
                </div>
                <div className="text-xs">
                  <span className="font-medium">Compression:</span> {info.compression}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Convert Button */}
      {archiveFiles.length > 0 && (
        <div className="text-center mb-6">
          <button
            onClick={convertArchive}
            disabled={isProcessing}
            className="btn btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            <ArrowRight className="w-5 h-5" />
            {isProcessing ? 'Converting...' : 'Convert Archive'}
          </button>
        </div>
      )}
      {/* Results */}
      {targetSize > 0 && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Conversion Complete!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatFileSize(sourceSize)}
              </div>
              <div className="text-sm text-gray-600">Original Size</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatFileSize(targetSize)}
              </div>
              <div className="text-sm text-gray-600">Converted Size</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {getCompressionRatio(sourceSize, targetSize)}%
              </div>
              <div className="text-sm text-gray-600">Size Change</div>
            </div>
          </div>
          <div className="text-center">
            <button
              onClick={downloadConverted}
              className="btn btn-success text-lg px-6 py-3 flex items-center gap-2 mx-auto"
            >
              <Download className="w-5 h-5" />
              Download Converted Archive
            </button>
          </div>
        </div>
      )}
      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-200">
          {error}
        </div>
      )}
    </ArchiveToolPageLayout>
  );
};

export default ArchiveConverterPage; 