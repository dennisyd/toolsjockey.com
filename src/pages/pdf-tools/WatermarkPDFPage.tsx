import React, { useEffect } from 'react';
import WatermarkAdder from '../../components/tools/WatermarkAdder';
import PDFSuiteLayout from '../../components/layout/PDFSuiteLayout';

const WatermarkPDFPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Add Watermark to PDF – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Add styled text overlays to every page.');
  }, []);
  return (
    <PDFSuiteLayout title="Add Watermark to PDF">
      <WatermarkAdder />
    </PDFSuiteLayout>
  );
};

export default WatermarkPDFPage; 