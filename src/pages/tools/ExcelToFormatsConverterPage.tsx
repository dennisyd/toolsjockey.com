import React from 'react';
import ExcelToFormatsConverter from '../../components/tools/ExcelToFormatsConverter';

const ExcelToFormatsConverterPage: React.FC = () => (
  <div className="container-app max-w-4xl mx-auto p-4">
    <h1 className="text-3xl font-bold mb-2">Excel to Everything Converter</h1>
    <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-green-100 border border-green-400 text-green-800 font-semibold text-sm shadow-sm">
      <span role="img" aria-label="lock">🔒</span>
      100% Client-Side – No File Uploads
    </div>
    <ExcelToFormatsConverter />
  </div>
);

export default ExcelToFormatsConverterPage; 