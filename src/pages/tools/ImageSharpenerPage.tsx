import { useEffect } from 'react';
import ImageSharpenerUpscaler from '../../components/tools/ImageSharpener';
import { useAppStore } from '../../store/useAppStore';

const ImageSharpenerPage = () => {
  const { addRecentlyUsedTool } = useAppStore();
  
  useEffect(() => {
    // Add this tool to recently used tools
    addRecentlyUsedTool('image-sharpener');
    
    // Update page title for SEO
    document.title = 'Image Sharpener & Upscaler - ToolsJockey.com';
  }, [addRecentlyUsedTool]);
  
  return <ImageSharpenerUpscaler />;
};

export default ImageSharpenerPage; 