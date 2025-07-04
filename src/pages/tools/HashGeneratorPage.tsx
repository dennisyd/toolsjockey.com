import React from 'react';
import { useEffect } from 'react';
import HashGenerator from '../../components/tools/HashGenerator';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CpuChipIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const HashGeneratorPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'Hash Generator - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="hash-generator"
      title="Hash Generator"
      icon={CpuChipIcon}
      group="developer"
    >
      <HashGenerator />
    </ToolPageLayout>
  );
};

export default HashGeneratorPage; 