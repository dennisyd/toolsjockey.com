import { useEffect } from 'react';
import SyntaxHighlighterTool from '../../components/tools/SyntaxHighlighterTool';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const SyntaxHighlighterPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'Syntax Highlighter - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="syntax-highlighter"
      title="Syntax Highlighter"
      icon={CodeBracketIcon}
      group="developer"
    >
      <SyntaxHighlighterTool />
    </ToolPageLayout>
  );
};

export default SyntaxHighlighterPage; 