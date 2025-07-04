import { useEffect } from 'react';
import WordToMarkdownConverter from '../../components/tools/WordToMarkdownConverter';
import { Link } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const WordToMarkdownPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation

  useEffect(() => {
    document.title = 'Word to Markdown Converter - ToolsJockey.com';
  }, []);

  return (
    <div className="container-app mx-auto px-2 md:px-0 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 flex items-center gap-2 mb-4" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span>&gt;</span>
        <span>Document Tools</span>
        <span>&gt;</span>
        <b>Word to Markdown Converter</b>
      </nav>
      
      <div className="flex items-center gap-3 mb-4">
        <PencilSquareIcon className="w-7 h-7 text-accent" />
        <h1 className="text-2xl font-bold">Word to Markdown Converter</h1>
      </div>
      
      <WordToMarkdownConverter />
    </div>
  );
};

export default WordToMarkdownPage; 