import React, { useState } from 'react';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import parserHtml from 'prettier/parser-html';
import parserCss from 'prettier/parser-postcss';
import parserMarkdown from 'prettier/parser-markdown';
import parserTypescript from 'prettier/parser-typescript';

type Language = 'javascript' | 'typescript' | 'html' | 'css' | 'json' | 'markdown';

interface LanguageOption {
  value: Language;
  label: string;
  parser: string;
}

const languageOptions: LanguageOption[] = [
  { value: 'javascript', label: 'JavaScript', parser: 'babel' },
  { value: 'typescript', label: 'TypeScript', parser: 'typescript' },
  { value: 'html', label: 'HTML', parser: 'html' },
  { value: 'css', label: 'CSS', parser: 'css' },
  { value: 'json', label: 'JSON', parser: 'json' },
  { value: 'markdown', label: 'Markdown', parser: 'markdown' }
];

const CodeFormatter: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>('');
  const [outputCode, setOutputCode] = useState<string>('');
  const [language, setLanguage] = useState<Language>('javascript');
  const [tabWidth, setTabWidth] = useState<number>(2);
  const [useTabs, setUseTabs] = useState<boolean>(false);
  const [printWidth, setPrintWidth] = useState<number>(80);
  const [singleQuote, setSingleQuote] = useState<boolean>(true);
  const [semi, setSemi] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormat = async () => {
    if (!inputCode.trim()) {
      setError('Please enter some code to format.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      const selectedLanguage = languageOptions.find(opt => opt.value === language);
      
      if (!selectedLanguage) {
        throw new Error('Invalid language selected');
      }
      
      const formattedCode = await prettier.format(inputCode, {
        parser: selectedLanguage.parser,
        plugins: [parserBabel, parserHtml, parserCss, parserMarkdown, parserTypescript],
        tabWidth,
        useTabs,
        printWidth,
        singleQuote,
        semi
      });
      
      setOutputCode(formattedCode);
    } catch (err) {
      setError(`Error formatting code: ${err instanceof Error ? err.message : String(err)}`);
      setOutputCode('');
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
        <p>Format and beautify code in various programming languages with customizable options.</p>
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
                onChange={(e) => setLanguage(e.target.value as Language)}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label htmlFor="tab-width" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tab Width
              </label>
              <input
                id="tab-width"
                type="number"
                min="1"
                max="8"
                className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={tabWidth}
                onChange={(e) => setTabWidth(Number(e.target.value))}
              />
            </div>
            
            <div className="w-full sm:w-auto">
              <label htmlFor="print-width" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Print Width
              </label>
              <input
                id="print-width"
                type="number"
                min="40"
                max="200"
                className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={printWidth}
                onChange={(e) => setPrintWidth(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center">
              <input
                id="use-tabs"
                type="checkbox"
                className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                checked={useTabs}
                onChange={(e) => setUseTabs(e.target.checked)}
              />
              <label htmlFor="use-tabs" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Use Tabs
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="single-quote"
                type="checkbox"
                className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                checked={singleQuote}
                onChange={(e) => setSingleQuote(e.target.checked)}
              />
              <label htmlFor="single-quote" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Use Single Quotes
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="semi"
                type="checkbox"
                className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                checked={semi}
                onChange={(e) => setSemi(e.target.checked)}
              />
              <label htmlFor="semi" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Add Semicolons
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
              placeholder={`Paste your ${languageOptions.find(opt => opt.value === language)?.label || 'code'} here...`}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
            />
          </div>
          
          <button
            type="button"
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
            onClick={handleFormat}
            disabled={isProcessing || !inputCode.trim()}
          >
            {isProcessing ? 'Formatting...' : 'Format Code'}
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="output-code" className="block font-medium text-gray-700 dark:text-gray-300">
              Formatted Output
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
            className="w-full h-[calc(100%-2rem)] min-h-[400px] p-3 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
            readOnly
            value={outputCode}
            placeholder="Formatted code will appear here..."
          />
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default CodeFormatter; 