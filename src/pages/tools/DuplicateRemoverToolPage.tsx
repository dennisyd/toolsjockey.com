import { useEffect } from 'react';
import DuplicateRemoverTool from '../../components/tools/DuplicateRemoverTool';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { TableCellsIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const DuplicateRemoverToolPage = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  useEffect(() => {
    document.title = 'CSV/Excel Duplicate Remover - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="remove-duplicates"
      title="CSV/Excel Duplicate Remover"
      icon={TableCellsIcon}
      group="excelcsv"
      relatedTools={['column-filter', 'csv-to-json', 'csv-merger']}
    >
      <DuplicateRemoverTool />
    </ToolPageLayout>
  );
};

export default DuplicateRemoverToolPage; 