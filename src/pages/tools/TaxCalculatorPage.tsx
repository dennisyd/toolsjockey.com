import React, { useState, useEffect } from 'react';
import { ReceiptPercentIcon, CalculatorIcon, BanknotesIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../../hooks/useAnalytics';

interface TaxCalculation {
  wages: number;
  interestIncome: number;
  dividendIncome: number;
  capitalGains: number;
  deductions: number;
  credits: number;
  stateTaxRate: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  totalTax: number;
  effectiveRate: number;
  afterTaxIncome: number;
  timestamp: Date;
}

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  baseTax: number;
}

const FEDERAL_BRACKETS_2024: TaxBracket[] = [
  { min: 0, max: 11600, rate: 0.10, baseTax: 0 },
  { min: 11600, max: 47150, rate: 0.12, baseTax: 1160 },
  { min: 47150, max: 100525, rate: 0.22, baseTax: 5423 },
  { min: 100525, max: 191950, rate: 0.24, baseTax: 16290 },
  { min: 191950, max: 243725, rate: 0.32, baseTax: 37104 },
  { min: 243725, max: 609350, rate: 0.35, baseTax: 52832 },
  { min: 609350, max: Infinity, rate: 0.37, baseTax: 174238.25 }
];

const CAPITAL_GAINS_BRACKETS = [
  { min: 0, max: 44725, rate: 0.0 },
  { min: 44725, max: 492300, rate: 0.15 },
  { min: 492300, max: Infinity, rate: 0.20 }
];

