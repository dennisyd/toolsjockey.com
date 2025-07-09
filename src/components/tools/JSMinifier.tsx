import React, { useState } from 'react';
import { minify } from 'terser';

const JSMinifier: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ original: number, minified: number, savings: number } | null>(null);

  const handleMinify = async () => {
    if (!inputCode.trim()) {
      setError('Please enter some JavaScript code to minify.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const result = await minify(inputCode, {
        compress: true,
        mangle: true
      });
      
      const minifiedCode = result.code || '';
      setOutputCode(minifiedCode);
      
      // Calculate stats
      const originalSize = new Blob([inputCode]).size;
      const minifiedSize = new Blob([minifiedCode]).size;
      const savings = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;
      
      setStats({
        original: originalSize,
        minified: minifiedSize,
        savings: Math.round(savings * 100) / 100
      });
    } catch (err) {
      setError(`Error minifying code: ${err instanceof Error ? err.message : String(err)}`);
      setOutputCode('');
      setStats(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (outputCode) {
      navigator.clipboard.writeText(outputCode);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-gray-700 dark:text-gray-300">
        <p>Compress JavaScript code by removing unnecessary characters without changing functionality.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="input-code" className="block font-medium text-gray-700 dark:text-gray-300">
            JavaScript Code
          </label>
          <textarea
            id="input-code"
            className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
            placeholder="Paste your JavaScript code here..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="output-code" className="block font-medium text-gray-700 dark:text-gray-300">
              Minified Output
            </label>
            <button
              type="button"
              className="text-sm text-accent hover:text-accent-dark disabled:opacity-50"
              onClick={handleCopyToClipboard}
              disabled={!outputCode}
            >
              Copy to Clipboard
            </button>
          </div>
          <textarea
            id="output-code"
            className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
            readOnly
            value={outputCode}
            placeholder="Minified code will appear here..."
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <button
          type="button"
          className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
          onClick={handleMinify}
          disabled={isProcessing || !inputCode.trim()}
        >
          {isProcessing ? 'Minifying...' : 'Minify JavaScript'}
        </button>
        
        {stats && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Original: {stats.original.toLocaleString()} bytes | 
            Minified: {stats.minified.toLocaleString()} bytes | 
            Savings: {stats.savings}%
          </div>
        )}
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default JSMinifier; 