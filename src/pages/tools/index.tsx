import React from 'react';
import { Link } from 'react-router-dom';

const calculationTools = [
  { name: 'Scientific Calculator', path: '/tools/scientific-calculator' },
  { name: 'Date Calculator', path: '/tools/date-calculator' },
  { name: 'Loan Calculator', path: '/tools/loan-calculator' },
  { name: 'Tax Calculator', path: '/tools/tax-calculator' },
  { name: 'Percentage Calculator', path: '/tools/percentage-calculator' },
  { name: 'Statistics Calculator', path: '/tools/statistics-calculator' },
  { name: 'Investment Calculator', path: '/tools/investment-calculator' },
  { name: 'BMI Calculator', path: '/tools/bmi-calculator' },
];

const emailTools = [
  { name: 'Email Validator', path: '/tools/email-validator' },
  { name: 'Email Signature Generator', path: '/tools/email-signature-generator' },
  { name: 'Email Template Tester', path: '/tools/email-template-tester' },
  { name: 'Markdown to Email Converter', path: '/tools/markdown-to-email' },
];

const ToolsIndex: React.FC = () => {
  return (
    <div className="container-app mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Tools</h1>
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Calculation Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {calculationTools.map(tool => (
            <Link
              key={tool.path}
              to={tool.path}
              className="block bg-white dark:bg-primary-light rounded-lg shadow p-4 hover:bg-accent/10 border border-gray-200 dark:border-gray-700 transition-colors"
            >
              <span className="font-semibold text-lg">{tool.name}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Email Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {emailTools.map(tool => (
            <Link
              key={tool.path}
              to={tool.path}
              className="block bg-white dark:bg-primary-light rounded-lg shadow p-4 hover:bg-accent/10 border border-gray-200 dark:border-gray-700 transition-colors"
            >
              <span className="font-semibold text-lg">{tool.name}</span>
            </Link>
          ))}
        </div>
      </section>
      {/* ...other tool categories can be listed here... */}
    </div>
  );
};

export default ToolsIndex; 