import React from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import ImageCompressorV2 from '../../components/tools/ImageCompressorV2';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const ImageCompressorPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <ToolPageLayout
      toolId="image-compressor"
      title="Image Compressor - Reduce Image File Sizes Instantly"
      icon={PhotoIcon}
      group="image"
    >
      <ImageCompressorV2 />
    </ToolPageLayout>
  );
};

export default ImageCompressorPage; 