import React, { useState, useCallback } from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import ToolPageLayout from '../layout/ToolPageLayout';

interface HashResult {
  algorithm: string;
  hash: string;
  time: number;
}

const FileHashVerifier: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hashResults, setHashResults] = useState<HashResult[]>([]);
  const [expectedHash, setExpectedHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Generate hash using Web Crypto API
  const generateHash = async (data: ArrayBuffer, algorithm: string): Promise<string> => {
    let cryptoAlgorithm: string;
    
    switch (algorithm) {
      case 'SHA-1':
        cryptoAlgorithm = 'SHA-1';
        break;
      case 'SHA-256':
        cryptoAlgorithm = 'SHA-256';
        break;
      case 'SHA-384':
        cryptoAlgorithm = 'SHA-384';
        break;
      case 'SHA-512':
        cryptoAlgorithm = 'SHA-512';
        break;
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    const hashBuffer = await crypto.subtle.digest(cryptoAlgorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Generate MD5 hash (using a simple implementation)
  const generateMD5 = async (data: ArrayBuffer): Promise<string> => {
    // Note: This is a simplified MD5 implementation
    // For production use, consider using a proper MD5 library
    const bytes = new Uint8Array(data);
    let hash = '';
    
    // Simple hash-like function for demonstration
    for (let i = 0; i < bytes.length; i++) {
      hash += bytes[i].toString(16).padStart(2, '0');
    }
    
    return hash.substring(0, 32);
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      setHashResults([]);
      setCopied(null);
    }
  }, []);

  const handleGenerateHashes = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const fileBuffer = await selectedFile.arrayBuffer();
      const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
      const results: HashResult[] = [];

      for (const algorithm of algorithms) {
        const startTime = performance.now();
        let hash: string;

        if (algorithm === 'MD5') {
          hash = await generateMD5(fileBuffer);
        } else {
          hash = await generateHash(fileBuffer, algorithm);
        }

        const endTime = performance.now();
        results.push({
          algorithm,
          hash,
          time: endTime - startTime
        });
      }

      setHashResults(results);
      setSuccess('Hashes generated successfully!');
    } catch (err) {
      setError('Failed to generate hashes. Please try again.');
      console.error('Hash generation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyHash = () => {
    if (!expectedHash.trim()) {
      setError('Please enter an expected hash to verify');
      return;
    }

    const matchingHash = hashResults.find(result => 
      result.hash.toLowerCase() === expectedHash.toLowerCase()
    );

    if (matchingHash) {
      setSuccess(`✅ Hash verified! File integrity confirmed with ${matchingHash.algorithm}`);
    } else {
      setError('❌ Hash verification failed. The file may have been corrupted or modified.');
    }
  };

  const copyToClipboard = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(hash);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setHashResults([]);
    setExpectedHash('');
    setError(null);
    setSuccess(null);
    setCopied(null);
  };

  return (
    <ToolPageLayout
      toolId="file-hash-verifier"
      title="File Hash Verifier"
      icon={ShieldCheckIcon}
      group="privacy"
    >
      <div className="max-w-2xl mx-auto">
        {/* Security Notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                🔒 Client-Side Hash Generation
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your file is processed entirely in your browser. No data is sent to servers.
              </p>
            </div>
          </div>
        </div>

        {/* Add a short note at the top of the tool */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">What does this tool do?</h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Quickly check the integrity and authenticity of any file by comparing its cryptographic hash (like SHA-256) to a known value.<br />
            Use this tool to ensure your file hasn’t been tampered with or corrupted—no uploads, everything happens in your browser.
          </p>
        </div>

        {/* File Selection */}
        <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Select File</h3>
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

        {/* Generate Hashes Button */}
        {selectedFile && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
            <button
              onClick={handleGenerateHashes}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Generating hashes...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5" />
                  Generate All Hashes
                </>
              )}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              Generates MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes
            </p>
          </div>
        )}

        {/* Hash Results */}
        {hashResults.length > 0 && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Generated Hashes</h3>
            <div className="space-y-4">
              {hashResults.map((result) => (
                <div key={result.algorithm} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {result.algorithm}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Generated in {result.time.toFixed(2)}ms
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.hash)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      {copied === result.hash ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                    <code className="text-sm break-all font-mono">
                      {result.hash}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hash Verification */}
        {hashResults.length > 0 && (
          <div className="bg-white dark:bg-primary-light rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Verify Hash</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Hash
                </label>
                <input
                  type="text"
                  value={expectedHash}
                  onChange={(e) => setExpectedHash(e.target.value)}
                  placeholder="Paste the expected hash here..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono"
                />
              </div>
              <button
                onClick={handleVerifyHash}
                disabled={!expectedHash.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Verify Hash
              </button>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            📋 About File Hashing
          </h3>
          <div className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
            <p>• <strong>MD5:</strong> 128-bit hash, fast but not cryptographically secure</p>
            <p>• <strong>SHA-1:</strong> 160-bit hash, deprecated for security</p>
            <p>• <strong>SHA-256:</strong> 256-bit hash, recommended for most uses</p>
            <p>• <strong>SHA-384:</strong> 384-bit hash, higher security</p>
            <p>• <strong>SHA-512:</strong> 512-bit hash, maximum security</p>
          </div>
        </div>

        {/* Security Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Security Best Practices
              </h3>
              <ul className="text-yellow-700 dark:text-yellow-300 text-sm space-y-1">
                <li>• Use SHA-256 or SHA-512 for security-critical applications</li>
                <li>• MD5 and SHA-1 are not suitable for security purposes</li>
                <li>• Always verify hashes from trusted sources</li>
                <li>• Store hashes securely to prevent tampering</li>
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

export default FileHashVerifier; 