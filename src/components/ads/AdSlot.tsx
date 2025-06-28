import { useEffect, useState } from 'react';

interface AdSlotProps {
  slot: 'header' | 'sidebar' | 'footer' | 'mobile' | 'interstitial' | 'native';
  size?: string;
  className?: string;
  children?: React.ReactNode;
}

const slotSizes: Record<string, string> = {
  header: '728x90',
  sidebar: '300x250',
  footer: '728x90',
  mobile: '320x50',
  interstitial: '100vw x 100vh',
  native: '100% x 120px',
};

const AdSlot = ({ slot, size, className = '', children }: AdSlotProps) => {
  const [adBlocked, setAdBlocked] = useState(false);

  useEffect(() => {
    // Simple ad-blocker detection: try to load a known ad class
    const bait = document.createElement('div');
    bait.className = 'adsbox';
    bait.style.position = 'absolute';
    bait.style.height = '1px';
    bait.style.width = '1px';
    bait.style.opacity = '0';
    document.body.appendChild(bait);
    setTimeout(() => {
      if (window.getComputedStyle(bait).display === 'none' || bait.offsetParent === null) {
        setAdBlocked(true);
      }
      document.body.removeChild(bait);
    }, 100);
  }, []);

  if (adBlocked) {
    return (
      <div className={`ad-slot ad-blocked ${className}`} style={{ minHeight: size || slotSizes[slot] }}>
        <div className="bg-gray-200 text-gray-500 text-center p-2 rounded">
          <span>We noticed you are using an ad blocker. Ads help keep ToolsJockey free. ❤️</span>
        </div>
      </div>
    );
  }

  // If children are provided, use them
  if (children) {
    return (
      <div className={`ad-slot ${className}`} style={{ minHeight: size || slotSizes[slot] }}>
        {children}
      </div>
    );
  }

  // Otherwise, show the custom content based on the slot size
  const currentSize = size || slotSizes[slot];
  
  // 300x250 style ad space
  if (currentSize === '300x250' || slot === 'sidebar') {
    return (
      <div className={`ad-slot ${className}`} style={{ minHeight: currentSize }}>
        <div className="feature-highlight bg-blue-50 border border-blue-200 dark:bg-primary-light dark:border-primary-dark rounded-lg p-4 text-center shadow-sm">
          <h3 className="font-bold text-lg text-blue-700 dark:text-blue-300">🔒 Your Privacy Guaranteed</h3>
          <p className="my-2 text-gray-700 dark:text-gray-300">All processing happens in your browser. Your files never leave your computer.</p>
          <small className="text-gray-500 dark:text-gray-400">Built by MIT-trained engineer</small>
        </div>
      </div>
    );
  }
  
  // 728x90 style ad space
  if (currentSize === '728x90' || slot === 'header' || slot === 'footer') {
    return (
      <div className={`ad-slot ${className}`} style={{ minHeight: currentSize }}>
        <div className="tools-preview bg-gradient-to-r from-purple-50 to-blue-50 dark:from-primary dark:to-primary-dark border border-blue-100 dark:border-primary-darker rounded-lg p-3 text-center">
          <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-1">Next-Level SaaS Tools — Launching Soon:</h4>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="tool-badge bg-white dark:bg-primary-light px-3 py-1 rounded-full text-sm shadow-sm">📚 PublishJockey</span>
            <span className="tool-badge bg-white dark:bg-primary-light px-3 py-1 rounded-full text-sm shadow-sm">✍️ WriteJockey</span>
            <span className="tool-badge bg-white dark:bg-primary-light px-3 py-1 rounded-full text-sm shadow-sm">🎯 Business Suite</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Other sizes - use a generic placeholder for now
  return (
    <div className={`ad-slot ${className}`} style={{ minHeight: currentSize }}>
      <div className="bg-gray-100 dark:bg-primary border border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 flex items-center justify-center h-full w-full rounded">
        <span>Tools coming soon</span>
      </div>
    </div>
  );
};

export default AdSlot; 