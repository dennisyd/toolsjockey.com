import React, { useState, useEffect } from 'react';
import { ReceiptPercentIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

interface TaxCalculation {
  income: number;
  deductions: number;
  taxableIncome: number;
  taxAmount: number;
  effectiveRate: number;
  timestamp: Date;
}

const TaxCalculatorPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [income, setIncome] = useState('');
  const [deductions, setDeductions] = useState('');
  const [taxableIncome, setTaxableIncome] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [effectiveRate, setEffectiveRate] = useState('');
  const [history, setHistory] = useState<TaxCalculation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Tax Calculator – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Basic tax calculations and deductions for various scenarios.');
  }, []);

  const calculateTax = () => {
    if (!income) {
      setError('Please enter your income');
      return;
    }

    try {
      const grossIncome = parseFloat(income);
      const deductionAmount = parseFloat(deductions) || 0;
      
      if (grossIncome < 0) {
        throw new Error('Income must be positive');
      }

      const taxableIncome = Math.max(0, grossIncome - deductionAmount);
      let taxAmount = 0;

      // Simplified tax brackets (2023 US Federal)
      if (taxableIncome <= 11000) {
        taxAmount = taxableIncome * 0.10;
      } else if (taxableIncome <= 44725) {
        taxAmount = 1100 + (taxableIncome - 11000) * 0.12;
      } else if (taxableIncome <= 95375) {
        taxAmount = 5147 + (taxableIncome - 44725) * 0.22;
      } else if (taxableIncome <= 182100) {
        taxAmount = 16290 + (taxableIncome - 95375) * 0.24;
      } else if (taxableIncome <= 231250) {
        taxAmount = 37104 + (taxableIncome - 182100) * 0.32;
      } else if (taxableIncome <= 578125) {
        taxAmount = 52832 + (taxableIncome - 231250) * 0.35;
      } else {
        taxAmount = 174238.25 + (taxableIncome - 578125) * 0.37;
      }

      const effectiveRate = (taxAmount / grossIncome) * 100;

      setTaxableIncome(taxableIncome.toFixed(2));
      setTaxAmount(taxAmount.toFixed(2));
      setEffectiveRate(effectiveRate.toFixed(2));

      const calculation: TaxCalculation = {
        income: grossIncome,
        deductions: deductionAmount,
        taxableIncome,
        taxAmount,
        effectiveRate,
        timestamp: new Date()
      };
      setHistory(prev => [calculation, ...prev.slice(0, 9)]);
      setError(null);
      trackButtonClick('tax_calc_calculate', 'TaxCalculator');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="container-app mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ReceiptPercentIcon className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Tax Calculator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Basic tax calculations and deductions for various scenarios.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tax Calculator</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Gross Income ($)</label>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter your gross income"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Deductions ($)</label>
                <input
                  type="number"
                  value={deductions}
                  onChange={(e) => setDeductions(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter total deductions"
                />
              </div>

              <button
                onClick={calculateTax}
                className="w-full bg-accent hover:bg-accent-dark text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CalculatorIcon className="w-5 h-5" />
                Calculate Tax
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            {(taxableIncome || taxAmount || effectiveRate) && (
              <div className="mt-6 space-y-3">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Results:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Taxable Income:</span>
                      <span className="font-mono font-semibold">${taxableIncome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Amount:</span>
                      <span className="font-mono font-semibold">${taxAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Effective Tax Rate:</span>
                      <span className="font-mono font-semibold">{effectiveRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Calculation History</h2>
            
            {history.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No calculations yet
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {history.map((calc, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      ${calc.income.toLocaleString()} income, ${calc.deductions.toLocaleString()} deductions
                    </div>
                    <div className="font-mono text-sm space-y-1">
                      <div>Taxable: ${calc.taxableIncome.toFixed(2)}</div>
                      <div>Tax: ${calc.taxAmount.toFixed(2)}</div>
                      <div className="text-green-600 dark:text-green-400">
                        Rate: {calc.effectiveRate.toFixed(2)}%
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {calc.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Tax Calculations</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Federal tax bracket calculations</li>
              <li>• Standard deduction support</li>
              <li>• Effective tax rate calculation</li>
              <li>• Simplified tax scenarios</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Financial Planning</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Estimate tax liability</li>
              <li>• Plan for tax season</li>
              <li>• Understand tax brackets</li>
              <li>• Calculate effective rates</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Privacy & Features</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• 100% client-side calculations</li>
              <li>• No data sent to servers</li>
              <li>• Calculation history</li>
              <li>• Works offline</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculatorPage; 