const TaxCalculatorPage: React.FC = () => {
  const { trackButtonClick } = useAnalytics();
  const [wages, setWages] = useState('');
  const [interestIncome, setInterestIncome] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dividendIncome, setDividendIncome] = useState('');
  const [capitalGains, setCapitalGains] = useState('');
  const [deductions, setDeductions] = useState('');
  const [credits, setCredits] = useState('');
  const [stateTaxRate, setStateTaxRate] = useState('');
  const [results, setResults] = useState<Partial<TaxCalculation> | null>(null);
  const [history, setHistory] = useState<TaxCalculation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Advanced Tax Calculator – ToolsJockey';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Advanced tax calculations with interest rates, multiple income sources, and comprehensive tax planning.');
  }, []);

  const calculateTaxBracket = (income: number, brackets: TaxBracket[]): number => {
    for (let i = brackets.length - 1; i >= 0; i--) {
      if (income > brackets[i].min) {
        return brackets[i].baseTax + (income - brackets[i].min) * brackets[i].rate;
      }
    }
    return 0;
  };

  const calculateCapitalGainsTax = (gains: number, totalIncome: number): number => {
    for (const bracket of CAPITAL_GAINS_BRACKETS) {
      if (totalIncome <= bracket.max) {
        return gains * bracket.rate;
      }
    }
    return gains * 0.20; // Top bracket
  };

  const calculateTax = () => {
    if (!wages && !interestIncome && !dividendIncome && !capitalGains) {
      setError('Please enter at least one income source');
      return;
    }

    try {
      const wagesAmount = parseFloat(wages) || 0;
      const interestAmount = parseFloat(interestIncome) || 0;
      const dividendAmount = parseFloat(dividendIncome) || 0;
      const gainsAmount = parseFloat(capitalGains) || 0;
      const deductionAmount = parseFloat(deductions) || 0;
      const creditAmount = parseFloat(credits) || 0;
      const stateRate = parseFloat(stateTaxRate) || 0;

      if (wagesAmount < 0 || interestAmount < 0 || dividendAmount < 0 || gainsAmount < 0) {
        throw new Error('Income amounts must be positive');
      }

      // Calculate total income
      const totalIncome = wagesAmount + interestAmount + dividendAmount + gainsAmount;
      const taxableIncome = Math.max(0, totalIncome - deductionAmount);

      // Calculate federal tax
      let federalTax = calculateTaxBracket(taxableIncome - gainsAmount, FEDERAL_BRACKETS_2024);
      federalTax += calculateCapitalGainsTax(gainsAmount, taxableIncome);

      // Apply credits
      federalTax = Math.max(0, federalTax - creditAmount);

      // Calculate state tax
      const stateTax = taxableIncome * (stateRate / 100);

      const totalTax = federalTax + stateTax;
      const effectiveRate = totalTax > 0 ? (totalTax / totalIncome) * 100 : 0;
      const afterTaxIncome = totalIncome - totalTax;

      const calculation: TaxCalculation = {
        wages: wagesAmount,
        interestIncome: interestAmount,
        dividendIncome: dividendAmount,
        capitalGains: gainsAmount,
        deductions: deductionAmount,
        credits: creditAmount,
        stateTaxRate: stateRate,
        taxableIncome,
        federalTax,
        stateTax,
        totalTax,
        effectiveRate,
        afterTaxIncome,
        timestamp: new Date()
      };

      setResults(calculation);
      setHistory(prev => [calculation, ...prev.slice(0, 9)]);
      setError(null);
      trackButtonClick('tax_calc_advanced', 'TaxCalculator');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const calculateInterestIncome = () => {
    if (!interestRate) {
      setError('Please enter an interest rate');
      return;
    }

    const rate = parseFloat(interestRate);
    if (rate <= 0 || rate > 100) {
      setError('Interest rate must be between 0 and 100');
      return;
    }

    // Calculate interest income based on a hypothetical investment
    const hypotheticalInvestment = 100000; // $100k example
    const interestAmount = (hypotheticalInvestment * rate) / 100;
    setInterestIncome(interestAmount.toFixed(2));
    setError(null);
  };

  const getTaxBracketInfo = (income: number): string => {
    for (const bracket of FEDERAL_BRACKETS_2024) {
      if (income <= bracket.max) {
        return `${bracket.rate * 100}% bracket ($${bracket.min.toLocaleString()} - $${bracket.max === Infinity ? '∞' : bracket.max.toLocaleString()})`;
      }
    }
    return '37% bracket (highest)';
  };

  return (
    <div className="container-app mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ReceiptPercentIcon className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold">Advanced Tax Calculator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive tax calculations with interest rates, multiple income sources, and tax planning.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Calculator */}
          <div className="lg:col-span-2 bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tax Calculator</h2>
            
            <div className="space-y-4">
              {/* Income Sources */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Wages/Salary ($)</label>
                  <input
                    type="number"
                    value={wages}
                    onChange={(e) => setWages(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Interest Income ($)</label>
                  <input
                    type="number"
                    value={interestIncome}
                    onChange={(e) => setInterestIncome(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Dividend Income ($)</label>
                  <input
                    type="number"
                    value={dividendIncome}
                    onChange={(e) => setDividendIncome(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Capital Gains ($)</label>
                  <input
                    type="number"
                    value={capitalGains}
                    onChange={(e) => setCapitalGains(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Interest Rate Calculator */}
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Interest Rate Calculator</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Interest rate %"
                    step="0.01"
                  />
                  <button
                    onClick={calculateInterestIncome}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Calculate
                  </button>
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  Calculates interest income based on a $100,000 investment
                </p>
              </div>

              {/* Deductions and Credits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Deductions ($)</label>
                  <input
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Standard deduction: $13,850"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tax Credits ($)</label>
                  <input
                    type="number"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* State Tax */}
              <div>
                <label className="block text-sm font-medium mb-2">State Tax Rate (%)</label>
                <input
                  type="number"
                  value={stateTaxRate}
                  onChange={(e) => setStateTaxRate(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="0"
                  step="0.01"
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

            {/* Results */}
            {results && (
              <div className="mt-6 space-y-4">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">Tax Results:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Income:</span>
                        <span className="font-mono font-semibold">${(results.wages! + results.interestIncome! + results.dividendIncome! + results.capitalGains!).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxable Income:</span>
                        <span className="font-mono font-semibold">${results.taxableIncome!.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Federal Tax:</span>
                        <span className="font-mono font-semibold">${results.federalTax!.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>State Tax:</span>
                        <span className="font-mono font-semibold">${results.stateTax!.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Tax:</span>
                        <span className="font-mono font-semibold text-red-600">${results.totalTax!.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Effective Tax Rate:</span>
                        <span className="font-mono font-semibold">{results.effectiveRate!.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>After-Tax Income:</span>
                        <span className="font-mono font-semibold text-green-600">${results.afterTaxIncome!.toFixed(2)}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getTaxBracketInfo(results.taxableIncome!)}
                      </div>
                    </div>
                  </div>
                </div>
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
                      ${calc.wages.toLocaleString()} wages
                    </div>
                    <div className="font-mono text-sm space-y-1">
                      <div>Tax: ${calc.totalTax.toFixed(2)}</div>
                      <div>Rate: {calc.effectiveRate.toFixed(2)}%</div>
                      <div className="text-green-600 dark:text-green-400">
                        Net: ${calc.afterTaxIncome.toFixed(2)}
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

        {/* Features Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BanknotesIcon className="w-5 h-5 text-accent" />
              Income Sources
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Wages and salary income</li>
              <li>• Interest income with rate calculator</li>
              <li>• Dividend income</li>
              <li>• Capital gains (different rates)</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-accent" />
              Tax Planning
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Federal and state tax calculations</li>
              <li>• Deductions and credits</li>
              <li>• Effective tax rate analysis</li>
              <li>• After-tax income planning</li>
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