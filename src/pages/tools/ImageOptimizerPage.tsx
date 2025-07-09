import { useEffect } from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { PhotoIcon } from '@heroicons/react/24/outline';
import ImageOptimizer from '../../components/tools/ImageOptimizer';
import { useAnalytics } from '../../hooks/useAnalytics';

const ImageOptimizerPage = () => {
  useAnalytics();
  useEffect(() => {
    document.title = 'Image Optimizer - ToolsJockey.com';
  }, []);
  return (
    <ToolPageLayout
      toolId="image-optimizer"
      title="Image Optimizer"
      icon={PhotoIcon}
      group="image"
    >
      <ImageOptimizer />
    </ToolPageLayout>
  );
};

export default ImageOptimizerPage; 