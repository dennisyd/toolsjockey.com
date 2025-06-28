import React, { useState, useEffect } from 'react';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

const API_URL = 'https://api.exchangerate.host/latest';
const FALLBACK_API_URL = 'https://api.frankfurter.app/latest';

const CurrencyConverter: React.FC = () => {
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [exchangeRates, setExchangeRates] = useState<Record<string, Record<string, number>>>({});

  // Fetch currency list and rates
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setCurrencies(Object.keys(data.rates).sort());
        setLoading(false);
        setUsingFallback(false);
      })
      .catch(() => {
        // Try fallback API (Frankfurter)
        fetch(FALLBACK_API_URL)
          .then(res => {
            if (!res.ok) throw new Error();
            return res.json();
          })
          .then(data => {
            // Make sure base currency is included in the list
            const currencyList = [data.base, ...Object.keys(data.rates)]
              .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
              .sort();
            setCurrencies(currencyList);
            setLoading(false);
            setUsingFallback(true);
          })
          .catch(() => {
            setError('Failed to fetch currency data from both APIs.');
            setLoading(false);
          });
      });
  }, []);

  // Auto-convert on input change
  useEffect(() => {
    const convert = async () => {
      setError(null);
      setResult(null);
      const num = parseFloat(amount);
      if (isNaN(num)) {
        setResult(null);
        return;
      }
      if (from === to) {
        setResult(num.toString());
        return;
      }
      
      // Check if we already have cached rates
      if (exchangeRates[from]?.[to] && Date.now() - exchangeRates[from].timestamp < 3600000) {
        setResult((num * exchangeRates[from][to]).toFixed(4));
        return;
      }
      
      setLoading(true);
      try {
        let rate: number | null = null;
        if (!usingFallback) {
          // Try exchangerate.host
          const res = await fetch(`${API_URL}?base=${from}&symbols=${to}`);
          if (!res.ok) throw new Error("API request failed");
          const data = await res.json();
          if (data.rates && data.rates[to]) {
            rate = data.rates[to];
            // Cache the rate
            setExchangeRates(prev => ({
              ...prev,
              [from]: { ...prev[from], [to]: rate as number, timestamp: Date.now() }
            }));
          } else {
            throw new Error("Missing rate data");
          }
        } else {
          // Use Frankfurter API
          // The format should be: https://api.frankfurter.app/latest?from=USD&to=EUR
          const res = await fetch(`${FALLBACK_API_URL}?from=${from}&to=${to}`);
          if (!res.ok) throw new Error("Fallback API request failed");
          const data = await res.json();
          
          if (data.rates && data.rates[to]) {
            rate = data.rates[to];
            // Cache the rate
            setExchangeRates(prev => ({
              ...prev,
              [from]: { ...prev[from], [to]: rate as number, timestamp: Date.now() }
            }));
          } else {
            throw new Error("Missing rate data from fallback API");
          }
        }
        
        if (rate !== null) {
          setResult((num * rate).toFixed(4));
        }
      } catch (err) {
        setError(`Failed to fetch conversion rate: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      setLoading(false);
    };
    
    if (amount && from && to && currencies.length > 0) {
      convert();
    } else {
      setResult(null);
    }
    // eslint-disable-next-line
  }, [amount, from, to, usingFallback]);

  // Function to swap currencies
  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  // Filtered currency lists
  const filteredFrom = currencies.filter(cur => cur.toLowerCase().includes(fromFilter.toLowerCase()));
  const filteredTo = currencies.filter(cur => cur.toLowerCase().includes(toFilter.toLowerCase()));

  return (
    <div className="bg-white dark:bg-primary-light rounded-lg p-6 shadow-md">
      <h1 className="text-2xl font-bold mb-6">Currency Converter</h1>
      
      {/* Amount Input */}
      <div className="mb-6">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Amount
        </label>
        <input
          id="amount"
          type="number"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent dark:bg-primary-light"
          placeholder="Enter amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </div>
      
      {/* Currency Selection */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-6">
        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From Currency
          </label>
          <div className="relative">
            <div className="flex flex-col">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-t-lg focus:ring-2 focus:ring-accent focus:border-accent dark:bg-primary-light"
                  placeholder="Search currency..."
                  value={fromFilter}
                  onChange={e => setFromFilter(e.target.value)}
                />
              </div>
              <select 
                value={from} 
                onChange={e => setFrom(e.target.value)} 
                className="w-full p-3 border border-t-0 border-gray-300 dark:border-gray-600 rounded-b-lg focus:ring-2 focus:ring-accent focus:border-accent dark:bg-primary-light"
              >
                {filteredFrom.map(cur => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Swap Button */}
        <button 
          onClick={handleSwap}
          className="h-12 w-12 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-primary flex items-center justify-center transition-colors self-end mb-1"
          aria-label="Swap currencies"
        >
          <ArrowsRightLeftIcon className="h-5 w-5 text-accent" />
        </button>
        
        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To Currency
          </label>
          <div className="relative">
            <div className="flex flex-col">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-t-lg focus:ring-2 focus:ring-accent focus:border-accent dark:bg-primary-light"
                  placeholder="Search currency..."
                  value={toFilter}
                  onChange={e => setToFilter(e.target.value)}
                />
              </div>
              <select 
                value={to} 
                onChange={e => setTo(e.target.value)} 
                className="w-full p-3 border border-t-0 border-gray-300 dark:border-gray-600 rounded-b-lg focus:ring-2 focus:ring-accent focus:border-accent dark:bg-primary-light"
              >
                {filteredTo.map(cur => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status and Results */}
      <div className="mt-6">
        {loading && (
          <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-primary rounded-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent mr-2"></div>
            <span className="text-accent">Converting...</span>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {usingFallback && !error && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg mb-4">
            <p className="text-sm">Using fallback rates (Frankfurter API)</p>
          </div>
        )}
        
        {result !== null && (
          <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Converted Amount</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {result} {to}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              1 {from} = {(parseFloat(result) / parseFloat(amount)).toFixed(6)} {to}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;