import React from 'react';
import { useEffect } from 'react';
import RegexTester from '../../components/tools/RegexTester';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CommandLineIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const RegexTesterPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'Regex Tester - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="regex-tester"
      title="Regular Expression Tester"
      icon={CommandLineIcon}
      group="developer"
    >
      <RegexTester />
    </ToolPageLayout>
  );
};

export default RegexTesterPage; 