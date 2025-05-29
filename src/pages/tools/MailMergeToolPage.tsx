import { useEffect } from 'react';
import MailMergeTool from '../../components/tools/MailMergeTool';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

const MailMergeToolPage = () => {
  useEffect(() => {
    document.title = 'Mail Merge Tool - ToolsJockey.com';
  }, []);

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