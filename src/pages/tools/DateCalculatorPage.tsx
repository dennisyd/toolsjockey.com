import React, { useState, useEffect } from 'react';
import { CalendarIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

interface DateCalculation {
  type: string;
  inputs: any;
  result: string;
  timestamp: Date;
}

const DateCalculatorPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [calculationType, setCalculationType] = useState<'difference' | 'add' | 'subtract'>('difference');
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [daysToAdd, setDaysToAdd] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<DateCalculation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [inclusive, setInclusive] = useState(true);

  useEffect(() => {
    document.title = 'Date Calculator – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Calculate date differences, add/subtract dates and time periods.');
  }, []);

  const calculateDifference = () => {
    if (!date1 || !date2) {
      setError('Please enter both dates');
      return;
    }

    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        throw new Error('Invalid date format');
      }

      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30.44);
      const diffYears = Math.floor(diffDays / 365.25);

      const result = `${diffDays} days (${diffWeeks} weeks, ${diffMonths} months, ${diffYears} years)`;
      setResult(result);

      const calculation: DateCalculation = {
        type: 'difference',
        inputs: { date1, date2 },
        result,
        timestamp: new Date()
      };
      setHistory(prev => [calculation, ...prev.slice(0, 9)]);
      setError(null);
      trackButtonClick('date_calc_difference', 'DateCalculator');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const calculateAdd = () => {
    if (!date1 || !daysToAdd) {
      setError('Please enter both date and days to add');
      return;
    }

    try {
      const d1 = new Date(date1);
      const days = parseInt(daysToAdd);
      
      if (isNaN(d1.getTime()) || isNaN(days)) {
        throw new Error('Invalid input');
      }

      const resultDate = new Date(d1);
      resultDate.setDate(d1.getDate() + days + (inclusive ? 1 : 0));
      
      const result = resultDate.toLocaleDateString();
      setResult(result);

      const calculation: DateCalculation = {
        type: 'add',
        inputs: { date1, daysToAdd, inclusive },
        result,
        timestamp: new Date()
      };
      setHistory(prev => [calculation, ...prev.slice(0, 9)]);
      setError(null);
      trackButtonClick('date_calc_add', 'DateCalculator');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const calculateSubtract = () => {
    if (!date1 || !daysToAdd) {
      setError('Please enter both date and days to subtract');
      return;
    }

    try {
      const d1 = new Date(date1);
      const days = parseInt(daysToAdd);
      
      if (isNaN(d1.getTime()) || isNaN(days)) {
        throw new Error('Invalid input');
      }

      const resultDate = new Date(d1);
      resultDate.setDate(d1.getDate() - days - (inclusive ? 1 : 0));
      
      const result = resultDate.toLocaleDateString();
      setResult(result);

      const calculation: DateCalculation = {
        type: 'subtract',
        inputs: { date1, daysToAdd, inclusive },
        result,
        timestamp: new Date()
      };
      setHistory(prev => [calculation, ...prev.slice(0, 9)]);
      setError(null);
      trackButtonClick('date_calc_subtract', 'DateCalculator');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCalculate = () => {
    switch (calculationType) {
      case 'difference':
        calculateDifference();
        break;
      case 'add':
        calculateAdd();
        break;
      case 'subtract':
        calculateSubtract();
        break;
    }
  };

  return (
    <div className="container-app mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CalendarIcon className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Date Calculator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Calculate date differences, add/subtract dates and time periods.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator */}
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Date Calculator</h2>
            
            {/* Calculation Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Calculation Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'difference', label: 'Difference' },
                  { value: 'add', label: 'Add Days' },
                  { value: 'subtract', label: 'Subtract Days' }
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

            {/* Inclusive/Exclusive Toggle */}
            {(calculationType === 'add' || calculationType === 'subtract') && (
              <div className="mb-4 flex items-center gap-3">
                <span className="text-sm font-medium">Counting Method:</span>
                <button
                  className={`px-3 py-1 rounded-l-lg border ${inclusive ? 'bg-accent text-white border-accent' : 'bg-white dark:bg-primary-light border-gray-300 dark:border-gray-600'}`}
                  onClick={() => setInclusive(true)}
                  type="button"
                >
                  Inclusive
                </button>
                <button
                  className={`px-3 py-1 rounded-r-lg border-l-0 border ${!inclusive ? 'bg-accent text-white border-accent' : 'bg-white dark:bg-primary-light border-gray-300 dark:border-gray-600'}`}
                  onClick={() => setInclusive(false)}
                  type="button"
                >
                  Exclusive
                </button>
              </div>
            )}

            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date 1</label>
                <input
                  type="date"
                  value={date1}
                  onChange={(e) => setDate1(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {calculationType === 'difference' ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Date 2</label>
                  <input
                    type="date"
                    value={date2}
                    onChange={(e) => setDate2(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Days to {calculationType === 'add' ? 'Add' : 'Subtract'}
                  </label>
                  <input
                    type="number"
                    value={daysToAdd}
                    onChange={(e) => setDaysToAdd(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Enter number of days"
                  />
                </div>
              )}

              <button
                onClick={handleCalculate}
                className="w-full bg-accent hover:bg-accent-dark text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CalculatorIcon className="w-5 h-5" />
                Calculate
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="mt-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Result:</h3>
                <p className="text-lg font-mono text-green-900 dark:text-green-100">{result}</p>
              </div>
            )}
          </div>

          {/* History */}
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
                      {calc.type === 'difference' ? 'Date Difference' : 
                       calc.type === 'add' ? 'Add Days' : 'Subtract Days'}
                    </div>
                    <div className="font-mono text-sm mb-1">
                      {calc.type === 'difference' 
                        ? `${calc.inputs.date1} → ${calc.inputs.date2}`
                        : `${calc.inputs.date1} ${calc.type === 'add' ? '+' : '-'} ${calc.inputs.daysToAdd} days`
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

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Date Difference</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Calculate days between dates</li>
              <li>• Shows weeks, months, years</li>
              <li>• Handles leap years</li>
              <li>• Absolute difference calculation</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Add/Subtract Days</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Add days to a date</li>
              <li>• Subtract days from a date</li>
              <li>• Automatic month/year rollover</li>
              <li>• Leap year handling</li>
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

export default DateCalculatorPage; 