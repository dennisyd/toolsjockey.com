import { useEffect } from 'react';
import HTMLEntityConverter from '../../components/tools/HTMLEntityConverter';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const HTMLEntityConverterPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'HTML Entity Converter - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="html-entity-converter"
      title="HTML Entity Converter"
      icon={CodeBracketIcon}
      group="developer"
    >
      <HTMLEntityConverter />
    </ToolPageLayout>
  );
};

export default HTMLEntityConverterPage; 