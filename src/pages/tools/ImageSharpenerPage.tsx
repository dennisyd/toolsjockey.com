import React from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import ImageSharpener from '../../components/tools/ImageSharpener';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const ImageSharpenerPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <ToolPageLayout
      toolId="image-sharpener"
      title="Image Sharpener/Upscaler"
      icon={PhotoIcon}
      group="image"
    >
      <ImageSharpener />
    </ToolPageLayout>
  );
};

export default ImageSharpenerPage; 