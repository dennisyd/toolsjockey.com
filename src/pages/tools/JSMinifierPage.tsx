import { useEffect } from 'react';
import JSMinifier from '../../components/tools/JSMinifier';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const JSMinifierPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'JavaScript Minifier - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="js-minifier"
      title="JavaScript Minifier"
      icon={CodeBracketIcon}
      group="developer"
    >
      <JSMinifier />
    </ToolPageLayout>
  );
};

export default JSMinifierPage; 