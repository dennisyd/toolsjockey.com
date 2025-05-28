import { useEffect } from 'react';
import CSVToJSONConverter from '../../components/tools/CSVToJSONConverter';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import { TableCellsIcon } from '@heroicons/react/24/outline';

const CSVToJSONPage = () => {
  useEffect(() => {
    document.title = 'CSV to JSON Converter - ToolsJockey.com';
  }, []);

  return (
    <ToolPageLayout
      toolId="csv-to-json"
      title="CSV to JSON Converter"
      icon={TableCellsIcon}
      group="excelcsv"
      relatedTools={['word-to-markdown', 'excel-merger-splitter', 'csv-merger']}
    >
      <CSVToJSONConverter />
    </ToolPageLayout>
  );
};

export default CSVToJSONPage; 