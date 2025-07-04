import { useEffect } from 'react';
import TextDiffViewer from '../../components/tools/TextDiffViewer';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const TextDiffViewerPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'Text Diff Viewer - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="text-diff"
      title="Text Diff Viewer"
      icon={CodeBracketIcon}
      group="developer"
      relatedTools={['regex-tester', 'json-formatter', 'markdown-table-generator']}
    >
      <TextDiffViewer />
    </ToolPageLayout>
  );
};

export default TextDiffViewerPage; 