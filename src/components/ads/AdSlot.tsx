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

  return (
    <div className={`ad-slot ${className}`} style={{ minHeight: size || slotSizes[slot] }}>
      {/* Placeholder for ad script or fallback */}
      {children || (
        <div className="bg-gray-100 border border-gray-300 text-gray-400 flex items-center justify-center h-full w-full rounded">
          <span>Ad Space ({slotSizes[slot]})</span>
        </div>
      )}
    </div>
  );
};

export default AdSlot; 