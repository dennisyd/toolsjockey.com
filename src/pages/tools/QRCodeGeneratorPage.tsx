import { useEffect } from 'react';
import QRCodeGeneratorV2 from '../../components/tools/QRCodeGeneratorV2';
import { useAppStore } from '../../store/useAppStore';

const QRCodeGeneratorPage = () => {
  const { addRecentlyUsedTool } = useAppStore();
  
  useEffect(() => {
    // Add this tool to recently used tools
    addRecentlyUsedTool('qr-code-generator');
    
    // Update page title for SEO
    document.title = 'QR Code Generator - ToolsJockey.com';
  }, [addRecentlyUsedTool]);
  
  return <QRCodeGeneratorV2 />;
};

export default QRCodeGeneratorPage; 