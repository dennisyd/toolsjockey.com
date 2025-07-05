import React, { useState, useEffect } from 'react';
import { ReceiptPercentIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

interface PercentageCalculation {
  type: string;
  inputs: any;
  result: string;
  timestamp: Date;
}

const PercentageCalculatorPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [calculationType, setCalculationType] = useState<'percent-of' | 'percent-change' | 'percent-to-decimal' | 'decimal-to-percent'>('percent-of');
  const [value1, setValue1] = useState('');
  const [value2, setValue2] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<PercentageCalculation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Percentage Calculator – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Various percentage calculations and conversions.');
  }, []);

  const calculatePercentage = () => {
    if (!value1) {
      setError('Please enter a value');
      return;
    }

    try {
      const v1 = parseFloat(value1);
      const v2 = parseFloat(value2);

      if (isNaN(v1)) {
        throw new Error('Invalid number format');
      }

      let result = '';
      let calculation: PercentageCalculation;

      switch (calculationType) {
        case 'percent-of':
          if (!value2) {
            setError('Please enter both values');
            return;
          }
          if (isNaN(v2)) {
            throw new Error('Invalid second number');
          }
          const percentOf = (v1 / v2) * 100;
          result = `${v1} is ${percentOf.toFixed(2)}% of ${v2}`;
          calculation = {
            type: 'percent-of',
            inputs: { value1: v1, value2: v2 },
            result,
            timestamp: new Date()
          };
          break;

        case 'percent-change':
          if (!value2) {
            setError('Please enter both values');
            return;
          }
          if (isNaN(v2)) {
            throw new Error('Invalid second number');
          }
          const percentChange = ((v2 - v1) / v1) * 100;
          result = `Change from ${v1} to ${v2} is ${percentChange.toFixed(2)}%`;
          calculation = {
            type: 'percent-change',
            inputs: { value1: v1, value2: v2 },
            result,
            timestamp: new Date()
          };
          break;

        case 'percent-to-decimal':
          const decimal = v1 / 100;
          result = `${v1}% = ${decimal.toFixed(4)}`;
          calculation = {
            type: 'percent-to-decimal',
            inputs: { value1: v1 },
            result,
            timestamp: new Date()
          };
          break;

        case 'decimal-to-percent':
          const percent = v1 * 100;
          result = `${v1} = ${percent.toFixed(2)}%`;
          calculation = {
            type: 'decimal-to-percent',
            inputs: { value1: v1 },
            result,
            timestamp: new Date()
          };
          break;
      }

      setResult(result);
      setHistory(prev => [calculation!, ...prev.slice(0, 9)]);
      setError(null);
      trackButtonClick(`percent_calc_${calculationType}`, 'PercentageCalculator');
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
            <h1 className="text-3xl font-bold">Percentage Calculator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Various percentage calculations and conversions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Percentage Calculator</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Calculation Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'percent-of', label: 'Percent Of' },
                  { value: 'percent-change', label: 'Percent Change' },
                  { value: 'percent-to-decimal', label: '% to Decimal' },
                  { value: 'decimal-to-percent', label: 'Decimal to %' }
                ].map(type => (
                  <button
                    key={type.value}
                    onClick={() => setCalculationType(type.value as any)}
                    className={`p-2 rounded-lg border transition-colors ${
                      calculationType === type.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-gray-300 dark:border-gray-600 hover:border-accent'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {calculationType === 'percent-of' ? 'Value' : 
                   calculationType === 'percent-change' ? 'Original Value' :
                   calculationType === 'percent-to-decimal' ? 'Percentage' : 'Decimal'}
                </label>
                <input
                  type="number"
                  value={value1}
                  onChange={(e) => setValue1(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter value"
                  step="0.01"
                />
              </div>

              {(calculationType === 'percent-of' || calculationType === 'percent-change') && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {calculationType === 'percent-of' ? 'Total' : 'New Value'}
                  </label>
                  <input
                    type="number"
                    value={value2}
                    onChange={(e) => setValue2(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter second value"
                    step="0.01"
                  />
                </div>
              )}

              <button
                onClick={calculatePercentage}
                className="w-full bg-accent hover:bg-accent-dark text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CalculatorIcon className="w-5 h-5" />
                Calculate
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            {result && (
              <div className="mt-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Result:</h3>
                <p className="text-lg font-mono text-green-900 dark:text-green-100">{result}</p>
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
                      {calc.type === 'percent-of' ? 'Percent Of' :
                       calc.type === 'percent-change' ? 'Percent Change' :
                       calc.type === 'percent-to-decimal' ? 'Percent to Decimal' : 'Decimal to Percent'}
                    </div>
                    <div className="font-mono text-sm mb-1">
                      {calc.type === 'percent-of' || calc.type === 'percent-change' 
                        ? `${calc.inputs.value1} → ${calc.inputs.value2}`
                        : `${calc.inputs.value1}`
                      }
                    </div>
                    <div className="font-semibold text-green-600 dark:text-green-400">
                      {calc.result}
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
            <h3 className="text-lg font-semibold mb-3">Percentage Calculations</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Calculate percentage of total</li>
              <li>• Find percent change</li>
              <li>• Convert percent to decimal</li>
              <li>• Convert decimal to percent</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Common Uses</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Calculate discounts and markups</li>
              <li>• Determine growth rates</li>
              <li>• Convert between formats</li>
              <li>• Financial calculations</li>
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

export default PercentageCalculatorPage; 