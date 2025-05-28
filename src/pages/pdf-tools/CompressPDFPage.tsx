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
      <main className="container-app mx-auto px-2 md:px-0 py-8">
        <h1 className="text-2xl font-bold mb-4">Compress PDF</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">This tool is not available. Client-side PDF compression is not currently supported.</p>
      </main>
    </PDFSuiteLayout>
  );
};

export default CompressPDFPage; 