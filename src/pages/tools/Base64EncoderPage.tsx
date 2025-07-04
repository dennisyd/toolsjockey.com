import { useEffect } from 'react';
import Base64Encoder from '../../components/tools/Base64Encoder';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { CodeBracketIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const Base64EncoderPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'Base64 Encoder/Decoder - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="base64-encoder"
      title="Base64 Encoder/Decoder"
      icon={CodeBracketIcon}
      group="developer"
      relatedTools={['hash-generator', 'css-minifier', 'json-formatter']}
    >
      <Base64Encoder />
    </ToolPageLayout>
  );
};

export default Base64EncoderPage; 