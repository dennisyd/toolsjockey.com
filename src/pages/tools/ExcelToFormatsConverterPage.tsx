import React from 'react';
import ToolPageLayout from '../../components/layout/ToolPageLayout';
import ExcelToFormatsConverter from '../../components/tools/ExcelToFormatsConverter';
import { useAnalytics } from '../../hooks/useAnalytics';
import { TableCellsIcon } from '@heroicons/react/24/outline';

const ExcelToFormatsConverterPage: React.FC = () => {
  useAnalytics(); // Automatically tracks page views and navigation
  
  return (
    <ToolPageLayout
      toolId="excel-to-formats"
      title="Excel to Everything Converter - Convert Excel Files"
      icon={TableCellsIcon}
      group="excelcsv"
    >
      <ExcelToFormatsConverter />
    </ToolPageLayout>
  );
};

export default ExcelToFormatsConverterPage; 