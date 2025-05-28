import { useEffect } from 'react';
import ExcelMergerSplitter from '../../components/tools/ExcelMergerSplitter';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { TableCellsIcon } from '@heroicons/react/24/outline';

const ExcelMergerSplitterPage = () => {
  useEffect(() => {
    document.title = 'Excel Merger & Splitter - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="excel-merger-splitter"
      title="Excel Merger & Splitter"
      icon={TableCellsIcon}
      group="excelcsv"
      relatedTools={['csv-merger', 'csv-to-json', 'word-to-markdown']}
    >
      <ExcelMergerSplitter />
    </ToolPageLayout>
  );
};

export default ExcelMergerSplitterPage; 