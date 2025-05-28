import { useEffect } from 'react';
import CSSMinifier from '../../components/tools/CSSMinifier';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CodeBracketIcon } from '@heroicons/react/24/outline';

const CSSMinifierPage = () => {
  useEffect(() => {
    document.title = 'CSS Minifier - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="css-minifier"
      title="CSS Minifier"
      icon={CodeBracketIcon}
      group="developer"
      relatedTools={['base64-encoder', 'hash-generator', 'json-formatter']}
    >
      <CSSMinifier />
    </ToolPageLayout>
  );
};

export default CSSMinifierPage; 