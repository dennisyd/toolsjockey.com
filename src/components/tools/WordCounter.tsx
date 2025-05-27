import { useState } from 'react';
import mammoth from 'mammoth/mammoth.browser';

const countWords = (text: string) =>
  text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;

const WordCounter = () => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const charCount = text.length;
  const wordCount = countWords(text);

  const handleFile = async (file: File) => {
    setError(null);
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    try {
      if (ext === 'txt') {
        const reader = new FileReader();
        reader.onload = e => setText(e.target?.result as string || '');
        reader.onerror = () => setError('Failed to read text file.');
        reader.readAsText(file);
      } else if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setText(result.value || '');
      } else {
        setError('Unsupported file type. Please upload a .txt or .docx file.');
      }
    } catch (err) {
      setError('Failed to extract text from file.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor="word-counter-file" className="font-semibold">
        Import a .txt or .docx file:
      </label>
      <input
        id="word-counter-file"
        type="file"
        accept=".txt,.docx"
        className="block mb-2"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <label htmlFor="word-counter-textarea" className="font-semibold">
        Enter your text below:
      </label>
      <textarea
        id="word-counter-textarea"
        className="w-full min-h-[120px] p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-y"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type or paste your text here..."
        aria-label="Text to count words and characters"
      />
      <div className="flex gap-6 text-sm mt-2">
        <div>
          <span className="font-bold">Words:</span> {wordCount}
        </div>
        <div>
          <span className="font-bold">Characters:</span> {charCount}
        </div>
      </div>
    </div>
  );
};

export default WordCounter; 