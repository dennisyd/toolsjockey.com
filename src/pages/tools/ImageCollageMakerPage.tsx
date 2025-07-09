import { useEffect } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { PhotoIcon } from '@heroicons/react/24/outline';
import ImageCollageMaker from '../../components/tools/ImageCollageMaker';
import { useAnalytics } from '../../hooks/useAnalytics';

const ImageCollageMakerPage = () => {
  useAnalytics();
  useEffect(() => {
    document.title = 'Image Collage Maker - ToolsJockey.com';
  }, []);
  return (
    <ToolPageLayout
      toolId="image-collage-maker"
      title="Image Collage Maker"
      icon={PhotoIcon}
      group="image"
    >
      <ImageCollageMaker />
    </ToolPageLayout>
  );
};

export default ImageCollageMakerPage; 