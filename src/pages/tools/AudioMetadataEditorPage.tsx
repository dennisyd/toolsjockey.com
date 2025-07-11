import React, { useState } from 'react';
import { Download, Upload, FileText } from 'lucide-react';
function writeID3v1Tag(buffer: ArrayBuffer, metadata: { title: string; artist: string; album: string }): Blob {
  // ID3v1 tag is 128 bytes at the end of the file
  const tag = new Uint8Array(128);
  tag.set([0x54, 0x41, 0x47]); // 'TAG'
  const writeField = (str: string, offset: number, length: number) => {
    for (let i = 0; i < length; i++) {
      tag[offset + i] = i < str.length ? str.charCodeAt(i) : 0;
    }
  };
  writeField(metadata.title || '', 3, 30);
  writeField(metadata.artist || '', 33, 30);
  writeField(metadata.album || '', 63, 30);
  // Year, Comment, Genre left blank
  // Copy original file minus any existing ID3v1 tag
  let audio = new Uint8Array(buffer);
  if (
    audio.length > 128 &&
    audio[audio.length - 128] === 0x54 &&
    audio[audio.length - 127] === 0x41 &&
    audio[audio.length - 126] === 0x47
  ) {
    audio = audio.slice(0, audio.length - 128);
  }
  const combined = new Uint8Array(audio.length + 128);
  combined.set(audio, 0);
  combined.set(tag, audio.length);
  return new Blob([combined], { type: 'audio/mp3' });
}

const AudioMetadataEditorPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({ title: '', artist: '', album: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = async (f: File) => {
    if (!f.type.startsWith('audio/')) {
      setError('Please upload a supported audio file.');
      return;
    }
    if (f.size > 100 * 1024 * 1024) {
      setError('File too large. Max 100MB.');
      return;
    }
    setFile(f);
    setError(null);
    setProgress(0);
    setOutputUrl(null);
    setMetadata({ title: '', artist: '', album: '' });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      setProgress(25);
      const arrayBuffer = await file.arrayBuffer();
      setProgress(50);

      // Create new file with metadata
      const newBlob = writeID3v1Tag(arrayBuffer, metadata);
      setProgress(75);

      const url = URL.createObjectURL(newBlob);
      setOutputUrl(url);
      setProgress(100);
      setError(null);

    } catch (err) {
      setError('Failed to process file: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = () => {
    if (outputUrl && file) {
      const link = document.createElement('a');
      link.href = outputUrl;
      link.download = `edited_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-primary-light rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Audio Metadata Editor</h2>
        <p className="text-gray-600 dark:text-gray-300">Edit audio file metadata (title, artist, album)</p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload Audio File
        </label>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            file ? 'border-green-300 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 hover:border-blue-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {file ? (
            <div className="space-y-4">
              <FileText className="w-12 h-12 text-green-500 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Drop your audio file here or click to browse
                </p>
                <p className="text-sm text-gray-500">Supports MP3, WAV, and other audio formats</p>
              </div>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Select Audio File
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Metadata Editor */}
      {file && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Edit Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Artist
              </label>
              <input
                type="text"
                value={metadata.artist}
                onChange={(e) => setMetadata({ ...metadata, artist: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter artist"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Album
              </label>
              <input
                type="text"
                value={metadata.album}
                onChange={(e) => setMetadata({ ...metadata, album: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter album"
              />
            </div>
          </div>
        </div>
      )}

      {/* Process Button */}
      {file && (
        <div className="mb-6">
          <button
            onClick={processFile}
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
                <FileText className="w-5 h-5" />
                <span>Process File</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mb-6">
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
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Download Section */}
      {outputUrl && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
            File Processed Successfully!
          </h3>
          <button
            onClick={downloadFile}
            className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Edited File</span>
          </button>
        </div>
      )}

      {/* Information */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          How it works
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Upload an audio file (MP3, WAV, etc.)</li>
          <li>• Edit the metadata fields (title, artist, album)</li>
          <li>• Process the file to embed the new metadata</li>
          <li>• Download the file with updated metadata</li>
          <li>• All processing happens securely in your browser</li>
        </ul>
      </div>
    </div>
  );
};

export default AudioMetadataEditorPage; 