import { useEffect } from 'react';
import TextCaseConverter from '../../components/tools/TextCaseConverter';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { BoltIcon } from '@heroicons/react/24/outline';

const TextCaseConverterPage = () => {
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