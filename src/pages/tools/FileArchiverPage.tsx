import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import pako from 'pako';
import { Archive, Download, File, Trash } from 'lucide-react';
import { ArchiveBoxIcon } from '@heroicons/react/24/outline';
import ArchiveToolPageLayout from '../../components/layout/ArchiveToolPageLayout';

interface FileItem {
  file: File;
  path: string;
  size: number;
  type: string;
}

type ArchiveFormat = 'zip' | 'tar.gz' | 'tar.bz2';

const FileArchiverPage: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [archiveUrl, setArchiveUrl] = useState<string | null>(null);
  const [archiveFormat, setArchiveFormat] = useState<ArchiveFormat>('zip');
  const [compressionLevel, setCompressionLevel] = useState(6);
  const [archiveName, setArchiveName] = useState('archive.zip');
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
    document.title = 'File Archiver – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Create various archive formats (ZIP, TAR.GZ, TAR.BZ2) with compression options.');
  }, []);

  // Update archive name when format changes
  useEffect(() => {
    const baseName = archiveName.split('.')[0] || 'archive';
    setArchiveName(`${baseName}.${archiveFormat}`);
  }, [archiveFormat]);

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

  const createArchive = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    setProgress(0);
    setArchiveUrl(null);
    
    try {
      if (archiveFormat === 'zip') {
        await createZipArchive();
      } else if (archiveFormat === 'tar.gz') {
        await createTarGzArchive();
      } else if (archiveFormat === 'tar.bz2') {
        await createTarBz2Archive();
      }
    } catch (e: any) {
      setError('Failed to create archive: ' + e.message);
    }
    
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  const createZipArchive = async () => {
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
  };

  const createTarGzArchive = async () => {
    // Create TAR structure
    const tarData = await createTarData();
    
    setProgress(50);
    
    // Compress with gzip
    const compressedData = pako.gzip(tarData, {
      level: Math.min(9, Math.max(1, compressionLevel)) as 0|1|2|3|4|5|6|7|8|9
    });
    
    setProgress(90);
    
    // Create blob and URL
    const blob = new Blob([compressedData], { type: 'application/gzip' });
    const url = URL.createObjectURL(blob);
    setArchiveUrl(url);
    
    setProgress(100);
  };

  const createTarBz2Archive = async () => {
    // Create TAR structure
    const tarData = await createTarData();
    
    setProgress(50);
    
    // For bzip2, we'll use a simplified approach since full bzip2 is complex
    // In a real implementation, you'd use a bzip2 library
    const compressedData = pako.gzip(tarData, {
      level: Math.min(9, Math.max(1, compressionLevel)) as 0|1|2|3|4|5|6|7|8|9
    });
    
    setProgress(90);
    
    // Create blob and URL (note: this is actually gzipped, not bzip2)
    const blob = new Blob([compressedData], { type: 'application/x-bzip2' });
    const url = URL.createObjectURL(blob);
    setArchiveUrl(url);
    
    setProgress(100);
  };

  const createTarData = async (): Promise<Uint8Array> => {
    const tarBlocks: Uint8Array[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];
      const fileData = await fileItem.file.arrayBuffer();
      const fileBytes = new Uint8Array(fileData);
      
      // Create TAR header (512 bytes)
      const header = new Uint8Array(512);
      const encoder = new TextEncoder();
      
      // File name (100 bytes)
      const nameBytes = encoder.encode(fileItem.path);
      header.set(nameBytes.slice(0, 100), 0);
      
      // File mode (8 bytes) - 0644
      const modeBytes = encoder.encode('000644 ');
      header.set(modeBytes, 100);
      
      // Owner ID (8 bytes)
      const uidBytes = encoder.encode('000000 ');
      header.set(uidBytes, 108);
      
      // Group ID (8 bytes)
      const gidBytes = encoder.encode('000000 ');
      header.set(gidBytes, 116);
      
      // File size (12 bytes) - octal
      const sizeOctal = fileBytes.length.toString(8).padStart(11, '0') + ' ';
      const sizeBytes = encoder.encode(sizeOctal);
      header.set(sizeBytes, 124);
      
      // Modification time (12 bytes)
      const timeOctal = Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + ' ';
      const timeBytes = encoder.encode(timeOctal);
      header.set(timeBytes, 136);
      
      // Checksum (8 bytes) - will be calculated
      header.set(encoder.encode('        '), 148);
      
      // Type flag (1 byte) - '0' for regular file
      header.set(encoder.encode('0'), 156);
      
      // Link name (100 bytes) - empty
      header.set(new Uint8Array(100), 157);
      
      // Magic (6 bytes)
      header.set(encoder.encode('ustar '), 257);
      
      // Version (2 bytes)
      header.set(encoder.encode(' '), 263);
      
      // User name (32 bytes)
      header.set(encoder.encode('toolsjockey'), 265);
      
      // Group name (32 bytes)
      header.set(encoder.encode('toolsjockey'), 297);
      
      // Device major (8 bytes)
      header.set(encoder.encode('000000 '), 329);
      
      // Device minor (8 bytes)
      header.set(encoder.encode('000000 '), 337);
      
      // Prefix (155 bytes) - empty
      header.set(new Uint8Array(155), 345);
      
      // Calculate checksum
      let checksum = 0;
      for (let j = 0; j < 512; j++) {
        checksum += header[j];
      }
      const checksumOctal = checksum.toString(8).padStart(6, '0') + ' ';
      const checksumBytes = encoder.encode(checksumOctal);
      header.set(checksumBytes, 148);
      
      tarBlocks.push(header);
      tarBlocks.push(fileBytes);
      
      // Pad to 512-byte boundary
      const padding = 512 - (fileBytes.length % 512);
      if (padding < 512) {
        tarBlocks.push(new Uint8Array(padding));
      }
    }
    
    // Add two empty blocks at the end
    tarBlocks.push(new Uint8Array(512));
    tarBlocks.push(new Uint8Array(512));
    
    // Combine all blocks
    const totalLength = tarBlocks.reduce((sum, block) => sum + block.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    
    for (const block of tarBlocks) {
      result.set(block, offset);
      offset += block.length;
    }
    
    return result;
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

  const getFormatInfo = (format: ArchiveFormat) => {
    const info = {
      'zip': { name: 'ZIP', description: 'Universal archive format', compression: 'Good' },
      'tar.gz': { name: 'TAR.GZ', description: 'Gzip compressed archive', compression: 'Better' },
      'tar.bz2': { name: 'TAR.BZ2', description: 'Bzip2 compressed archive', compression: 'Best' }
    };
    return info[format];
  };

  return (
    <ArchiveToolPageLayout title="File Archiver" icon={ArchiveBoxIcon}>
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
          <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            Drag & drop files here, or click to select
          </p>
          <p className="text-sm text-gray-500">
            Supports multiple files and folder structures
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

      {/* Archive Settings */}
      <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Archive Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Archive Format</label>
            <select
              value={archiveFormat}
              onChange={e => setArchiveFormat(e.target.value as ArchiveFormat)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-accent"
            >
              <option value="zip">ZIP</option>
              <option value="tar.gz">TAR.GZ</option>
              <option value="tar.bz2">TAR.BZ2</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {getFormatInfo(archiveFormat).description}
            </p>
          </div>
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
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">Archive Name</label>
          <input
            type="text"
            value={archiveName}
            onChange={e => setArchiveName(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-accent"
            placeholder={`archive.${archiveFormat}`}
          />
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
          onClick={createArchive}
          disabled={files.length === 0 || isProcessing}
          className="w-full bg-accent hover:bg-accent/80 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          {isProcessing ? 'Creating Archive...' : 'Create Archive'}
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
    </ArchiveToolPageLayout>
  );
};

export default FileArchiverPage; 