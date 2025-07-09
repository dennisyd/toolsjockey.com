
import { useEffect } from 'react';
import CodeFormatter from '../../components/tools/CodeFormatter';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const CodeFormatterPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'Code Formatter - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="code-formatter"
      title="Multi-language Code Formatter"
      icon={CodeBracketIcon}
      group="developer"
    >
      <CodeFormatter />
    </ToolPageLayout>
  );
};

export default CodeFormatterPage; 