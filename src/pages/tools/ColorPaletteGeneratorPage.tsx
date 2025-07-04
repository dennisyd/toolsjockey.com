import React from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import ColorPaletteExtractorV2 from '../../components/tools/ColorPaletteExtractorV2';
import { EyeDropperIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const ColorPaletteGeneratorPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <ToolPageLayout
      toolId="color-palette-generator"
      title="Color Palette Generator"
      icon={EyeDropperIcon}
      group="color"
    >
      <ColorPaletteExtractorV2 />
    </ToolPageLayout>
  );
};

export default ColorPaletteGeneratorPage; 