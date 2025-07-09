import React, { useState, useEffect } from 'react';
import * as diff from 'diff';
import 'prismjs/components/prism-diff';
import 'prismjs/themes/prism.css';

interface Language {
  value: string;
  label: string;
  prismLanguage: string;
}

const languages: Language[] = [
  { value: 'text', label: 'Plain Text', prismLanguage: 'text' },
  { value: 'html', label: 'HTML', prismLanguage: 'markup' },
  { value: 'css', label: 'CSS', prismLanguage: 'css' },
  { value: 'javascript', label: 'JavaScript', prismLanguage: 'javascript' },
  { value: 'typescript', label: 'TypeScript', prismLanguage: 'typescript' },
  { value: 'json', label: 'JSON', prismLanguage: 'json' },
  { value: 'python', label: 'Python', prismLanguage: 'python' }
];

const CodeDiffViewer: React.FC = () => {
  const [originalCode, setOriginalCode] = useState<string>('');
  const [modifiedCode, setModifiedCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('text');
  const [diffOutput, setDiffOutput] = useState<string>('');
  const [diffType, setDiffType] = useState<'chars' | 'words' | 'lines'>('lines');
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    if (originalCode || modifiedCode) {
      generateDiff();
    } else {
      setDiffOutput('');
    }
  }, [originalCode, modifiedCode, diffType]);

  const generateDiff = () => {
    let result: diff.Change[];

    switch (diffType) {
      case 'chars':
        result = diff.diffChars(originalCode, modifiedCode);
        break;
      case 'words':
        result = diff.diffWords(originalCode, modifiedCode);
        break;
      case 'lines':
      default:
        result = diff.diffLines(originalCode, modifiedCode);
        break;
    }

    let formattedDiff = '';
    let lineNumber = 1;
    
    result.forEach(part => {
      // Color the added and removed parts
      const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
      const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
      
      // Split by lines to add line numbers
      const lines = part.value.split('\n');
      
      // Don't add line number for the last empty line after a newline
      if (lines.length > 0 && lines[lines.length - 1] === '') {
        lines.pop();
      }
      
      lines.forEach((line) => {
        const lineNum = showLineNumbers ? `<span class="line-number">${lineNumber}</span>` : '';
        formattedDiff += `<div class="diff-line ${part.added ? 'added' : part.removed ? 'removed' : ''}">${lineNum}<span class="diff-prefix">${prefix}</span><span style="color: ${color}">${line}</span></div>`;
        
        // Only increment line number for non-removed lines
        if (!part.removed) {
          lineNumber++;
        }
      });
    });

    setDiffOutput(formattedDiff);
  };

  const handleCopyToClipboard = () => {
    // Create a plain text representation of the diff
    let plainText = '';
    
    const diffLines = diffOutput.split('</div>');
    diffLines.forEach(line => {
      if (line.includes('diff-prefix')) {
        const prefix = line.includes('class="diff-line added"') ? '+ ' : 
                       line.includes('class="diff-line removed"') ? '- ' : '  ';
        
        // Extract the text content using a regex
        const match = line.match(/>([^<]+)<\/span>$/);
        if (match && match[1]) {
          plainText += prefix + match[1] + '\n';
        }
      }
    });
    
    if (plainText) {
      navigator.clipboard.writeText(plainText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-gray-700 dark:text-gray-300">
        <p>Compare two code snippets and highlight the differences between them.</p>
      </div>
      
      <div className="flex flex-wrap gap-4 items-center">
        <div className="w-full sm:w-auto">
          <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Language
          </label>
          <select
            id="language-select"
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="w-full sm:w-auto">
          <label htmlFor="diff-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Diff Type
          </label>
          <select
            id="diff-type"
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={diffType}
            onChange={(e) => setDiffType(e.target.value as 'chars' | 'words' | 'lines')}
          >
            <option value="lines">Line by Line</option>
            <option value="words">Word by Word</option>
            <option value="chars">Character by Character</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            id="show-line-numbers"
            type="checkbox"
            className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
            checked={showLineNumbers}
            onChange={(e) => setShowLineNumbers(e.target.checked)}
          />
          <label htmlFor="show-line-numbers" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Show Line Numbers
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="original-code" className="block font-medium text-gray-700 dark:text-gray-300">
            Original Code
          </label>
          <textarea
            id="original-code"
            className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
            placeholder="Paste your original code here..."
            value={originalCode}
            onChange={(e) => setOriginalCode(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="modified-code" className="block font-medium text-gray-700 dark:text-gray-300">
            Modified Code
          </label>
          <textarea
            id="modified-code"
            className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
            placeholder="Paste your modified code here..."
            value={modifiedCode}
            onChange={(e) => setModifiedCode(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="diff-output" className="block font-medium text-gray-700 dark:text-gray-300">
            Diff Result
          </label>
          <button
            type="button"
            className="text-sm text-accent hover:text-accent-dark disabled:opacity-50"
            onClick={handleCopyToClipboard}
            disabled={!diffOutput}
          >
            {copySuccess ? 'Copied!' : 'Copy Diff'}
          </button>
        </div>
        <div 
          id="diff-output"
          className="w-full min-h-[300px] max-h-[500px] border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 overflow-auto font-mono text-sm p-4"
        >
          {diffOutput ? (
            <div dangerouslySetInnerHTML={{ __html: diffOutput }} />
          ) : (
            <div className="text-gray-500 dark:text-gray-400 h-full flex items-center justify-center">
              Diff results will appear here...
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .diff-line {
          white-space: pre;
          line-height: 1.5;
        }
        .diff-line.added {
          background-color: rgba(0, 255, 0, 0.1);
        }
        .diff-line.removed {
          background-color: rgba(255, 0, 0, 0.1);
        }
        .diff-prefix {
          user-select: none;
          margin-right: 8px;
        }
        .line-number {
          display: inline-block;
          width: 2em;
          user-select: none;
          opacity: 0.5;
          text-align: right;
          margin-right: 1em;
          padding-right: 0.5em;
          border-right: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
};

export default CodeDiffViewer; 