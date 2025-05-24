import { useEffect } from 'react';
import ColorPaletteExtractorV2 from '../../components/tools/ColorPaletteExtractorV2';
import { useAppStore } from '../../store/useAppStore';

const ColorPaletteGeneratorPage = () => {
  const { addRecentlyUsedTool } = useAppStore();
  
  useEffect(() => {
    // Add this tool to recently used tools
    addRecentlyUsedTool('color-palette-generator');
    
    // Update page title for SEO
    document.title = 'Color Palette Generator - ToolsJockey.com';
  }, [addRecentlyUsedTool]);
  
  return <ColorPaletteExtractorV2 />;
};

export default ColorPaletteGeneratorPage; 