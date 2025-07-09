import { useEffect } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { PhotoIcon } from '@heroicons/react/24/outline';
import ImageCropper from '../../components/tools/ImageCropper';
import { useAnalytics } from '../../hooks/useAnalytics';

const ImageCropperPage = () => {
  useAnalytics();
  useEffect(() => {
    document.title = 'Image Cropper - ToolsJockey.com';
  }, []);
  return (
    <ToolPageLayout
      toolId="image-cropper"
      title="Image Cropper"
      icon={PhotoIcon}
      group="image"
    >
      <ImageCropper />
    </ToolPageLayout>
  );
};

export default ImageCropperPage; 