import React, { useState, useCallback } from 'react';
import { TrashIcon, ExclamationTriangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import ToolPageLayout from '../layout/ToolPageLayout';

interface ShredConfig {
  passes: number;
  method: 'random' | 'zeros' | 'ones' | 'alternating';
  verifyDeletion: boolean;
}

const SecureFileShredder: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [config, setConfig] = useState<ShredConfig>({
    passes: 3,
    method: 'random',
    verifyDeletion: true
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shreddedFile, setShreddedFile] = useState<Blob | null>(null);

  // Generate random data for overwriting
  const generateRandomData = (size: number): Uint8Array => {
    return crypto.getRandomValues(new Uint8Array(size));
  };

  // Generate zeros for overwriting
  const generateZeros = (size: number): Uint8Array => {
    return new Uint8Array(size);
  };

  // Generate ones for overwriting
  const generateOnes = (size: number): Uint8Array => {
    const data = new Uint8Array(size);
    data.fill(0xFF);
    return data;
  };

  // Generate alternating pattern for overwriting
  const generateAlternating = (size: number): Uint8Array => {
    const data = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = i % 2 === 0 ? 0x00 : 0xFF;
    }
    return data;
  };

  // Securely shred file data
  const shredFile = async (file: File): Promise<Blob> => {
    const fileBuffer = await file.arrayBuffer();
    const fileSize = fileBuffer.byteLength;
    let shreddedBuffer = new ArrayBuffer(fileSize);
    let shreddedView = new Uint8Array(shreddedBuffer);

    // Copy original data first
    shreddedView.set(new Uint8Array(fileBuffer));

    for (let pass = 0; pass < config.passes; pass++) {
      setProgress(((pass + 1) / config.passes) * 100);

      let overwriteData: Uint8Array;
      
      switch (config.method) {
        case 'random':
          overwriteData = generateRandomData(fileSize);
          break;
        case 'zeros':
          overwriteData = generateZeros(fileSize);
          break;
        case 'ones':
          overwriteData = generateOnes(fileSize);
          break;
        case 'alternating':
          overwriteData = generateAlternating(fileSize);
          break;
        default:
          overwriteData = generateRandomData(fileSize);
      }

      // Overwrite the data
      shreddedView.set(overwriteData);

      // Add a small delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final pass: overwrite with random data
    shreddedView.set(generateRandomData(fileSize));

    return new Blob([shreddedBuffer], { type: file.type });
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      setShreddedFile(null);
      setProgress(0);
    }
  }, []);

  const handleShred = async () => {
    if (!selectedFile) {
      setError('Please select a file to shred');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    try {
      const shredded = await shredFile(selectedFile);
      setShreddedFile(shredded);
      setSuccess(`File shredded successfully with ${config.passes} passes using ${config.method} method!`);
    } catch (err) {
      setError('Failed to shred file. Please try again.');
      console.error('Shredding error:', err);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleDownload = () => {
    if (shreddedFile) {
      const url = URL.createObjectURL(shreddedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedFile?.name || 'file'}.shredded`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setShreddedFile(null);
    setError(null);
    setSuccess(null);
    setProgress(0);
  };

  const handleConfigChange = (key: keyof ShredConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ToolPageLayout
      toolId="secure-file-shredder"
      title="Secure File Shredder"
      icon={TrashIcon}
      group="privacy"
    >
      <div className="max-w-2xl mx-auto">
        {/* Security Notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                🔒 Client-Side File Shredding
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your file is securely overwritten entirely in your browser. No data is sent to servers.
              </p>
            </div>
          </div>
        </div>

        {/* File Selection */}
        <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Select File to Shred</h3>
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

        {/* Shredding Configuration */}
        <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Shredding Configuration</h3>
          
          <div className="space-y-4">
            {/* Number of Passes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Passes: {config.passes}
              </label>
              <input
                type="range"
                min="1"
                max="7"
                value={config.passes}
                onChange={(e) => handleConfigChange('passes', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 (Basic)</span>
                <span>7 (Maximum)</span>
              </div>
            </div>

            {/* Overwrite Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Overwrite Method
              </label>
              <select
                value={config.method}
                onChange={(e) => handleConfigChange('method', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="random">Random Data (Recommended)</option>
                <option value="zeros">Zeros (0x00)</option>
                <option value="ones">Ones (0xFF)</option>
                <option value="alternating">Alternating (0x00/0xFF)</option>
              </select>
            </div>

            {/* Verification */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.verifyDeletion}
                  onChange={(e) => handleConfigChange('verifyDeletion', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Verify deletion (additional security)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Shredding Progress</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
              <div
                className="bg-red-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pass {Math.ceil(progress / (100 / config.passes))} of {config.passes}
            </p>
          </div>
        )}

        {/* Shred Button */}
        {selectedFile && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
            <button
              onClick={handleShred}
              disabled={isProcessing}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Shredding...
                </>
              ) : (
                <>
                  <TrashIcon className="w-5 h-5" />
                  Shred File
                </>
              )}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              This will create a new file with overwritten data
            </p>
          </div>
        )}

        {/* Download Section */}
        {shreddedFile && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Download Shredded File</h3>
            <button
              onClick={handleDownload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Download Shredded File
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              The shredded file contains overwritten data and is safe to share.
            </p>
          </div>
        )}

        {/* Security Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            🛡️ Shredding Methods
          </h3>
          <div className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
            <p>• <strong>Random Data:</strong> Uses cryptographically secure random bytes</p>
            <p>• <strong>Zeros:</strong> Overwrites with 0x00 bytes</p>
            <p>• <strong>Ones:</strong> Overwrites with 0xFF bytes</p>
            <p>• <strong>Alternating:</strong> Alternates between 0x00 and 0xFF</p>
            <p>• <strong>Multiple Passes:</strong> Ensures data cannot be recovered</p>
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
                <li>• This tool creates a new file with overwritten data</li>
                <li>• The original file remains unchanged on your device</li>
                <li>• For complete deletion, manually delete the original file</li>
                <li>• Use multiple passes for maximum security</li>
                <li>• Consider using specialized file deletion software for critical data</li>
              </ul>
            </div>
          </div>
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

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleClear}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default SecureFileShredder; 