import React, { useState } from 'react';

const amounts = [5, 20, 50, 100];

interface DonationHandlerProps {
  title?: string;
  message?: string;
  onClose: () => void;
}

const DonationHandler: React.FC<DonationHandlerProps> = ({ 
  title = "Support Free Privacy Tools", 
  message = "If this tool saved you time or money, consider a donation. 100% goes to development & maintenance.", 
  onClose 
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState('');
  const [thankYou, setThankYou] = useState(false);

  const handleDonate = () => {
    // Placeholder: Integrate Stripe/PayPal here
    setThankYou(true);
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  if (thankYou) {
    return <div className="bg-green-50 border border-green-200 rounded p-4 text-green-800 text-center">Thank you for supporting free privacy tools! 💚</div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mt-8 text-center shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-lg">{title}</div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="text-gray-600 mb-4">{message}</div>
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