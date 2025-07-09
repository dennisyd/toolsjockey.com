import React, { useState } from 'react';
import { BoltIcon, ClipboardDocumentIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ToolPageLayout from '../layout/ToolPageLayout';

interface RandomDataConfig {
  type: 'password' | 'hex' | 'base64' | 'uuid' | 'bytes';
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}

const RandomDataGenerator: React.FC = () => {
  const [config, setConfig] = useState<RandomDataConfig>({
    type: 'password',
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true
  });
  const [generatedData, setGeneratedData] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate cryptographically secure random bytes
  const getRandomBytes = (length: number): Uint8Array => {
    return crypto.getRandomValues(new Uint8Array(length));
  };

  // Convert bytes to hex string
  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Convert bytes to base64 string
  const bytesToBase64 = (bytes: Uint8Array): string => {
    const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
    return btoa(binary);
  };

  // Generate UUID v4
  const generateUUID = (): string => {
    const bytes = getRandomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant
    
    const hex = bytesToHex(bytes);
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  };

  // Generate password
  const generatePassword = (): string => {
    const chars = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    let availableChars = '';
    if (config.includeUppercase) availableChars += chars.uppercase;
    if (config.includeLowercase) availableChars += chars.lowercase;
    if (config.includeNumbers) availableChars += chars.numbers;
    if (config.includeSymbols) availableChars += chars.symbols;

    if (availableChars === '') {
      availableChars = chars.lowercase + chars.numbers;
    }

    // Remove similar characters if requested
    if (config.excludeSimilar) {
      availableChars = availableChars.replace(/[0O1Il]/g, '');
    }

    const bytes = getRandomBytes(config.length);
    let password = '';
    
    for (let i = 0; i < config.length; i++) {
      password += availableChars[bytes[i] % availableChars.length];
    }

    return password;
  };

  const generateData = () => {
    let result = '';
    
    switch (config.type) {
      case 'password':
        result = generatePassword();
        break;
      case 'hex':
        result = bytesToHex(getRandomBytes(config.length));
        break;
      case 'base64':
        result = bytesToBase64(getRandomBytes(config.length));
        break;
      case 'uuid':
        result = generateUUID();
        break;
      case 'bytes':
        result = Array.from(getRandomBytes(config.length)).join(' ');
        break;
    }
    
    setGeneratedData(result);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleConfigChange = (key: keyof RandomDataConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ToolPageLayout
      toolId="random-data-generator"
      title="Random Data Generator"
      icon={BoltIcon}
      group="privacy"
    >
      <div className="max-w-2xl mx-auto">
        {/* Configuration */}
        <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Generator Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Data Type
              </label>
              <select
                value={config.type}
                onChange={(e) => handleConfigChange('type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="password">Password</option>
                <option value="hex">Hexadecimal</option>
                <option value="base64">Base64</option>
                <option value="uuid">UUID v4</option>
                <option value="bytes">Raw Bytes</option>
              </select>
            </div>

            {/* Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Length: {config.length}
              </label>
              <input
                type="range"
                min="8"
                max="128"
                value={config.length}
                onChange={(e) => handleConfigChange('length', parseInt(e.target.value))}
                className="w-full"
                disabled={config.type === 'uuid'}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>8</span>
                <span>128</span>
              </div>
            </div>
          </div>

          {/* Password Options */}
          {config.type === 'password' && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Password Options</h4>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.includeUppercase}
                    onChange={(e) => handleConfigChange('includeUppercase', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Uppercase (A-Z)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.includeLowercase}
                    onChange={(e) => handleConfigChange('includeLowercase', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Lowercase (a-z)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.includeNumbers}
                    onChange={(e) => handleConfigChange('includeNumbers', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Numbers (0-9)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.includeSymbols}
                    onChange={(e) => handleConfigChange('includeSymbols', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Symbols (!@#$%^&*)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.excludeSimilar}
                    onChange={(e) => handleConfigChange('excludeSimilar', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Exclude similar (0O1Il)</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
          <button
            onClick={generateData}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Generate Random Data
          </button>
        </div>

        {/* Generated Data */}
        {generatedData && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Generated Data</h3>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                <ClipboardDocumentIcon className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="break-all font-mono text-sm">
                {generatedData}
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Length:</strong> {generatedData.length} characters</p>
              <p><strong>Type:</strong> {config.type}</p>
              <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Security Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            🔐 Cryptographically Secure
          </h3>
          <div className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
            <p>• Uses Web Crypto API for true randomness</p>
            <p>• Suitable for passwords, encryption keys, and security tokens</p>
            <p>• No server communication - all processing is client-side</p>
            <p>• Generated data is never stored or transmitted</p>
          </div>
        </div>
      </div>
    </ToolPageLayout>
  );
};

export default RandomDataGenerator; 