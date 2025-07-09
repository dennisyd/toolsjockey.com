import React from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../../hooks/useAnalytics';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import DonationBanner from '../../components/layout/DonationBanner';
import TickerTape from '../../components/TickerTape';
import { CalculatorIcon } from '@heroicons/react/24/outline';

const calculationTools = [
  { 
    name: 'Scientific Calculator', 
    path: '/tools/scientific-calculator',
    description: 'Advanced calculator with scientific functions, trigonometry, and more.'
  },
  { 
    name: 'Date Calculator', 
    path: '/tools/date-calculator',
    description: 'Calculate differences between dates, add/subtract time periods.'
  },
  { 
    name: 'Loan Calculator', 
    path: '/tools/loan-calculator',
    description: 'Calculate loan payments, interest, and amortization schedules.'
  },
  { 
    name: 'Tax Calculator', 
    path: '/tools/tax-calculator',
    description: 'Calculate income tax, deductions, and tax liability.'
  },
  { 
    name: 'Percentage Calculator', 
    path: '/tools/percentage-calculator',
    description: 'Calculate percentages, percentage change, and ratios.'
  },
  { 
    name: 'Statistics Calculator', 
    path: '/tools/statistics-calculator',
    description: 'Calculate mean, median, mode, standard deviation, and more.'
  },
  { 
    name: 'Investment Calculator', 
    path: '/tools/investment-calculator',
    description: 'Calculate compound interest, ROI, and investment growth.'
  },
  { 
    name: 'BMI Calculator', 
    path: '/tools/bmi-calculator',
    description: 'Calculate Body Mass Index and health recommendations.'
  },
];

const CalculationToolsPage: React.FC = () => {
  useAnalytics();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <TickerTape />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <CalculatorIcon className="w-16 h-16 text-accent" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Calculation Tools</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Professional calculators for mathematics, finance, health, and statistics. All calculations are performed client-side for privacy and speed.
            </p>
          </div>

          {/* Features Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>100% Client-side Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>No Data Collection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Professional Accuracy</span>
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {calculationTools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="group block bg-white dark:bg-primary-light rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                      <CalculatorIcon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold ml-3 group-hover:text-accent transition-colors">
                      {tool.name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {tool.description}
                  </p>
                </div>
                
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-accent font-medium group-hover:underline">
                    Open Calculator →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-3">About Calculation Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <h3 className="font-medium mb-2">Privacy & Security</h3>
                <p>All calculations are performed in your browser. No data is sent to servers, ensuring complete privacy for your financial and personal calculations.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Professional Accuracy</h3>
                <p>Built with precision algorithms and tested formulas to ensure accurate results for professional and personal use.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Wide Range of Tools</h3>
                <p>From basic arithmetic to complex financial calculations, statistics, and health metrics - all in one place.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Easy to Use</h3>
                <p>Intuitive interfaces with clear instructions and helpful tooltips to guide you through complex calculations.</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#ffe066] text-black font-semibold rounded-lg hover:bg-[#ffd633] transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
      <DonationBanner />
      <Footer />
    </div>
  );
};

export default CalculationToolsPage; 