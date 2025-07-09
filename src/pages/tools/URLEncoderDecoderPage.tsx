import { useEffect } from 'react';
import URLEncoderDecoder from '../../components/tools/URLEncoderDecoder';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { LinkIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const URLEncoderDecoderPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'URL Encoder/Decoder - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="url-encoder-decoder"
      title="URL Encoder/Decoder"
      icon={LinkIcon}
      group="developer"
    >
      <URLEncoderDecoder />
    </ToolPageLayout>
  );
};

export default URLEncoderDecoderPage; 