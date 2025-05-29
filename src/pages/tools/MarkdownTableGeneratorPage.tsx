import { useEffect } from 'react';
import MarkdownTableGenerator from '../../components/tools/MarkdownTableGenerator';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

const MarkdownTableGeneratorPage = () => {
  useEffect(() => {
    document.title = 'Markdown Table Generator - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="markdown-table-generator"
      title="Markdown Table Generator"
      icon={CodeBracketIcon}
      group="word"
      relatedTools={['regex-tester', 'json-formatter', 'text-diff']}
    >
      <MarkdownTableGenerator />
    </ToolPageLayout>
  );
};

export default MarkdownTableGeneratorPage; 