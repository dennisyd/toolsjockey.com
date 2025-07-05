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

const CalculationToolsPage: React.FC = () => {
  return (
    <div className="container-app mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Calculation Tools</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300 max-w-2xl">A suite of calculators for math, finance, health, and statistics. Choose a tool below to get started.</p>
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
    </div>
  );
};

export default CalculationToolsPage; 