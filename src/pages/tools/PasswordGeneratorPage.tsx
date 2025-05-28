import { useEffect } from 'react';
import PasswordGenerator from '../../components/tools/PasswordGenerator';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { BoltIcon } from '@heroicons/react/24/outline';

const PasswordGeneratorPage = () => {
  useEffect(() => {
    document.title = 'Password Generator - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="password-generator"
      title="Password Generator"
      icon={BoltIcon}
      group="quick"
      relatedTools={['text-case-converter', 'qr-code-generator', 'word-counter']}
    >
      <PasswordGenerator />
    </ToolPageLayout>
  );
};

export default PasswordGeneratorPage; 