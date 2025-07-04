import { useEffect } from 'react';
import JSONFormatter from '../../components/tools/JSONFormatter';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const JSONFormatterPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'JSON Formatter/Validator - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="json-formatter"
      title="JSON Formatter/Validator"
      icon={CodeBracketIcon}
      group="developer"
      relatedTools={['csv-to-json', 'word-to-markdown', 'csv-merger']}
    >
      <JSONFormatter />
    </ToolPageLayout>
  );
};

export default JSONFormatterPage; 