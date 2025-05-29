import React, { useState } from 'react';

const amounts = [5, 20, 50, 100];

const DonationHandler: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [thankYou, setThankYou] = useState(false);

  const handleDonate = () => {
    // Placeholder: Integrate Stripe/PayPal here
    setThankYou(true);
  };

  if (thankYou) {
    return <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-center">Thank you for supporting free privacy tools! 💚</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-8 text-center shadow-sm">
      <div className="font-bold text-lg mb-1">Support Free Privacy Tools</div>
      <div className="text-gray-600 mb-2">If this tool saved you time or money, consider a donation.<br />100% goes to development & maintenance.</div>
      <div className="flex flex-wrap justify-center gap-2 mb-2">
        {amounts.map(a => (
          <button
            key={a}
            className={`px-4 py-2 rounded border ${selected === a ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} font-semibold`}
            onClick={() => { setSelected(a); setCustom(''); }}
          >
            ${a}
          </button>
        ))}
        <input
          type="number"
          min={1}
          placeholder="Custom"
          className="px-3 py-2 border rounded w-20"
          value={custom}
          onChange={e => { setCustom(e.target.value); setSelected(null); }}
        />
      </div>
      <button
        className="bg-green-600 text-white px-6 py-2 rounded font-bold mt-2"
        onClick={handleDonate}
        disabled={!selected && !custom}
      >
        Donate {selected ? `$${selected}` : custom ? `$${custom}` : ''}
      </button>
      <div className="text-xs text-gray-400 mt-2">Optional. Your support keeps this tool free for everyone.</div>
    </div>
  );
};

export default DonationHandler; 