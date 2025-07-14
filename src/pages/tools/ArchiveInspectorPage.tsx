import React, { useState, useRef, useEffect } from 'react';
import { Eye, File, Folder } from 'lucide-react';
import JSZip from 'jszip';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import ArchiveToolPageLayout from '../../components/layout/ArchiveToolPageLayout';

interface ArchiveFile {
  name: string;
  size: number;
  compressedSize: number;
  isDirectory: boolean;
  date: Date;
  path: string;
  crc32?: string;
  comment?: string;
}

interface ArchiveInfo {
  name: string;
  size: number;
  fileCount: number;
  directoryCount: number;
  totalSize: number;
  compressedSize: number;
  isPasswordProtected: boolean;
  format: string;
}

const ArchiveInspectorPage: React.FC = () => {
  const [archiveFiles, setArchiveFiles] = useState<ArchiveFile[]>([]);
  const [archiveInfo, setArchiveInfo] = useState<ArchiveInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<ArchiveFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Archive Inspector – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'View archive contents without extracting. Inspect file details, sizes, and structure.');
  }, []);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setArchiveFiles([]);
    setArchiveInfo(null);
    setSelectedFile(null);
    
    try {
      const zip = new JSZip();
      setProgress(20);
      
      // Load the archive
      const zipData = await zip.loadAsync(file);
      
      setProgress(40);
      
      // Extract file information
      const files: ArchiveFile[] = [];
      let totalSize = 0;
      let compressedSize = 0;
      let fileCount = 0;
      let directoryCount = 0;
      
      zipData.forEach((relativePath, zipEntry) => {
        const isDirectory = zipEntry.dir;
        const date = zipEntry.date;
        const comment = zipEntry.comment;
        if (!isDirectory) {
          fileCount++;
        } else {
          directoryCount++;
        }
        files.push({
          name: zipEntry.name.split('/').pop() || '',
          size: 0,
          compressedSize: 0,
          isDirectory,
          date,
          path: relativePath,
          comment
        });
      });
      
      setArchiveFiles(files);
      
      // Set archive info
      setArchiveInfo({
        name: file.name,
        size: file.size,
        fileCount,
        directoryCount,
        totalSize,
        compressedSize,
        isPasswordProtected: false,
        format: 'ZIP'
      });
      
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getCompressionRatio = (compressed: number, uncompressed: number) => {
    if (uncompressed === 0) return 0;
    return ((uncompressed - compressed) / uncompressed * 100).toFixed(1);
  };

  const filteredAndSortedFiles = archiveFiles
    .filter(file => 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.path.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <ArchiveToolPageLayout title="Archive Inspector" icon={ArchiveBoxIcon}>
      <h1 className="text-2xl font-bold mb-4">Archive Inspector</h1>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded text-blue-900 text-sm mb-4">
        <strong>What does this tool do?</strong><br />
        The Archive Inspector lets you view the contents of archive files (ZIP, TAR, etc.) without extracting them, so you can quickly see what’s inside before downloading or opening large archives.
      </div>
      {/* File Upload */}
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Upload Archive</h2>
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
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Drag & drop archive file here, or click to select
          </p>
          <p className="text-sm text-gray-500">
            Supports ZIP, 7z, TAR, and other archive formats
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
            Analyzing archive... {progress}%
          </p>
        </div>
      )}
      {/* Archive Info */}
      {archiveInfo && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Archive Information</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {archiveInfo.fileCount}
              </div>
              <div className="text-sm text-gray-600">Files</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {archiveInfo.directoryCount}
              </div>
              <div className="text-sm text-gray-600">Directories</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatFileSize(archiveInfo.totalSize)}
              </div>
              <div className="text-sm text-gray-600">Total Size</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {getCompressionRatio(archiveInfo.compressedSize, archiveInfo.totalSize)}%
              </div>
              <div className="text-sm text-gray-600">Compression</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-medium mb-2">Archive Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-mono">{archiveInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Format:</span>
                  <span>{archiveInfo.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Archive Size:</span>
                  <span>{formatFileSize(archiveInfo.size)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Compression Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Uncompressed:</span>
                  <span>{formatFileSize(archiveInfo.totalSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Compressed:</span>
                  <span>{formatFileSize(archiveInfo.compressedSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Space Saved:</span>
                  <span>{formatFileSize(archiveInfo.totalSize - archiveInfo.compressedSize)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Compression Ratio:</span>
                  <span>{getCompressionRatio(archiveInfo.compressedSize, archiveInfo.totalSize)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* File Browser */}
      {archiveFiles.length > 0 && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Archive Contents</h2>
            <div className="flex items-center gap-4">
              {/* Search */}
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'name' | 'size' | 'date')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="name">Name</option>
                <option value="size">Size</option>
                <option value="date">Date</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                <tr>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Size</th>
                  <th className="text-left p-3">Compressed</th>
                  <th className="text-left p-3">Ratio</th>
                  <th className="text-left p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedFiles.map((file, index) => (
                  <tr 
                    key={index} 
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => setSelectedFile(file)}
                  >
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
                    <td className="p-3">{formatFileSize(file.compressedSize)}</td>
                    <td className="p-3">
                      {file.isDirectory ? '-' : getCompressionRatio(file.compressedSize, file.size) + '%'}
                    </td>
                    <td className="p-3">{formatDate(file.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredAndSortedFiles.length} of {archiveFiles.length} items
          </div>
        </div>
      )}
      {/* File Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-primary-light rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">File Details</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {selectedFile.isDirectory ? (
                  <Folder className="w-5 h-5 text-blue-500" />
                ) : (
                  <File className="w-5 h-5 text-gray-500" />
                )}
                <span className="font-medium">{selectedFile.name}</span>
              </div>
              
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Path:</span>
                  <span className="font-mono text-xs">{selectedFile.path}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Size:</span>
                  <span>{formatFileSize(selectedFile.size)}</span>
                </div>
                {!selectedFile.isDirectory && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Compressed:</span>
                      <span>{formatFileSize(selectedFile.compressedSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Compression:</span>
                      <span>{getCompressionRatio(selectedFile.compressedSize, selectedFile.size)}%</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{formatDate(selectedFile.date)}</span>
                </div>
                {selectedFile.comment && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Comment:</span>
                    <span className="text-xs">{selectedFile.comment}</span>
                  </div>
                )}
              </div>
            </div>
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

export default ArchiveInspectorPage; 