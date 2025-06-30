import React, { useEffect } from 'react';
import PDFSuiteLayout from '../../components/layout/PDFSuiteLayout';

const CompressPDFPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Compress PDF – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Reduce file size using image re-encoding and metadata removal.');
  }, []);

  return (
    <PDFSuiteLayout title="Compress PDF">
      <p className="text-gray-600 dark:text-gray-300 mb-8">This tool is not available. Client-side PDF compression is not currently supported.</p>
    </PDFSuiteLayout>
  );
};

export default CompressPDFPage; 