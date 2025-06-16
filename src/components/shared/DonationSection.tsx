import React from 'react';

const DonationSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-primary-light rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-yellow-500 mr-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Like this free tool?</h2>
      </div>
      <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
        If this tool saved you time or money, please consider supporting its development. Every bit helps keep privacy-focused tools free for everyone.
      </p>
      
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <a 
          href="https://www.paypal.com/donate" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <span className="mr-2">💳</span>
          PayPal $10
        </a>
        <a 
          href="https://www.paypal.com/donate" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <span className="mr-2">💳</span>
          PayPal $25
        </a>
        <a 
          href="https://www.paypal.com/donate" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <span className="mr-2">💳</span>
          PayPal Custom
        </a>
      </div>
      
      <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>Or send directly:</p>
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          <span className="flex items-center">
            <span className="mr-2">📱</span>
            CashApp $dennisyd
          </span>
          <span className="flex items-center">
            <span className="mr-2">💸</span>
            Zelle: dennisyd@gmail.com
          </span>
        </div>
      </div>
    </div>
  );
};

export default DonationSection; 