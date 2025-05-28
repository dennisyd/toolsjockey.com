import { useEffect } from 'react';
import RegexTester from '../../components/tools/RegexTester';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

const RegexTesterPage = () => {
  useEffect(() => {
    document.title = 'Regex Tester - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="regex-tester"
      title="Regex Tester"
      icon={CodeBracketIcon}
      group="developer"
      relatedTools={['json-formatter', 'text-diff', 'markdown-table-generator']}
    >
      <RegexTester />
    </ToolPageLayout>
  );
};

export default RegexTesterPage; 