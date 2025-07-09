import React, { useState } from 'react';

// Lorem ipsum text source
const loremIpsumText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam lacinia pulvinar tortor nec facilisis. Pellentesque dapibus efficitur laoreet. Nam risus ante, dapibus a molestie consequat, ultrices ac magna. Fusce dui lectus, congue vel laoreet ac, dictum vitae odio. Donec aliquet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam lacinia pulvinar tortor nec facilisis. Pellentesque dapibus efficitur laoreet. Nam risus ante, dapibus a molestie consequat, ultrices ac magna. Fusce dui lectus, congue vel laoreet ac, dictum vitae odio. Donec aliquet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam lacinia pulvinar tortor nec facilisis. Pellentesque dapibus efficitur laoreet. Nam risus ante, dapibus a molestie consequat, ultrices ac magna. Fusce dui lectus, congue vel laoreet ac, dictum vitae odio. Donec aliquet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam lacinia pulvinar tortor nec facilisis. Pellentesque dapibus efficitur laoreet. Nam risus ante, dapibus a molestie consequat, ultrices ac magna. Fusce dui lectus, congue vel laoreet ac, dictum vitae odio. Donec aliquet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam lacinia pulvinar tortor nec facilisis. Pellentesque dapibus efficitur laoreet. Nam risus ante, dapibus a molestie consequat, ultrices ac magna. Fusce dui lectus, congue vel laoreet ac, dictum vitae odio. Donec aliquet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam lacinia pulvinar tortor nec facilisis. Pellentesque dapibus efficitur laoreet. Nam risus ante, dapibus a molestie consequat, ultrices ac magna. Fusce dui lectus, congue vel laoreet ac, dictum vitae odio. Donec aliquet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam lacinia pulvinar tortor nec facilisis. Pellentesque dapibus efficitur laoreet. Nam risus ante, dapibus a molestie consequat, ultrices ac magna. Fusce dui lectus, congue vel laoreet ac, dictum vitae odio. Donec aliquet.`;

// Words array for generating random text
const words = loremIpsumText.split(' ');

// Generate random text
const generateRandomText = (
  type: 'paragraphs' | 'words' | 'sentences' | 'bytes',
  count: number,
  startWithLorem: boolean = true
): string => {
  if (count <= 0) return '';

  switch (type) {
    case 'paragraphs': {
      const paragraphs: string[] = [];
      const avgWordsPerParagraph = 50;
      
      for (let i = 0; i < count; i++) {
        const paragraphWords = generateRandomText('words', avgWordsPerParagraph, i === 0 && startWithLorem);
        paragraphs.push(paragraphWords);
      }
      
      return paragraphs.join('\n\n');
    }
    
    case 'words': {
      let result: string[] = [];
      
      if (startWithLorem && count >= 2) {
        result = ['Lorem', 'ipsum'];
        count -= 2;
      }
      
      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * words.length);
        let word = words[randomIndex].replace(/[,.]/g, '');
        
        // Add punctuation occasionally
        if (i > 0 && i % 8 === 0) {
          word += '.';
        } else if (i > 0 && i % 15 === 0) {
          word += ',';
        }
        
        // Capitalize first word of a sentence
        if (i === 0 || (i > 0 && result[i - 1].endsWith('.'))) {
          word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        
        result.push(word);
      }
      
      // Ensure the last word ends with a period
      if (!result[result.length - 1].endsWith('.')) {
        result[result.length - 1] += '.';
      }
      
      return result.join(' ');
    }
    
    case 'sentences': {
      const avgWordsPerSentence = 10;
      const sentences: string[] = [];
      
      for (let i = 0; i < count; i++) {
        const sentenceWords = generateRandomText('words', avgWordsPerSentence, i === 0 && startWithLorem);
        sentences.push(sentenceWords);
      }
      
      return sentences.join(' ');
    }
    
    case 'bytes': {
      // Generate text until we reach the desired byte count
      let text = '';
      while (new TextEncoder().encode(text).length < count) {
        text += generateRandomText('words', 10, text.length === 0 && startWithLorem) + ' ';
      }
      
      // Trim to exact byte count
      const encoder = new TextEncoder();
      const bytes = encoder.encode(text);
      return new TextDecoder().decode(bytes.slice(0, count));
    }
    
    default:
      return '';
  }
};

const LoremIpsumGenerator: React.FC = () => {
  const [outputText, setOutputText] = useState<string>('');
  const [type, setType] = useState<'paragraphs' | 'words' | 'sentences' | 'bytes'>('paragraphs');
  const [count, setCount] = useState<number>(3);
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<'plain' | 'html'>('plain');

  const handleGenerate = () => {
    const generatedText = generateRandomText(type, count, startWithLorem);
    
    if (outputFormat === 'html') {
      if (type === 'paragraphs') {
        const paragraphs = generatedText.split('\n\n');
        setOutputText(paragraphs.map(p => `<p>${p}</p>`).join('\n'));
      } else {
        setOutputText(`<p>${generatedText}</p>`);
      }
    } else {
      setOutputText(generatedText);
    }
  };

  const handleCopyToClipboard = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setCount(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-gray-700 dark:text-gray-300">
        <p>Generate Lorem Ipsum placeholder text for your designs, layouts, and mockups.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="w-full sm:w-auto">
              <label htmlFor="type-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Generate
              </label>
              <select
                id="type-select"
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
                <option value="bytes">Bytes</option>
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label htmlFor="count-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Count
              </label>
              <input
                id="count-input"
                type="number"
                min="1"
                max={type === 'paragraphs' ? 50 : type === 'sentences' ? 100 : type === 'words' ? 1000 : 10000}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={count}
                onChange={handleCountChange}
              />
            </div>
            
            <div className="w-full sm:w-auto">
              <label htmlFor="format-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Format
              </label>
              <select
                id="format-select"
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as 'plain' | 'html')}
              >
                <option value="plain">Plain Text</option>
                <option value="html">HTML</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              id="start-with-lorem"
              type="checkbox"
              className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
            />
            <label htmlFor="start-with-lorem" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Start with "Lorem ipsum"
            </label>
          </div>
          
          <button
            type="button"
            className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
            onClick={handleGenerate}
          >
            Generate Lorem Ipsum
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="output-text" className="block font-medium text-gray-700 dark:text-gray-300">
              Generated Text
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
            placeholder="Generated Lorem Ipsum text will appear here..."
            value={outputText}
            readOnly
          />
        </div>
      </div>
      
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">About Lorem Ipsum</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
        </p>
      </div>
    </div>
  );
};

export default LoremIpsumGenerator; 