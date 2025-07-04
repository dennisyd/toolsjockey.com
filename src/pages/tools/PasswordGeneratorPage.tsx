import React from 'react';
import { useEffect } from 'react';
import PasswordGenerator from '../../components/tools/PasswordGenerator';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { BoltIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const PasswordGeneratorPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Password Generator - ToolsJockey.com';
  }, []);

  useAnalytics(); // Automatically tracks page views and navigation

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