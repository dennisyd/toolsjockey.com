import { useEffect } from 'react';
import HTMLMinifier from '../../components/tools/HTMLMinifier';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const HTMLMinifierPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'HTML Minifier - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="html-minifier"
      title="HTML Minifier"
      icon={CodeBracketIcon}
      group="developer"
    >
      <HTMLMinifier />
    </ToolPageLayout>
  );
};

export default HTMLMinifierPage; 