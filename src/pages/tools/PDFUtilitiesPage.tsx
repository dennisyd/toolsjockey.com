import { useEffect } from 'react';
import PDFUtilities from '../../components/tools/PDFUtilities';
import { useAppStore } from '../../store/useAppStore';

const PDFUtilitiesPage = () => {
  const { addRecentlyUsedTool } = useAppStore();
  
  useEffect(() => {
    addRecentlyUsedTool('pdf-utilities' as any);
    document.title = 'PDF Utilities - ToolsJockey.com';
  }, [addRecentlyUsedTool]);

  return <PDFUtilities />;
};

export default PDFUtilitiesPage; 