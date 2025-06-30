import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import * as PDFLib from 'pdf-lib';

// Use local PDF.js worker instead of CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';
(window as any).pdfjsLib = pdfjsLib;
(window as any).PDFLib = PDFLib;

// Initialize the app with React
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Script to remove duplicate privacy badges
document.addEventListener('DOMContentLoaded', function() {
  // Function to remove duplicate privacy badges
  const removeDuplicateBadges = () => {
    // Find all elements that might be privacy badges
    const allBadges = document.querySelectorAll('.bg-blue-50');
    const privacyBadges: HTMLElement[] = [];
    
    // Filter to find only the privacy badges
    allBadges.forEach(function(badge) {
      if (badge.textContent && badge.textContent.includes('Your Privacy Guaranteed')) {
        privacyBadges.push(badge as HTMLElement);
      }
    });
    
    // If there's more than one, remove all but the first one
    if (privacyBadges.length > 1) {
      console.log('Found and removing duplicate privacy badges:', privacyBadges.length - 1);
      for (let i = 1; i < privacyBadges.length; i++) {
        const badge = privacyBadges[i];
        if (badge.parentElement) {
          badge.parentElement.removeChild(badge);
        }
      }
    }
  };

  // Run initially after a delay
  setTimeout(removeDuplicateBadges, 1000);
  
  // Also run when navigating between pages (React doesn't trigger DOMContentLoaded on navigation)
  const observer = new MutationObserver(() => {
    setTimeout(removeDuplicateBadges, 500);
  });
  
  // Start observing the document body for changes
  observer.observe(document.body, { childList: true, subtree: true });
});
