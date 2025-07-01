import React, { useState, useRef } from 'react';

interface RegexMatch {
  fullMatch: string;
  groups: string[];
  index: number;
  input: string;
}

interface CommonPattern {
  name: string;
  pattern: string;
  flags: string;
  description: string;
}

const commonPatterns: CommonPattern[] = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g', description: 'Match email addresses' },
  { name: 'URL', pattern: 'https?://[\\w-]+(\\.[\\w-]+)+([\\w.,@?^=%&:/~+#-]*[\\w@?^=%&/~+#-])?', flags: 'g', description: 'Match URLs' },
  { name: 'IP Address', pattern: '\\b((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', flags: 'g', description: 'Match IPv4 addresses' },
  { name: 'Date (MM/DD/YYYY)', pattern: '\\b(0?[1-9]|1[0-2])/(0?[1-9]|[12]\\d|3[01])/([12]\\d{3})\\b', flags: 'g', description: 'Match dates in MM/DD/YYYY format' },
  { name: 'Phone Number', pattern: '\\b\\(?\\d{3}\\)?[- .]?\\d{3}[- .]?\\d{4}\\b', flags: 'g', description: 'Match US phone numbers' },
  { name: 'Numbers', pattern: '\\b\\d+(\\.\\d+)?\\b', flags: 'g', description: 'Match numbers (integer or decimal)' },
  { name: 'HTML Tags', pattern: '<([a-z][a-z0-9]*)\\b[^>]*>(.*?)</\\1>', flags: 'gi', description: 'Match HTML tags with content' },
];

