import { useEffect } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { PhotoIcon } from '@heroicons/react/24/outline';
import ImageDownscaler from '../../components/tools/ImageDownscaler';
import { useAnalytics } from '../../hooks/useAnalytics';

const ImageDownscalerPage = () => {
  useAnalytics();
  useEffect(() => {
    document.title = 'Image Downscaler - ToolsJockey.com';
  }, []);
  return (
    <ToolPageLayout
      toolId="image-downscaler"
      title="Image Downscaler"
      icon={PhotoIcon}
      group="image"
    >
      <ImageDownscaler />
    </ToolPageLayout>
  );
};

export default ImageDownscalerPage; 