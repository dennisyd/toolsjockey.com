import { useEffect } from 'react';
import ExcelMergerSplitter from '../../components/tools/ExcelMergerSplitter';
import { useAppStore } from '../../store/useAppStore';

const ExcelMergerSplitterPage = () => {
  const { addRecentlyUsedTool } = useAppStore();
  
  useEffect(() => {
    addRecentlyUsedTool('excel-merger-splitter' as any);
    document.title = 'Excel Merger & Splitter - ToolsJockey.com';
  }, [addRecentlyUsedTool]);

  return <ExcelMergerSplitter />;
};

export default ExcelMergerSplitterPage; 