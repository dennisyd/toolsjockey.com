import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism.css';

interface Language {
  value: string;
  label: string;
  prismLanguage: string;
}

interface Theme {
  value: string;
  label: string;
}

const languages: Language[] = [
  { value: 'html', label: 'HTML', prismLanguage: 'html' },
  { value: 'css', label: 'CSS', prismLanguage: 'css' },
  { value: 'javascript', label: 'JavaScript', prismLanguage: 'javascript' },
  { value: 'typescript', label: 'TypeScript', prismLanguage: 'typescript' },
  { value: 'jsx', label: 'JSX', prismLanguage: 'jsx' },
  { value: 'tsx', label: 'TSX', prismLanguage: 'tsx' },
  { value: 'json', label: 'JSON', prismLanguage: 'json' },
  { value: 'python', label: 'Python', prismLanguage: 'python' },
  { value: 'java', label: 'Java', prismLanguage: 'java' },
  { value: 'csharp', label: 'C#', prismLanguage: 'csharp' },
  { value: 'ruby', label: 'Ruby', prismLanguage: 'ruby' },
  { value: 'go', label: 'Go', prismLanguage: 'go' },
  { value: 'rust', label: 'Rust', prismLanguage: 'rust' },
  { value: 'sql', label: 'SQL', prismLanguage: 'sql' },
  { value: 'bash', label: 'Bash/Shell', prismLanguage: 'bash' },
  { value: 'yaml', label: 'YAML', prismLanguage: 'yaml' },
  { value: 'markdown', label: 'Markdown', prismLanguage: 'markdown' }
];

const themes: Theme[] = [
  { value: 'default', label: 'Default' },
  { value: 'dark', label: 'Dark' },
  { value: 'okaidia', label: 'Okaidia' },
  { value: 'twilight', label: 'Twilight' },
  { value: 'coy', label: 'Coy' },
  { value: 'solarizedlight', label: 'Solarized Light' },
  { value: 'tomorrow', label: 'Tomorrow' }
];

const SyntaxHighlighterTool: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [theme, setTheme] = useState<string>('default');
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);
  const [highlightedCode, setHighlightedCode] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    if (inputCode) {
      const selectedLanguage = languages.find(lang => lang.value === language);
      if (selectedLanguage) {
        try {
          const highlighted = Prism.highlight(
            inputCode,
            Prism.languages[selectedLanguage.prismLanguage],
            selectedLanguage.prismLanguage
          );
          setHighlightedCode(highlighted);
        } catch (error) {
          console.warn(`Failed to highlight ${selectedLanguage.label} code:`, error);
          // Fall back to plain text if highlighting fails
          setHighlightedCode(inputCode.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
        }
      }
    } else {
      setHighlightedCode('');
    }
  }, [inputCode, language]);

  const handleCopyToClipboard = () => {
    if (inputCode) {
      navigator.clipboard.writeText(inputCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleCopyHtml = () => {
    const preElement = document.getElementById('highlighted-code');
    if (preElement) {
      const html = preElement.outerHTML;
      navigator.clipboard.writeText(html);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const addLineNumbers = (code: string): string => {
    if (!showLineNumbers) return code;
    
    const lines = code.split('\n');
    return lines
      .map((line, i) => `<span class="line-number">${i + 1}</span>${line}`)
      .join('\n');
  };

  return (
    <div className="space-y-6">
      <div className="text-gray-700 dark:text-gray-300">
        <p>Highlight code syntax with various themes and support for multiple programming languages.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
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
              <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Theme
              </label>
              <select
                id="theme-select"
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                {themes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
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
          
          <div className="space-y-2">
            <label htmlFor="input-code" className="block font-medium text-gray-700 dark:text-gray-300">
              Input Code
            </label>
            <textarea
              id="input-code"
              className="w-full h-64 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
              placeholder={`Paste your ${languages.find(lang => lang.value === language)?.label || 'code'} here...`}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="highlighted-code" className="block font-medium text-gray-700 dark:text-gray-300">
              Highlighted Code
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-sm text-accent hover:text-accent-dark disabled:opacity-50"
                onClick={handleCopyToClipboard}
                disabled={!inputCode}
              >
                {copySuccess ? 'Copied!' : 'Copy Code'}
              </button>
              <button
                type="button"
                className="text-sm text-accent hover:text-accent-dark disabled:opacity-50"
                onClick={handleCopyHtml}
                disabled={!highlightedCode}
              >
                Copy HTML
              </button>
            </div>
          </div>
          
          <div className="w-full h-[calc(100%-2rem)] min-h-[400px] border border-gray-300 rounded-md shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700 overflow-auto">
            {highlightedCode ? (
              <pre
                id="highlighted-code"
                className={`language-${language} ${showLineNumbers ? 'line-numbers' : ''}`}
                style={{ margin: 0, padding: '1rem', height: '100%' }}
                dangerouslySetInnerHTML={{ __html: addLineNumbers(highlightedCode) }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <p>Highlighted code will appear here...</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>Supported Languages:</strong> HTML, CSS, JavaScript, TypeScript, JSX, TSX, JSON, Python, Java, C#, Ruby, Go, Rust, SQL, Bash, YAML, Markdown
        </p>
        <p>
          <strong>Features:</strong> Syntax highlighting, multiple themes, line numbers, copy code and HTML output
        </p>
      </div>
    </div>
  );
};

export default SyntaxHighlighterTool; 