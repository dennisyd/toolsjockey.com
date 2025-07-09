import { useEffect } from 'react';
import LoremIpsumGenerator from '../../components/tools/LoremIpsumGenerator';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const LoremIpsumGeneratorPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'Lorem Ipsum Generator - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="lorem-ipsum-generator"
      title="Lorem Ipsum Generator"
      icon={DocumentTextIcon}
      group="developer"
    >
      <LoremIpsumGenerator />
    </ToolPageLayout>
  );
};

export default LoremIpsumGeneratorPage; 