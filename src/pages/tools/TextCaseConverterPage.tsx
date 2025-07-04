import { useEffect } from 'react';
import TextCaseConverter from '../../components/tools/TextCaseConverter';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { BoltIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const TextCaseConverterPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'Text Case Converter - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="text-case-converter"
      title="Text Case Converter"
      icon={BoltIcon}
      group="quick"
      relatedTools={['password-generator', 'qr-code-generator', 'word-counter']}
    >
      <TextCaseConverter />
    </ToolPageLayout>
  );
};

export default TextCaseConverterPage; 