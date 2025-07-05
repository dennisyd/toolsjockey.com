import React, { useState, useEffect } from 'react';
import { CurrencyDollarIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

interface InvestmentCalculation {
  principal: number;
  rate: number;
  time: number;
  compoundFrequency: number;
  futureValue: number;
  totalInterest: number;
  roi: number;
  timestamp: Date;
}

const InvestmentCalculatorPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [time, setTime] = useState('');
  const [compoundFrequency, setCompoundFrequency] = useState('12'); // Monthly by default
  const [futureValue, setFutureValue] = useState('');
  const [totalInterest, setTotalInterest] = useState('');
  const [roi, setRoi] = useState('');
  const [history, setHistory] = useState<InvestmentCalculation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Investment Calculator – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Compound interest, ROI, and investment growth calculations.');
  }, []);

  const calculateInvestment = () => {
    if (!principal || !rate || !time) {
      setError('Please enter all values');
      return;
    }

    try {
      const p = parseFloat(principal);
      const r = parseFloat(rate) / 100;
      const t = parseFloat(time);
      const n = parseFloat(compoundFrequency);

      if (p <= 0 || r <= 0 || t <= 0 || n <= 0) {
        throw new Error('All values must be positive');
      }

      // Compound interest formula: A = P(1 + r/n)^(nt)
      const futureValue = p * Math.pow(1 + r / n, n * t);
      const totalInterest = futureValue - p;
      const roi = (totalInterest / p) * 100;

      setFutureValue(futureValue.toFixed(2));
      setTotalInterest(totalInterest.toFixed(2));
      setRoi(roi.toFixed(2));

      const calculation: InvestmentCalculation = {
        principal: p,
        rate: parseFloat(rate),
        time: t,
        compoundFrequency: n,
        futureValue,
        totalInterest,
        roi,
        timestamp: new Date()
      };
      setHistory(prev => [calculation, ...prev.slice(0, 9)]);
      setError(null);
      trackButtonClick('investment_calc_calculate', 'InvestmentCalculator');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="container-app mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CurrencyDollarIcon className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Investment Calculator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Compound interest, ROI, and investment growth calculations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Investment Calculator</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Initial Investment ($)</label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter initial investment"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Annual Interest Rate (%)</label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter annual interest rate"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Time Period (Years)</label>
                <input
                  type="number"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter time period"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Compound Frequency</label>
                <select
                  value={compoundFrequency}
                  onChange={(e) => setCompoundFrequency(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="1">Annually (1x per year)</option>
                  <option value="2">Semi-annually (2x per year)</option>
                  <option value="4">Quarterly (4x per year)</option>
                  <option value="12">Monthly (12x per year)</option>
                  <option value="365">Daily (365x per year)</option>
                </select>
              </div>

              <button
                onClick={calculateInvestment}
                className="w-full bg-accent hover:bg-accent-dark text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CalculatorIcon className="w-5 h-5" />
                Calculate Investment
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            {(futureValue || totalInterest || roi) && (
              <div className="mt-6 space-y-3">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Results:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Future Value:</span>
                      <span className="font-mono font-semibold">${futureValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span className="font-mono font-semibold">${totalInterest}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI:</span>
                      <span className="font-mono font-semibold">{roi}%</span>
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
                      ${calc.principal.toLocaleString()} at {calc.rate}% for {calc.time} years
                    </div>
                    <div className="font-mono text-sm space-y-1">
                      <div>Future Value: ${calc.futureValue.toFixed(2)}</div>
                      <div>Interest: ${calc.totalInterest.toFixed(2)}</div>
                      <div className="text-green-600 dark:text-green-400">
                        ROI: {calc.roi.toFixed(2)}%
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
            <h3 className="text-lg font-semibold mb-3">Compound Interest</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Future value calculation</li>
              <li>• Multiple compound frequencies</li>
              <li>• Total interest earned</li>
              <li>• ROI percentage</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Investment Planning</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Compare investment options</li>
              <li>• Plan for financial goals</li>
              <li>• Understand compound growth</li>
              <li>• Calculate returns</li>
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

export default InvestmentCalculatorPage; 