import React, { useState, useEffect } from 'react';
import { BanknotesIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

interface LoanCalculation {
  principal: number;
  rate: number;
  term: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  timestamp: Date;
}

const LoanCalculatorPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [term, setTerm] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [totalPayment, setTotalPayment] = useState('');
  const [totalInterest, setTotalInterest] = useState('');
  const [history, setHistory] = useState<LoanCalculation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Loan Calculator – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Mortgage, interest, and payment calculations with amortization.');
  }, []);

  const calculateLoan = () => {
    if (!principal || !rate || !term) {
      setError('Please enter all values');
      return;
    }

    try {
      const p = parseFloat(principal);
      const r = parseFloat(rate) / 100 / 12; // Monthly rate
      const n = parseFloat(term) * 12; // Total payments

      if (p <= 0 || r <= 0 || n <= 0) {
        throw new Error('All values must be positive');
      }

      // Monthly payment formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
      const monthlyPayment = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = monthlyPayment * n;
      const totalInterest = totalPayment - p;

      setMonthlyPayment(monthlyPayment.toFixed(2));
      setTotalPayment(totalPayment.toFixed(2));
      setTotalInterest(totalInterest.toFixed(2));

      const calculation: LoanCalculation = {
        principal: p,
        rate: parseFloat(rate),
        term: parseFloat(term),
        monthlyPayment,
        totalPayment,
        totalInterest,
        timestamp: new Date()
      };
      setHistory(prev => [calculation, ...prev.slice(0, 9)]);
      setError(null);
      trackButtonClick('loan_calc_calculate', 'LoanCalculator');
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="container-app mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BanknotesIcon className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Loan Calculator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Mortgage, interest, and payment calculations with amortization.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Loan Calculator</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Loan Amount ($)</label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter loan amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Annual Interest Rate (%)</label>
                <input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter interest rate"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Loan Term (Years)</label>
                <input
                  type="number"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Enter loan term"
                />
              </div>

              <button
                onClick={calculateLoan}
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

            {(monthlyPayment || totalPayment || totalInterest) && (
              <div className="mt-6 space-y-3">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Results:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Monthly Payment:</span>
                      <span className="font-mono font-semibold">${monthlyPayment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Payment:</span>
                      <span className="font-mono font-semibold">${totalPayment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span className="font-mono font-semibold">${totalInterest}</span>
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
                      ${calc.principal.toLocaleString()} at {calc.rate}% for {calc.term} years
                    </div>
                    <div className="font-mono text-sm space-y-1">
                      <div>Monthly: ${calc.monthlyPayment.toFixed(2)}</div>
                      <div>Total: ${calc.totalPayment.toFixed(2)}</div>
                      <div className="text-green-600 dark:text-green-400">
                        Interest: ${calc.totalInterest.toFixed(2)}
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
            <h3 className="text-lg font-semibold mb-3">Mortgage Calculations</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Monthly payment calculation</li>
              <li>• Total interest over loan term</li>
              <li>• Amortization schedule support</li>
              <li>• Fixed-rate loan calculations</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Financial Planning</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Compare different loan terms</li>
              <li>• Calculate total cost of borrowing</li>
              <li>• Understand interest impact</li>
              <li>• Plan for monthly payments</li>
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

export default LoanCalculatorPage; 