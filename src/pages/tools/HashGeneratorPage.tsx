import { useEffect } from 'react';
import HashGenerator from '../../components/tools/HashGenerator';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { KeyIcon } from '@heroicons/react/24/outline';

const HashGeneratorPage = () => {
  useEffect(() => {
    document.title = 'Hash Generator (MD5, SHA256) - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="hash-generator"
      title="Hash Generator (MD5, SHA256)"
      icon={KeyIcon}
      group="developer"
      relatedTools={['base64-encoder', 'css-minifier', 'json-formatter']}
    >
      <HashGenerator />
    </ToolPageLayout>
  );
};

export default HashGeneratorPage; 