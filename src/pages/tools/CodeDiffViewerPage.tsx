import { useEffect } from 'react';
import CodeDiffViewer from '../../components/tools/CodeDiffViewer';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const CodeDiffViewerPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'Code Diff Viewer - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="code-diff-viewer"
      title="Code Diff Viewer"
      icon={CodeBracketIcon}
      group="developer"
    >
      <CodeDiffViewer />
    </ToolPageLayout>
  );
};

export default CodeDiffViewerPage; 