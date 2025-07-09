import React, { useState } from 'react';

const HTMLMinifier: React.FC = () => {
  const [inputHTML, setInputHTML] = useState<string>('');
  const [outputHTML, setOutputHTML] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ original: number, minified: number, savings: number } | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [preserveComments, setPreserveComments] = useState<boolean>(false);

  const handleMinify = () => {
    if (!inputHTML.trim()) {
      setError('Please enter some HTML code to minify.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // Custom minification with comment preservation option
      let minified = inputHTML;
      
      if (!preserveComments) {
        // Remove HTML comments
        minified = minified.replace(/<!--[\s\S]*?-->/g, '');
      }
      
      // Remove whitespace between tags
      minified = minified.replace(/>\s+</g, '><');
      
      // Remove leading and trailing whitespace from each line
      minified = minified.replace(/^\s+|\s+$/gm, '');
      
      // Remove multiple spaces
      minified = minified.replace(/\s{2,}/g, ' ');
      
      // Remove spaces around attributes
      minified = minified.replace(/\s*=\s*/g, '=');
      
      setOutputHTML(minified);
      
      // Calculate stats
      const originalSize = new Blob([inputHTML]).size;
      const minifiedSize = new Blob([minified]).size;
      const savings = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize) * 100 : 0;
      
      setStats({
        original: originalSize,
        minified: minifiedSize,
        savings: Math.round(savings * 100) / 100
      });
    } catch (err) {
      setError(`Error minifying HTML: ${err instanceof Error ? err.message : String(err)}`);
      setOutputHTML('');
      setStats(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (outputHTML) {
      navigator.clipboard.writeText(outputHTML);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handlePasteExample = () => {
    const exampleHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML Example</title>
    <!-- This is a comment that might be removed -->
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <header>
        <h1>Welcome to HTML Minifier</h1>
        <p>This is an example HTML document that will be minified.</p>
      </header>
      
      <main>
        <section>
          <h2>What is HTML Minification?</h2>
          <p>
            HTML minification is the process of removing unnecessary characters
            from HTML code without changing its functionality.
          </p>
        </section>
      </main>
      
      <footer>
        <p>&copy; 2023 HTML Minifier Example</p>
      </footer>
    </div>
    
    <script>
      // This is a JavaScript comment
      document.addEventListener('DOMContentLoaded', function() {
        console.log('Page loaded!');
      });
    </script>
  </body>
</html>`;
    
    setInputHTML(exampleHTML);
  };

  return (
    <div className="space-y-6">
      <div className="text-gray-700 dark:text-gray-300">
        <p>Minify HTML code by removing unnecessary characters without changing functionality.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="input-html" className="block font-medium text-gray-700 dark:text-gray-300">
              HTML Code
            </label>
            <button
              type="button"
              className="text-sm text-accent hover:text-accent-dark"
              onClick={handlePasteExample}
            >
              Paste Example
            </button>
          </div>
          <textarea
            id="input-html"
            className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
            placeholder="Paste your HTML code here..."
            value={inputHTML}
            onChange={(e) => setInputHTML(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="output-html" className="block font-medium text-gray-700 dark:text-gray-300">
              Minified Output
            </label>
            <button
              type="button"
              className="text-sm text-accent hover:text-accent-dark disabled:opacity-50"
              onClick={handleCopyToClipboard}
              disabled={!outputHTML}
            >
              {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <textarea
            id="output-html"
            className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
            readOnly
            value={outputHTML}
            placeholder="Minified HTML will appear here..."
          />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center">
          <input
            id="preserve-comments"
            type="checkbox"
            className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
            checked={preserveComments}
            onChange={(e) => setPreserveComments(e.target.checked)}
          />
          <label htmlFor="preserve-comments" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Preserve comments
          </label>
        </div>
        
        <button
          type="button"
          className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
          onClick={handleMinify}
          disabled={isProcessing || !inputHTML.trim()}
        >
          {isProcessing ? 'Minifying...' : 'Minify HTML'}
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
      
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">HTML Minification Benefits</h3>
        <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>Reduces file size, resulting in faster page loading times</li>
          <li>Decreases bandwidth usage and hosting costs</li>
          <li>Improves website performance and user experience</li>
          <li>Helps with SEO as page speed is a ranking factor</li>
        </ul>
      </div>
    </div>
  );
};

export default HTMLMinifier; 