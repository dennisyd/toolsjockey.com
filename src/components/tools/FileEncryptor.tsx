import React, { useState, useCallback } from 'react';
import { LockClosedIcon, ExclamationTriangleIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import ToolPageLayout from '../layout/ToolPageLayout';

interface EncryptionResult {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  salt: Uint8Array;
}

const FileEncryptor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [encryptedFile, setEncryptedFile] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  // Encrypt file with AES-256-GCM
  const encryptFile = async (file: File, password: string): Promise<EncryptionResult> => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await deriveKey(password, salt);
    const fileBuffer = await file.arrayBuffer();
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      fileBuffer
    );

    return { encryptedData, iv, salt };
  };

  // Helper to convert ArrayBuffer to base64
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      setEncryptedFile(null);
    }
  }, []);

  const handleEncrypt = async () => {
    if (!selectedFile || !password) {
      setError('Please select a file and enter a password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await encryptFile(selectedFile, password);
      
      // Create encrypted file with metadata
      const metadata = {
        originalName: selectedFile.name,
        originalSize: selectedFile.size,
        encryptedAt: new Date().toISOString(),
        algorithm: 'AES-256-GCM',
        salt: Array.from(result.salt),
        iv: Array.from(result.iv)
      };

      const encryptedBlob = new Blob([
        JSON.stringify(metadata),
        '\n',
        arrayBufferToBase64(result.encryptedData)
      ], { type: 'application/octet-stream' });

      setEncryptedFile(encryptedBlob);
      setSuccess('File encrypted successfully! Download the encrypted file below.');
    } catch (err) {
      setError('Encryption failed. Please try again.');
      console.error('Encryption error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (encryptedFile) {
      const url = URL.createObjectURL(encryptedFile);
      const a = document.createElement('a');
      a.href = url;
      // Use .encrypted extension after the original extension
      let downloadName = selectedFile?.name || 'file';
      downloadName = downloadName + '.encrypted';
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPassword('');
    setEncryptedFile(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <ToolPageLayout
      toolId="file-encryptor"
      title="File Encryptor"
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
                🔒 Client-Side Encryption
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your file is encrypted entirely in your browser using AES-256-GCM. 
                The password and file never leave your device.
              </p>
            </div>
          </div>
        </div>

        {/* File Selection */}
        <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Select File to Encrypt</h3>
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
                    <p className="text-lg">Click to select a file</p>
                    <p className="text-sm">or drag and drop</p>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Password Input */}
        <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Encryption Password</h3>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password (min 8 characters)"
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
            <p>• Use a strong, unique password</p>
            <p>• Store this password securely - it cannot be recovered</p>
            <p>• The password is never stored or transmitted</p>
          </div>
        </div>

        {/* Security Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Important Security Notice
              </h3>
              <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                <li>• Keep your password safe - there's no way to recover encrypted files without it</li>
                <li>• Clear browser cache after encryption for additional security</li>
                <li>• Store encrypted files in a secure location</li>
                <li>• Consider backing up important files before encryption</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleEncrypt}
            disabled={!selectedFile || !password || isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Encrypting...
              </>
            ) : (
              <>
                <LockClosedIcon className="w-5 h-5" />
                Encrypt File
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
        {encryptedFile && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  ⚠️ Important: Encrypted File Format
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  The encrypted file will have a <b>.encrypted</b> extension (e.g., <b>report.xlsx.encrypted</b>).<br />
                  <b>Do not try to open it directly in Excel, Word, or other programs.</b><br />
                  To restore the original file, upload it to the Decryptor tool on ToolsJockey.com and enter your password.
                </p>
              </div>
            </div>
          </div>
        )}
        {encryptedFile && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Download Encrypted File</h3>
            <button
              onClick={handleDownload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Download Encrypted File
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              The encrypted file contains all necessary metadata for decryption.
            </p>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
};

export default FileEncryptor; 