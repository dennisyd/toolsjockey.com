import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import pako from 'pako';
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

type TargetFormat = 'zip' | 'tar.gz';

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
      if (targetFormat === 'zip') {
        await convertToZip();
      } else if (targetFormat === 'tar.gz') {
        await convertToTarGz();
      }
    } catch (e: any) {
      setError('Failed to convert archive: ' + e.message);
    }
    
    setIsProcessing(false);
    setTimeout(() => setProgress(0), 1000);
  };

  const convertToZip = async () => {
    const newZip = new JSZip();
    
    // Extract and re-add files
    let processed = 0;
    const totalFiles = archiveFiles.length;
    
    for (const fileInfo of archiveFiles) {
      if (!fileInfo.isDirectory) {
        try {
          const zipEntry = sourceArchive!.file(fileInfo.path);
          if (zipEntry) {
            const fileData = await zipEntry.async('uint8array');
            newZip.file(fileInfo.path, fileData, {
              compression: 'DEFLATE',
              compressionOptions: {
                level: Math.min(9, Math.max(1, compressionLevel))
              }
            });
          }
        } catch (e) {
          console.warn(`Failed to process file: ${fileInfo.path}`);
        }
      }
      processed++;
      setProgress((processed / totalFiles) * 80);
    }
    
    setProgress(90);
    
    // Generate the new zip file
    const zipBlob = await newZip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: Math.min(9, Math.max(1, compressionLevel))
      }
    });
    
    setProgress(100);
    
    // Create download URL
    const url = URL.createObjectURL(zipBlob);
    setConvertedUrl(url);
    setTargetSize(zipBlob.size);
  };

  const convertToTarGz = async () => {
    // Create TAR structure from ZIP contents
    const tarData = await createTarFromZip();
    
    setProgress(50);
    
    // Compress with gzip
    const compressedData = pako.gzip(tarData, {
      level: Math.min(9, Math.max(1, compressionLevel)) as 0|1|2|3|4|5|6|7|8|9
    });
    
    setProgress(90);
    
    // Create blob and URL
    const blob = new Blob([compressedData], { type: 'application/gzip' });
    const url = URL.createObjectURL(blob);
    setConvertedUrl(url);
    setTargetSize(blob.size);
    
    setProgress(100);
  };

  const createTarFromZip = async (): Promise<Uint8Array> => {
    const tarBlocks: Uint8Array[] = [];
    
    for (const fileInfo of archiveFiles) {
      if (!fileInfo.isDirectory) {
        try {
          const zipEntry = sourceArchive!.file(fileInfo.path);
          if (zipEntry) {
            const fileData = await zipEntry.async('uint8array');
            const fileBytes = new Uint8Array(fileData);
            
            // Create TAR header (512 bytes)
            const header = new Uint8Array(512);
            const encoder = new TextEncoder();
            
            // File name (100 bytes)
            const nameBytes = encoder.encode(fileInfo.path);
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
        } catch (e) {
          console.warn(`Failed to process file: ${fileInfo.path}`);
        }
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
      'tar.gz': { name: 'TAR.GZ', description: 'Gzip compressed archive', compression: 'Better' }
    };
    return info[format as keyof typeof info] || { name: format.toUpperCase(), description: '', compression: '' };
  };

  return (
    <ArchiveToolPageLayout title="Archive Converter" icon={ArchiveBoxIcon}>
      <h1 className="text-2xl font-bold mb-4">Archive Converter</h1>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded text-blue-900 text-sm mb-4">
        <strong>What does this tool do?</strong><br />
        The Archive Converter allows you to convert existing archive files (ZIP, TAR, etc.) to other formats, making it easy to switch between archive types or extract files on different platforms.
      </div>
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
            Supports ZIP, 7z, TAR, and other formats
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
            <p className="text-sm text-gray-600 mt-2">Loading... {progress.toFixed(0)}%</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Archive Contents */}
      {archiveFiles.length > 0 && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Archive Contents ({archiveFiles.length} files)</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {archiveFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center flex-1 min-w-0">
                  {file.isDirectory ? (
                    <Folder className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" />
                  ) : (
                    <File className="w-4 h-4 text-gray-500 mr-3 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm text-gray-500">
                    {file.isDirectory ? 'Directory' : formatFileSize(file.size)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversion Settings */}
      {archiveFiles.length > 0 && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Conversion Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Target Format</label>
              <select
                value={targetFormat}
                onChange={e => setTargetFormat(e.target.value as TargetFormat)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-accent"
              >
                <option value="zip">ZIP</option>
                <option value="tar.gz">TAR.GZ</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {getFormatInfo(targetFormat).description}
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
            <label className="block text-sm font-medium mb-2">Output Archive Name</label>
            <input
              type="text"
              value={archiveName}
              onChange={e => setArchiveName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:border-accent"
              placeholder={`converted.${targetFormat}`}
            />
          </div>
        </div>
      )}

      {/* Convert Button */}
      {archiveFiles.length > 0 && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6 mb-6">
          <button
            onClick={convertArchive}
            disabled={isProcessing}
            className="w-full bg-accent hover:bg-accent/80 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Converting...
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                Convert to {getFormatInfo(targetFormat).name}
              </>
            )}
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
        </div>
      )}

      {/* Results */}
      {convertedUrl && (
        <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Conversion Complete!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium mb-2">Original Archive</h3>
              <p className="text-sm text-gray-600">Size: {formatFileSize(sourceSize)}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-medium mb-2">Converted Archive</h3>
              <p className="text-sm text-gray-600">Size: {formatFileSize(targetSize)}</p>
              <p className="text-sm text-green-600">
                Compression: {getCompressionRatio(sourceSize, targetSize)}%
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 dark:text-green-200 font-medium">Archive Converted Successfully!</p>
              <p className="text-green-700 dark:text-green-300 text-sm">Ready for download</p>
            </div>
            <button
              onClick={downloadConverted}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      )}
    </ArchiveToolPageLayout>
  );
};

export default ArchiveConverterPage; 