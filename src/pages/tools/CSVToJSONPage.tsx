import { useEffect } from 'react';
import CSVToJSONConverter from '../../components/tools/CSVToJSONConverter';
import { Link } from 'react-router-dom';

const related = [
  { title: 'Word to Markdown Converter', path: '/tools/word-to-markdown' },
  { title: 'Excel Sheet Joiner', path: '/tools/excel-merger-splitter' },
  { title: 'CSV Merger', path: '/tools/csv-merger' },
];

const CSVToJSONPage = () => {
  useEffect(() => {
    document.title = 'CSV to JSON Converter - ToolsJockey.com';
  }, []);

  return (
    <div className="container-app grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Breadcrumb */}
      <div className="md:col-span-12 mb-2 text-sm text-gray-500">
        <Link to="/">Home</Link> &gt; <span>Document & Data Tools</span> &gt; <b>CSV to JSON Converter</b>
      </div>
      {/* Sidebar */}
      <div className="hidden md:block md:col-span-3">
        <div className="bg-white dark:bg-primary-light rounded-lg p-4 mb-6">
          <div className="font-semibold mb-2">Other tools in this category</div>
          <ul className="text-sm space-y-1">
            <li><Link to="/tools/excel-merger-splitter" className="hover:underline">Excel Sheet Joiner</Link></li>
            <li><Link to="/tools/excel-merger-splitter" className="hover:underline">Excel Sheet Splitter</Link></li>
            <li><Link to="/tools/word-to-markdown" className="hover:underline">Word to Markdown Converter</Link></li>
            <li><Link to="/tools/csv-merger" className="hover:underline">CSV Merger</Link></li>
            <li><Link to="/tools/json-formatter" className="hover:underline">JSON Formatter/Validator</Link></li>
          </ul>
        </div>
        <div className="bg-white dark:bg-primary-light rounded-lg p-4">
          <div className="font-semibold mb-2">Related tools</div>
          <ul className="text-sm space-y-1">
            {related.map(t => (
              <li key={t.path}><Link to={t.path} className="hover:underline">{t.title}</Link></li>
            ))}
          </ul>
        </div>
      </div>
      {/* Main Content */}
      <div className="md:col-span-6">
        <CSVToJSONConverter />
      </div>
    </div>
  );
};

export default CSVToJSONPage; 