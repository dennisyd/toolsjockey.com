import React, { useState } from 'react';

const HTMLEntityConverter: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const htmlEntities: Record<string, string> = {
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    '"': '&quot;',
    "'": '&apos;',
    '¢': '&cent;',
    '£': '&pound;',
    '¥': '&yen;',
    '€': '&euro;',
    '©': '&copy;',
    '®': '&reg;',
    '™': '&trade;',
    ' ': '&nbsp;',
    '§': '&sect;',
    '±': '&plusmn;',
    '×': '&times;',
    '÷': '&divide;',
  };

  // Reverse the htmlEntities object for decoding
  const reverseEntities: Record<string, string> = Object.entries(htmlEntities).reduce(
    (acc, [key, value]) => {
      acc[value] = key;
      return acc;
    },
    {} as Record<string, string>
  );

  const encodeHtmlEntities = (text: string): string => {
    return text.replace(/[<>&"'¢£¥€©®™ §±×÷]/g, match => htmlEntities[match] || match);
  };

  const decodeHtmlEntities = (text: string): string => {
    // Replace named entities
    let result = text.replace(/&[a-zA-Z]+;/g, match => {
      return reverseEntities[match] || match;
    });
    
    // Replace numeric entities
    result = result.replace(/&#(\d+);/g, (_, dec) => {
      return String.fromCharCode(parseInt(dec, 10));
    });
    
    // Replace hex entities
    result = result.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
    
    return result;
  };

  const handleProcess = () => {
    if (!inputText.trim()) {
      setError('Please enter some text to process.');
      return;
    }

    try {
      setError(null);
      if (mode === 'encode') {
        setOutputText(encodeHtmlEntities(inputText));
      } else {
        setOutputText(decodeHtmlEntities(inputText));
      }
    } catch (err) {
      setError(`Error ${mode === 'encode' ? 'encoding' : 'decoding'} HTML entities: ${err instanceof Error ? err.message : String(err)}`);
      setOutputText('');
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
        <p>Convert between HTML special characters and their entity equivalents.</p>
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
          Text to HTML Entities
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
          HTML Entities to Text
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="input-text" className="block font-medium text-gray-700 dark:text-gray-300">
            {mode === 'encode' ? 'Text Input' : 'HTML with Entities'}
          </label>
          <textarea
            id="input-text"
            className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
            placeholder={mode === 'encode' ? 'Enter text to convert to HTML entities...' : 'Enter HTML with entities to convert to plain text...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="output-text" className="block font-medium text-gray-700 dark:text-gray-300">
              {mode === 'encode' ? 'HTML with Entities' : 'Plain Text'}
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
            placeholder={mode === 'encode' ? 'HTML entities will appear here...' : 'Plain text will appear here...'}
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
          {mode === 'encode' ? 'Convert to HTML Entities' : 'Convert to Plain Text'}
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Common HTML Entities</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          HTML entities are used to display reserved characters or characters that are hard to type.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Character</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Entity Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              <tr>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">&lt;</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">&amp;lt;</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Less than</td>
              </tr>
              <tr>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">&gt;</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">&amp;gt;</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Greater than</td>
              </tr>
              <tr>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">&amp;</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">&amp;amp;</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Ampersand</td>
              </tr>
              <tr>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">&quot;</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">&amp;quot;</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Double quote</td>
              </tr>
              <tr>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">&#39;</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">&amp;apos;</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Apostrophe</td>
              </tr>
              <tr>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">&copy;</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">&amp;copy;</td>
                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Copyright</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HTMLEntityConverter; 