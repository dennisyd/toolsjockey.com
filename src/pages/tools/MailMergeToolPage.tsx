import React from 'react';
import { useEffect } from 'react';
import MailMergeTool from '../../components/tools/MailMergeTool';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const MailMergeToolPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Mail Merge Tool - ToolsJockey.com';
  }, []);

  useAnalytics(); // Automatically tracks page views and navigation

  return (
    <ToolPageLayout
      toolId="mail-merge-tool"
      title="Mail Merge Tool"
      icon={DocumentDuplicateIcon}
      group="word"
      relatedTools={['batch-pdf-form-filler', 'markdown-table-generator', 'word-to-markdown']}
    >
      <MailMergeTool />
    </ToolPageLayout>
  );
};

export default MailMergeToolPage; 