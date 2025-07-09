import React, { useState } from 'react';

const URLEncoderDecoder: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleEncode = () => {
    try {
      setError(null);
      const encoded = encodeURIComponent(inputText);
      setOutputText(encoded);
    } catch (err) {
      setError(`Error encoding URL: ${err instanceof Error ? err.message : String(err)}`);
      setOutputText('');
    }
  };

  const handleDecode = () => {
    try {
      setError(null);
      const decoded = decodeURIComponent(inputText);
      setOutputText(decoded);
    } catch (err) {
      setError(`Error decoding URL: ${err instanceof Error ? err.message : String(err)}`);
      setOutputText('');
    }
  };

  const handleProcess = () => {
    if (!inputText.trim()) {
      setError('Please enter some text to process.');
      return;
    }

    if (mode === 'encode') {
      handleEncode();
    } else {
      handleDecode();
    }
  };

  const handleCopyToClipboard = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleSwap = () => {
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    // Clear output when changing modes
    setOutputText('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-gray-700 dark:text-gray-300">
        <p>Encode or decode URLs for use in web applications and APIs.</p>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          className={`px-4 py-2 rounded-md ${
            mode === 'encode'
              ? 'bg-accent text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
          }`}
          onClick={() => handleModeChange('encode')}
        >
          Encode URL
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded-md ${
            mode === 'decode'
              ? 'bg-accent text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
          }`}
          onClick={() => handleModeChange('decode')}
        >
          Decode URL
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="input-text" className="block font-medium text-gray-700 dark:text-gray-300">
            {mode === 'encode' ? 'Text to Encode' : 'URL to Decode'}
          </label>
          <textarea
            id="input-text"
            className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
            placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter URL-encoded text to decode...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="output-text" className="block font-medium text-gray-700 dark:text-gray-300">
              {mode === 'encode' ? 'Encoded URL' : 'Decoded Text'}
            </label>
            <button
              type="button"
              className="text-sm text-accent hover:text-accent-dark disabled:opacity-50"
              onClick={handleCopyToClipboard}
              disabled={!outputText}
            >
              {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <textarea
            id="output-text"
            className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
            placeholder={mode === 'encode' ? 'Encoded URL will appear here...' : 'Decoded text will appear here...'}
            value={outputText}
            readOnly
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
          onClick={handleProcess}
          disabled={!inputText.trim()}
        >
          {mode === 'encode' ? 'Encode' : 'Decode'}
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          onClick={handleSwap}
          disabled={!inputText && !outputText}
        >
          Swap Input/Output
        </button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">URL Encoding Reference</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          URL encoding replaces unsafe ASCII characters with a "%" followed by two hexadecimal digits.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Character</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">URL Encoded</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              <tr>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">Space</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">%20</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Space character</td>
              </tr>
              <tr>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">/</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">%2F</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Forward slash</td>
              </tr>
              <tr>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">?</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">%3F</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Question mark</td>
              </tr>
              <tr>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">#</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">%23</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Hash/pound</td>
              </tr>
              <tr>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">&</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">%26</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Ampersand</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default URLEncoderDecoder; 