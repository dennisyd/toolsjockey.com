import React, { useState, useCallback } from 'react';
import { LockClosedIcon, ExclamationTriangleIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import ToolPageLayout from '../layout/ToolPageLayout';

interface DecryptionMetadata {
  originalName: string;
  originalSize: number;
  encryptedAt: string;
  algorithm: string;
  salt: number[];
  iv: number[];
}

const FileDecryptor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [decryptedFile, setDecryptedFile] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<DecryptionMetadata | null>(null);

  // Generate a key from password using PBKDF2
  const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  // Decrypt file with AES-256-GCM
  const decryptFile = async (file: File, password: string): Promise<ArrayBuffer> => {
    const fileBuffer = await file.arrayBuffer();
    const fileText = new TextDecoder().decode(fileBuffer);
    
    // Split metadata and encrypted data
    const newlineIndex = fileText.indexOf('\n');
    if (newlineIndex === -1) {
      throw new Error('Invalid encrypted file format');
    }
    
    const metadataText = fileText.substring(0, newlineIndex);
    const encryptedDataText = fileText.substring(newlineIndex + 1);
    
    const metadata: DecryptionMetadata = JSON.parse(metadataText);
    setMetadata(metadata);
    
    // Convert encrypted data back to ArrayBuffer
    const encryptedData = new Uint8Array(encryptedDataText.length);
    for (let i = 0; i < encryptedDataText.length; i++) {
      encryptedData[i] = encryptedDataText.charCodeAt(i);
    }
    
    const salt = new Uint8Array(metadata.salt);
    const iv = new Uint8Array(metadata.iv);
    
    const key = await deriveKey(password, salt);
    
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    return decryptedData;
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      setDecryptedFile(null);
      setMetadata(null);
    }
  }, []);

  const handleDecrypt = async () => {
    if (!selectedFile || !password) {
      setError('Please select an encrypted file and enter the password');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const decryptedData = await decryptFile(selectedFile, password);
      
      const decryptedBlob = new Blob([decryptedData]);
      setDecryptedFile(decryptedBlob);
      setSuccess('File decrypted successfully! Download the decrypted file below.');
    } catch (err) {
      setError('Decryption failed. Please check your password and ensure the file was encrypted with this tool.');
      console.error('Decryption error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (decryptedFile && metadata) {
      const url = URL.createObjectURL(decryptedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = metadata.originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPassword('');
    setDecryptedFile(null);
    setError(null);
    setSuccess(null);
    setMetadata(null);
  };

  return (
    <ToolPageLayout
      toolId="file-decryptor"
      title="File Decryptor"
      icon={LockClosedIcon}
      group="privacy"
    >
      <div className="max-w-2xl mx-auto">
        {/* Security Notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                🔒 Client-Side Decryption
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your file is decrypted entirely in your browser. The password and file never leave your device.
              </p>
            </div>
          </div>
        </div>

        {/* File Selection */}
        <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Select Encrypted File</h3>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
              accept="*/*"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer block"
            >
              <div className="text-gray-600 dark:text-gray-300 mb-2">
                {selectedFile ? (
                  <div>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      ✓ {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg">Click to select an encrypted file</p>
                    <p className="text-sm">or drag and drop</p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Password Input */}
        <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Decryption Password</h3>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the password used for encryption"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• Enter the same password used for encryption</p>
            <p>• The password is never stored or transmitted</p>
          </div>
        </div>

        {/* File Metadata */}
        {metadata && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">File Information</h3>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p><strong>Original Name:</strong> {metadata.originalName}</p>
              <p><strong>Original Size:</strong> {(metadata.originalSize / 1024 / 1024).toFixed(2)} MB</p>
              <p><strong>Encrypted At:</strong> {new Date(metadata.encryptedAt).toLocaleString()}</p>
              <p><strong>Algorithm:</strong> {metadata.algorithm}</p>
            </div>
          </div>
        )}

        {/* Security Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Important Security Notice
              </h3>
              <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                <li>• Only decrypt files from trusted sources</li>
                <li>• Clear browser cache after decryption for additional security</li>
                <li>• Store decrypted files in a secure location</li>
                <li>• The original password is required for decryption</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleDecrypt}
            disabled={!selectedFile || !password || isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Decrypting...
              </>
            ) : (
              <>
                <LockClosedIcon className="w-5 h-5" />
                Decrypt File
              </>
            )}
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-green-700 dark:text-green-300">{success}</p>
          </div>
        )}

        {/* Download Section */}
        {decryptedFile && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Download Decrypted File</h3>
            <button
              onClick={handleDownload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Download Decrypted File
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              The file will be downloaded with its original name and format.
            </p>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default FileDecryptor; 