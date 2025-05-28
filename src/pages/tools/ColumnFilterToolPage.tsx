import { useEffect } from 'react';
import ColumnFilterTool from '../../components/tools/ColumnFilterTool';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { TableCellsIcon } from '@heroicons/react/24/outline';

const ColumnFilterToolPage = () => {
  useEffect(() => {
    document.title = 'CSV/Excel Column Filter - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="column-filter"
      title="CSV/Excel Column Filter"
      icon={TableCellsIcon}
      group="excelcsv"
      relatedTools={['remove-duplicates', 'csv-to-json', 'csv-merger']}
    >
      <ColumnFilterTool />
    </ToolPageLayout>
  );
};

export default ColumnFilterToolPage; 