const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState<'highlight' | 'details'>('highlight');
  const [showCommonPatterns, setShowCommonPatterns] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process the regex and find matches
  const processRegex = () => {
    try {
      if (!pattern) return { output: text, matches: [], error: null };
      
      const re = new RegExp(pattern, flags);
      let lastIndex = 0;
      const highlightedOutput = [];
      const matches: RegexMatch[] = [];
      
      // Use matchAll for all matches if the global flag is set
      if (flags.includes('g')) {
        const matchIterator = text.matchAll(re);
        let matchArray;
        
        while (!(matchArray = matchIterator.next()).done) {
          const m = matchArray.value;
          const start = m.index ?? 0;
          
          // Add non-matching text before this match
          if (start > lastIndex) {
            highlightedOutput.push(text.slice(lastIndex, start));
          }
          
          // Add the highlighted match
          highlightedOutput.push(
            <mark key={start} className="bg-yellow-200 text-black rounded px-1">{m[0]}</mark>
          );
          
          // Save match details
          matches.push({
            fullMatch: m[0],
            groups: m.slice(1),
            index: start,
            input: text
          });
          
          lastIndex = start + m[0].length;
        }
        
        // Add any remaining text
        if (lastIndex < text.length) {
          highlightedOutput.push(text.slice(lastIndex));
        }
      } else {
        // Single match mode when 'g' flag is not present
        const m = text.match(re);
        if (m && m.index !== undefined) {
          // Add text before match
          if (m.index > 0) {
            highlightedOutput.push(text.slice(0, m.index));
          }
          
          // Add the highlighted match
          highlightedOutput.push(
            <mark key={m.index} className="bg-yellow-200 text-black rounded px-1">{m[0]}</mark>
          );
          
          // Add text after match
          if (m.index + m[0].length < text.length) {
            highlightedOutput.push(text.slice(m.index + m[0].length));
          }
          
          // Save match details
          matches.push({
            fullMatch: m[0],
            groups: m.slice(1),
            index: m.index,
            input: text
          });
        } else {
          // No match found
          highlightedOutput.push(text);
        }
      }
      
      return { output: highlightedOutput, matches, error: null };
    } catch (e) {
      return { 
        output: <span className="text-red-600">{e instanceof Error ? e.message : 'Invalid regex'}</span>, 
        matches: [], 
        error: e instanceof Error ? e.message : 'Invalid regex'
      };
    }
  };
  
  const { output, matches, error } = processRegex();
  
  // Handle file import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setText(content || '');
    };
    reader.readAsText(file);
    
    // Reset the file input
    e.target.value = '';
  };

  // Apply common pattern
  const applyPattern = (commonPattern: CommonPattern) => {
    setPattern(commonPattern.pattern);
    setFlags(commonPattern.flags);
    setShowCommonPatterns(false);
  };

  // Generate code snippet
  const generateCode = (language: 'js' | 'python' | 'php') => {
    if (!pattern) return '';
    
    switch (language) {
      case 'js':
        return `const regex = /${pattern}/${flags};\nconst matches = text.match(regex);\n\n// Or for all matches with groups\nconst allMatches = [...text.matchAll(regex)];`;
      case 'python':
        return `import re\n\npattern = r"${pattern}"\nregex = re.compile(pattern${flags.replace('g', '').length ? ', ' + flags.replace('g', '') : ''})\n\n# Find all matches\nmatches = regex.findall(text)\n\n# Or with more details\nmatches = regex.finditer(text)`;
      case 'php':
        return `<?php\n$pattern = "/${pattern}/${flags.replace('g', '')}${flags.includes('g') ? 'g' : ''}";\npreg_match_all($pattern, $text, $matches);\n?>`;
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-slate-100 dark:bg-slate-700 rounded p-3 text-sm text-gray-700 dark:text-gray-200">
        <b>How to use:</b> Enter a <b>regex pattern</b> (e.g. <code>foo.*bar</code>), optional <b>flags</b> (e.g. <code>gim</code>), and the text to test below. All matches will be <mark className="bg-yellow-200 text-black rounded px-1">highlighted</mark> in real time.<br/>
        <b>Flags:</b> <code>g</code> (global), <code>i</code> (ignore case), <code>m</code> (multiline), <code>s</code> (dotAll), <code>y</code> (sticky).<br/>
        Example: Pattern <code>\d+</code> with flag <code>g</code> will highlight all numbers.
      </div>

      {/* Regex inputs and common patterns */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex-grow flex gap-2">
          <input 
            className="p-2 border rounded flex-1" 
            placeholder="Pattern" 
            value={pattern} 
            onChange={e => setPattern(e.target.value)} 
          />
          <input 
            className="p-2 border rounded w-24" 
            placeholder="Flags (gimsy)" 
            value={flags} 
            onChange={e => setFlags(e.target.value)} 
          />
        </div>

        <div className="relative">
          <button 
            className="px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded text-sm"
            onClick={() => setShowCommonPatterns(!showCommonPatterns)}
          >
            Common Patterns
          </button>
          
          {showCommonPatterns && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg z-10 w-64">
              <div className="p-2 border-b dark:border-gray-700 font-medium text-sm">
                Common Regex Patterns
              </div>
              <div className="max-h-80 overflow-y-auto">
                {commonPatterns.map((item, index) => (
                  <button 
                    key={index} 
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    onClick={() => applyPattern(item)}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.pattern}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text input with file import */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Text to Test</label>
          <button 
            className="text-sm px-2 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded"
            onClick={() => fileInputRef.current?.click()}
          >
            Import File
          </button>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden" 
          />
        </div>
        <textarea 
          className="p-2 border rounded w-full min-h-[120px]" 
          placeholder="Text to test..." 
          value={text} 
          onChange={e => setText(e.target.value)} 
        />
      </div>

      {/* Results tabs */}
      <div className="flex border-b dark:border-gray-700">
        <button 
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'highlight' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}
          onClick={() => setActiveTab('highlight')}
        >
          Highlighted Text
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}
          onClick={() => setActiveTab('details')}
        >
          Match Details {matches.length > 0 && `(${matches.length})`}
        </button>
      </div>

      {/* Results display */}
      {activeTab === 'highlight' ? (
        <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 min-h-[150px] whitespace-pre-wrap font-mono text-sm overflow-auto">
          {output}
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 min-h-[150px] overflow-auto">
          {error ? (
            <div className="text-red-600">{error}</div>
          ) : matches.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-sm">No matches found</div>
          ) : (
            <div className="space-y-3">
              {matches.map((match, index) => (
                <div key={index} className="border dark:border-gray-700 rounded p-2">
                  <div className="text-sm font-medium">Match #{index + 1}</div>
                  <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 mt-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Text:</div>
                    <div className="text-xs font-mono bg-yellow-100 dark:bg-yellow-900 px-1 rounded">{match.fullMatch}</div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">Position:</div>
                    <div className="text-xs font-mono">{match.index}</div>
                    
                    {match.groups.length > 0 && (
                      <>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Groups:</div>
                        <div className="text-xs">
                          {match.groups.map((group, i) => (
                            <div key={i} className="font-mono">
                              {i + 1}: <span className="bg-green-100 dark:bg-green-900 px-1 rounded">{group || "(empty)"}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Code snippets */}
      {pattern && !error && (
        <div className="mt-2">
          <div className="text-sm font-medium mb-2">Code Snippets:</div>
          <div className="flex flex-wrap gap-4">
            {['js', 'python', 'php'].map((lang) => (
              <div key={lang} className="flex-1 min-w-[200px]">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs font-medium capitalize">{lang}</div>
                  <button 
                    className="text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => navigator.clipboard.writeText(generateCode(lang as 'js' | 'python' | 'php'))}
                  >
                    Copy
                  </button>
                </div>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                  {generateCode(lang as 'js' | 'python' | 'php')}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegexTester; 