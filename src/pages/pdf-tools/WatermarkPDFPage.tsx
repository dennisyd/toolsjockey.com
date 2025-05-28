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
      <main className="container-app mx-auto px-2 md:px-0 py-8">
        <h1 className="text-2xl font-bold mb-4">Add Watermark to PDF</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Add styled text overlays to every page.</p>
        <WatermarkAdder />
      </main>
    </PDFSuiteLayout>
  );
};

export default WatermarkPDFPage; 