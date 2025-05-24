import { useEffect } from 'react';
import ImageCompressorV2 from '../../components/tools/ImageCompressorV2';
import { useAppStore } from '../../store/useAppStore';

const ImageCompressorPage = () => {
  const { addRecentlyUsedTool } = useAppStore();
  
  useEffect(() => {
    // Add this tool to recently used tools
    addRecentlyUsedTool('image-compressor');
    
    // Update page title for SEO
    document.title = 'Image Compressor - ToolsJockey.com';
  }, [addRecentlyUsedTool]);
  
  return <ImageCompressorV2 />;
};

export default ImageCompressorPage; 