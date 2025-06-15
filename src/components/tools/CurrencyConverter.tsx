import React, { useState, useEffect } from 'react';

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
    <div className="bg-white dark:bg-primary-light rounded-lg p-6 shadow-md max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Currency Converter</h2>
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <input
          type="number"
          className="p-2 border rounded flex-1"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
        <div className="flex flex-col flex-1">
          <input
            type="text"
            className="p-1 border-b border-gray-300 mb-1 text-xs"
            placeholder="Search currency..."
            value={fromFilter}
            onChange={e => setFromFilter(e.target.value)}
          />
          <select value={from} onChange={e => setFrom(e.target.value)} className="p-2 border rounded w-full">
            {filteredFrom.map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleSwap}
          className="self-center p-2 rounded-full border hover:bg-gray-100 transition"
          aria-label="Swap currencies"
        >
          ↔
        </button>
        <div className="flex flex-col flex-1">
          <input
            type="text"
            className="p-1 border-b border-gray-300 mb-1 text-xs"
            placeholder="Search currency..."
            value={toFilter}
            onChange={e => setToFilter(e.target.value)}
          />
          <select value={to} onChange={e => setTo(e.target.value)} className="p-2 border rounded w-full">
            {filteredTo.map(cur => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>
      </div>
      {loading && <div className="text-accent text-sm mb-2">Loading...</div>}
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {usingFallback && !error && (
        <div className="text-xs text-yellow-600 mb-2">Using fallback rates (Frankfurter API)</div>
      )}
      {result !== null && (
        <div className="text-lg font-semibold mt-2">Result: {result} {to}</div>
      )}
    </div>
  );
};

export default CurrencyConverter;