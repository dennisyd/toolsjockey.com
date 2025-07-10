import React, { useEffect } from 'react';
import CSVToolMerger from '../../components/tools/CSVToolMerger';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { TableCellsIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

const CSVToolMergerPage: React.FC = () => {
  useEffect(() => {
    document.title = 'CSV Merger - ToolsJockey.com';
  }, []);

  useAnalytics(); // Automatically tracks page views and navigation

  return (
    <ToolPageLayout
      toolId="csv-merger"
      title="CSV Merger"
      icon={TableCellsIcon}
      group="excelcsv"
      relatedTools={['csv-to-json', 'word-to-markdown', 'excel-merger-splitter']}
    >
      <CSVToolMerger />
    </ToolPageLayout>
  );
};

export default CSVToolMergerPage; 