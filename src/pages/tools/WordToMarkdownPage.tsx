import { useEffect } from 'react';
import WordToMarkdownConverter from '../../components/tools/WordToMarkdownConverter';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const WordToMarkdownPage = () => {
  useEffect(() => {
    document.title = 'Word to Markdown Converter - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="word-to-markdown"
      title="Word to Markdown Converter"
      icon={PencilSquareIcon}
      group="word"
      relatedTools={['csv-to-json', 'excel-merger-splitter', 'json-formatter']}
    >
      <WordToMarkdownConverter />
    </ToolPageLayout>
  );
};

export default WordToMarkdownPage; 