import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import DonationBanner from '../../components/layout/DonationBanner';
import { Helmet } from 'react-helmet';

const EXCEL_TOOLS = [
  { title: 'Excel Merger & Splitter', path: '/tools/excel-merger-splitter', desc: 'Combine or split Excel files with ease.' },
  { title: 'Excel to Formats Converter', path: '/tools/excel-to-formats', desc: 'Convert Excel to CSV, JSON, HTML, and more.' },
];

const CSV_TOOLS = [
  { title: 'CSV Merger', path: '/tools/csv-merger', desc: 'Combine multiple CSV files into one.' },
  { title: 'CSV to JSON', path: '/tools/csv-to-json', desc: 'Convert CSV data to JSON format.' },
  { title: 'Duplicate Remover', path: '/tools/remove-duplicates', desc: 'Remove duplicate rows from spreadsheets.' },
  { title: 'Column Filter', path: '/tools/column-filter', desc: 'Extract or remove specific columns from data.' },
];

const ExcelCsvToolsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Helmet>
        <title>Excel & CSV Tools - Free Online Spreadsheet Editor & Converter | ToolsJockey</title>
        <meta name="description" content="Free online Excel and CSV tools to merge, split, convert, and clean up spreadsheet data. No installation or signup required - all processing happens in your browser." />
      </Helmet>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Excel & CSV Tools – Merge, Convert & Process Spreadsheets Online</h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Excel Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {EXCEL_TOOLS.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="block p-4 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <h3 className="font-medium text-lg text-blue-700">{tool.title}</h3>
                  <p className="text-gray-600 mt-1">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">CSV Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CSV_TOOLS.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="block p-4 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <h3 className="font-medium text-lg text-blue-700">{tool.title}</h3>
                  <p className="text-gray-600 mt-1">{tool.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Why Use Our Excel & CSV Tools?</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li><span className="font-medium">100% Private:</span> All processing happens in your browser. Your data never leaves your device.</li>
              <li><span className="font-medium">No Excel Required:</span> Process Excel files without having Microsoft Office installed.</li>
              <li><span className="font-medium">Free to Use:</span> All spreadsheet tools are completely free.</li>
              <li><span className="font-medium">Fast Processing:</span> Get results instantly without waiting for uploads/downloads.</li>
              <li><span className="font-medium">Works Everywhere:</span> Compatible with Windows, Mac, Linux, iOS, and Android.</li>
            </ul>
          </div>
        </div>
      </main>
      <DonationBanner />
    </div>
  );
};

export default ExcelCsvToolsPage;
