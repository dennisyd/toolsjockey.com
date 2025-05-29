import React from 'react';

const DonationBanner: React.FC = () => (
  <div className="donation-options bg-blue-50 border border-blue-200 rounded-lg p-4 my-6 text-center">
    <h4 className="text-lg font-semibold mb-1">🙏 Like this free tool?</h4>
    <p className="mb-3 text-gray-700">If this tool saved you time or money, please consider supporting its development. Every bit helps keep privacy-focused tools free for everyone.</p>
    <div className="paypal-option flex flex-wrap justify-center gap-2 mb-2">
      <a href="https://paypal.me/ydennis/10" className="paypal-btn bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition" target="_blank" rel="noopener noreferrer">💳 PayPal $10</a>
      <a href="https://paypal.me/ydennis/25" className="paypal-btn bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition" target="_blank" rel="noopener noreferrer">💳 PayPal $25</a>
      <a href="https://paypal.me/ydennis" className="paypal-btn bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition" target="_blank" rel="noopener noreferrer">💳 PayPal Custom</a>
    </div>
    <div className="alternative-payments text-sm text-gray-600 mt-2">
      <p className="mb-1">Or send directly:</p>
      <a href="https://cash.app/$dennisyd" className="inline-block mr-2 text-green-700 hover:underline" target="_blank" rel="noopener noreferrer">📱 CashApp $dennisyd</a>
      <span className="inline-block">🏦 Zelle: <span className="font-mono">dennisyd@gmail.com</span></span>
    </div>
  </div>
);

export default DonationBanner; 